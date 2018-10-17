"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Node modules
 */
var zlib_1 = require("zlib");
var crypto_1 = require("crypto");
var dgram_1 = require("dgram");
var events_1 = require("events");
/**
 * Local modules
 */
var config_model_1 = require("./models/config.model");
var enums_model_1 = require("./models/enums.model");
var message_model_1 = require("./models/message.model");
var replacer_helper_1 = require("./helpers/replacer.helper");
/**
 * Graylog main class
 */
var Graylog = /** @class */ (function (_super) {
    __extends(Graylog, _super);
    function Graylog(config) {
        var _this = _super.call(this) || this;
        if (!config) {
            config = {};
        }
        _this.config = new config_model_1.GraylogConfig(config);
        _this._callCount = 0;
        _this._isDestroyed = false;
        _this._client = dgram_1.createSocket("udp4");
        return _this;
    }
    Graylog.prototype.getClient = function () {
        var _this = this;
        if (!this._client && !this._isDestroyed) {
            this._client = dgram_1.createSocket("udp4");
            this._client.on("error", function (err) {
                _this.emit("error", err);
            });
        }
        return this._client;
    };
    Graylog.prototype.getServer = function () {
        if (this.config.servers) {
            return this.config.servers[this._callCount++ % this.config.servers.length];
        }
        return new config_model_1.GraylogConfigServer();
    };
    Graylog.prototype.destroy = function () {
        if (this._client) {
            this._client.close();
            this._client.removeAllListeners();
            this._isDestroyed = true;
        }
    };
    Graylog.prototype.emergency = function (message, error, additionalFields, timestamp) {
        return this._log(message, error, additionalFields, enums_model_1.GraylogLevelEnum.EMERG, timestamp);
    };
    Graylog.prototype.alert = function (message, error, additionalFields, timestamp) {
        return this._log(message, error, additionalFields, enums_model_1.GraylogLevelEnum.ALERT, timestamp);
    };
    Graylog.prototype.critical = function (message, error, additionalFields, timestamp) {
        return this._log(message, error, additionalFields, enums_model_1.GraylogLevelEnum.CRIT, timestamp);
    };
    Graylog.prototype.error = function (message, error, additionalFields, timestamp) {
        return this._log(message, error, additionalFields, enums_model_1.GraylogLevelEnum.ERROR, timestamp);
    };
    Graylog.prototype.warning = function (message, error, additionalFields, timestamp) {
        return this._log(message, error, additionalFields, enums_model_1.GraylogLevelEnum.WARNING, timestamp);
    };
    Graylog.prototype.notice = function (message, additionalFields, timestamp) {
        return this._log(message, undefined, additionalFields, enums_model_1.GraylogLevelEnum.NOTICE, timestamp);
    };
    Graylog.prototype.info = function (message, additionalFields, timestamp) {
        return this._log(message, undefined, additionalFields, enums_model_1.GraylogLevelEnum.INFO, timestamp);
    };
    Graylog.prototype.debug = function (message, error, additionalFields, timestamp) {
        return this._log(message, error, additionalFields, enums_model_1.GraylogLevelEnum.DEBUG, timestamp);
    };
    Graylog.prototype.log = function (message, error, additionalFields) {
        return this._log(message, error, additionalFields, message.level);
    };
    Graylog.prototype._log = function (message, error, additionalFields, level, timestamp) {
        var payload;
        if (message) {
            if (!(message instanceof message_model_1.GraylogMessage)) {
                message = new message_model_1.GraylogMessage(message);
            }
        }
        else {
            message = new message_model_1.GraylogMessage({
                timestamp: timestamp,
                level: level
            });
        }
        if (error) {
            message.exception = JSON.stringify(error, replacer_helper_1.ReplacerHelper.replaceError);
        }
        // We insert additional fields
        if (additionalFields) {
            for (var key in additionalFields) {
                if (additionalFields.hasOwnProperty(key)) {
                    var element = additionalFields[key];
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
        }
        else {
            zlib_1.deflate(payload, this.sendPayload.bind(this));
        }
    };
    Graylog.prototype.sendPayload = function (err, buffer) {
        var _this = this;
        if (err) {
            return this.emitError(err);
        }
        // If it all fits, just send it
        if (this.config.bufferSize && buffer.length <= this.config.bufferSize) {
            var server = this.getServer();
            return this.send(buffer, server, undefined);
        }
        // It didn't fit, so prepare for a chunked stream
        if (this.config.bufferSize) {
            var bufferSize_1 = this.config.bufferSize;
            var dataSize_1 = bufferSize_1 - 12; // the data part of the buffer is the buffer size - header size
            var chunkCount_1 = Math.ceil(buffer.length / dataSize_1);
            if (chunkCount_1 > 128) {
                return this.emitError("Cannot log messages bigger than " + (dataSize_1 * 128) + " bytes");
            }
            // Generate a random id in buffer format
            crypto_1.randomBytes(8, function (err, id) {
                if (err) {
                    return _this.emitError(err);
                }
                // To be tested: what's faster, sending as we go or prebuffering?
                var server = _this.getServer();
                var chunk = new Buffer(bufferSize_1);
                var chunkSequenceNumber = 0;
                // Prepare the header
                // Set up magic number (bytes 0 and 1)
                chunk[0] = 30;
                chunk[1] = 15;
                // Set the total number of chunks (byte 11)
                chunk[11] = chunkCount_1;
                // Set message id (bytes 2-9)
                id.copy(chunk, 2, 0, 8);
                var send = function (err) {
                    if (err || chunkSequenceNumber >= chunkCount_1) {
                        // We have reached the end, or had an error (which will already have been emitted)
                        return;
                    }
                    // Set chunk sequence number (byte 10)
                    chunk[10] = chunkSequenceNumber;
                    // Copy data from full buffer into the chunk
                    var start = chunkSequenceNumber * dataSize_1;
                    var stop = Math.min((chunkSequenceNumber + 1) * dataSize_1, buffer.length);
                    buffer.copy(chunk, 12, start, stop);
                    chunkSequenceNumber++;
                    // Send the chunk
                    _this.send(chunk.slice(0, stop - start + 12), server, send);
                };
                send();
            });
        }
    };
    Graylog.prototype.send = function (chunk, server, cb) {
        var _this = this;
        var client = this.getClient();
        if (!client) {
            var error = new Error("Socket was already destroyed");
            this.emit("error", error);
            if (cb) {
                return cb(error);
            }
            return;
        }
        client.send(chunk, 0, chunk.length, server.port, server.host, function (err) {
            if (err) {
                _this.emit("error", err);
            }
            if (cb) {
                cb(err);
            }
        });
    };
    Graylog.prototype.emitError = function (err) {
        this.emit("error", err);
        console.error(err);
    };
    return Graylog;
}(events_1.EventEmitter));
exports.Graylog = Graylog;
//# sourceMappingURL=index.js.map