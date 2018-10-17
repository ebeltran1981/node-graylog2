/**
 * Node modules
 */
import { deflate } from "zlib";
import { randomBytes } from "crypto";
import { createSocket, Socket } from "dgram";
import { EventEmitter } from "events";

/**
 * Local modules
 */
import { IGraylogConfig, GraylogConfig, IGraylogConfigServer, GraylogConfigServer } from "./models/config.model";
import { GraylogLevelEnum } from "./models/enums.model";
import { GraylogMessage, IGraylogMessage } from "./models/message.model";
import { ReplacerHelper } from "./helpers/replacer.helper";

/**
 * Graylog main class
 */
export class Graylog extends EventEmitter {
    // Private
    private _callCount: number;
    private _isDestroyed: boolean;
    private _client: Socket;

    // Public
    readonly config: IGraylogConfig;

    constructor(config?: IGraylogConfig) {
        super();

        if (!config) {
            config = {};
        }

        this.config = new GraylogConfig(config);
        this._callCount = 0;

        this._isDestroyed = false;
        this._client = createSocket("udp4");
    }

    private getClient(): Socket {
        if (!this._client && !this._isDestroyed) {
            this._client = createSocket("udp4");

            this._client.on("error", (err) => {
                this.emit("error", err);
            });
        }

        return this._client;
    }

    private getServer(): IGraylogConfigServer {
        if (this.config.servers) {
            return this.config.servers[this._callCount++ % this.config.servers.length];
        }
        return new GraylogConfigServer();
    }

    destroy() {
        if (this._client) {
            this._client.close();
            this._client.removeAllListeners();
            this._isDestroyed = true;
        }
    }

    emergency(message: IGraylogMessage, error: Error, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, error, additionalFields, GraylogLevelEnum.EMERG, timestamp);
    }

    alert(message: IGraylogMessage, error: Error, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, error, additionalFields, GraylogLevelEnum.ALERT, timestamp);
    }

    critical(message: IGraylogMessage, error: Error, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, error, additionalFields, GraylogLevelEnum.CRIT, timestamp);
    }

    error(message: IGraylogMessage, error: Error, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, error, additionalFields, GraylogLevelEnum.ERROR, timestamp);
    }

    warning(message: IGraylogMessage, error: Error, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, error, additionalFields, GraylogLevelEnum.WARNING, timestamp);
    }

    notice(message: IGraylogMessage, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, undefined, additionalFields, GraylogLevelEnum.NOTICE, timestamp);
    }

    info(message: IGraylogMessage, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, undefined, additionalFields, GraylogLevelEnum.INFO, timestamp);
    }

    debug(message: IGraylogMessage, error?: Error, additionalFields?: { [x: string]: string }, timestamp?: number) {
        return this._log(message, error, additionalFields, GraylogLevelEnum.DEBUG, timestamp);
    }

    log(message: IGraylogMessage, error?: Error, additionalFields?: { [x: string]: string }) {
        return this._log(message, error, additionalFields, message.level);
    }

    private _log(message: IGraylogMessage, error?: Error, additionalFields?: { [x: string]: string }, level?: GraylogLevelEnum, timestamp?: number) {
        let payload;

        if (message) {
            if (!(message instanceof GraylogMessage)) {
                message = new GraylogMessage(message);
            }
        } else {
            message = new GraylogMessage({
                timestamp: timestamp,
                level: level
            });
        }

        if (error) {
            message.exception = JSON.stringify(error, ReplacerHelper.replaceError);
        }

        // We insert additional fields
        if (additionalFields) {
            for (const key in additionalFields) {
                if (additionalFields.hasOwnProperty(key)) {
                    const element = additionalFields[key];
                    message["_" + key] = JSON.stringify(element);
                }
            }
        }

        // https://github.com/Graylog2/graylog2-docs/wiki/GELF
        if (message._id) {
            message.__id = message._id;
            delete message._id;
        }

        // Compression
        payload = new Buffer(JSON.stringify(message));

        if (this.config.deflate === "never" || (this.config.bufferSize && this.config.deflate === "optimal" && payload.length <= this.config.bufferSize)) {
            this.sendPayload(undefined, payload);
        } else {
            deflate(payload, this.sendPayload.bind(this));
        }
    }

    private sendPayload(err: any, buffer: Buffer) {
        if (err) {
            return this.emitError(err);
        }

        // If it all fits, just send it
        if (this.config.bufferSize && buffer.length <= this.config.bufferSize) {
            const server = this.getServer();
            return this.send(buffer, server, undefined);
        }

        // It didn't fit, so prepare for a chunked stream
        if (this.config.bufferSize) {
            const bufferSize = this.config.bufferSize;
            const dataSize = bufferSize - 12;  // the data part of the buffer is the buffer size - header size
            const chunkCount = Math.ceil(buffer.length / dataSize);

            if (chunkCount > 128) {
                return this.emitError("Cannot log messages bigger than " + (dataSize * 128) + " bytes");
            }

            // Generate a random id in buffer format
            randomBytes(8, (err, id) => {
                if (err) {
                    return this.emitError(err);
                }

                // To be tested: what's faster, sending as we go or prebuffering?
                const server = this.getServer();
                const chunk = new Buffer(bufferSize);
                let chunkSequenceNumber = 0;

                // Prepare the header

                // Set up magic number (bytes 0 and 1)
                chunk[0] = 30;
                chunk[1] = 15;

                // Set the total number of chunks (byte 11)
                chunk[11] = chunkCount;

                // Set message id (bytes 2-9)
                id.copy(chunk, 2, 0, 8);

                const send = (err?: any) => {
                    if (err || chunkSequenceNumber >= chunkCount) {
                        // We have reached the end, or had an error (which will already have been emitted)
                        return;
                    }

                    // Set chunk sequence number (byte 10)
                    chunk[10] = chunkSequenceNumber;

                    // Copy data from full buffer into the chunk
                    const start = chunkSequenceNumber * dataSize;
                    const stop = Math.min((chunkSequenceNumber + 1) * dataSize, buffer.length);

                    buffer.copy(chunk, 12, start, stop);

                    chunkSequenceNumber++;

                    // Send the chunk
                    this.send(chunk.slice(0, stop - start + 12), server, send);
                };

                send();
            });
        }
    }

    private send(chunk: Buffer | string | Uint8Array, server: IGraylogConfigServer, cb?: (error: Error | null, bytes?: number) => void) {
        const client = this.getClient();

        if (!client) {
            const error = new Error("Socket was already destroyed");

            this.emit("error", error);
            if (cb) {
                return cb(error);
            }
            return;
        }

        client.send(chunk, 0, chunk.length, server.port, server.host, (err) => {
            if (err) {
                this.emit("error", err);
            }

            if (cb) {
                cb(err);
            }
        });
    }

    private emitError(err: any) {
        this.emit("error", err);
        console.error(err);
    }
}
