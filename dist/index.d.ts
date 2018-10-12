/// <reference types="node" />
import { EventEmitter } from "events";
/**
 * Local modules
 */
import { IGraylogConfig } from "./models/config.model";
import { IGraylogMessage } from "./models/message.model";
/**
 * Graylog main class
 */
export declare class Graylog extends EventEmitter {
    private _callCount;
    private _isDestroyed;
    private _client;
    readonly config: IGraylogConfig;
    constructor(config?: IGraylogConfig);
    private getClient;
    private getServer;
    destroy(): void;
    emergency(message: IGraylogMessage, error: Error, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    alert(message: IGraylogMessage, error: Error, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    critical(message: IGraylogMessage, error: Error, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    error(message: IGraylogMessage, error: Error, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    warning(message: IGraylogMessage, error: Error, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    notice(message: IGraylogMessage, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    info(message: IGraylogMessage, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    debug(message: IGraylogMessage, error?: Error, additionalFields?: {
        [x: string]: string;
    }, timestamp?: number): void;
    log(message: IGraylogMessage, error?: Error, additionalFields?: {
        [x: string]: string;
    }): void;
    private _log;
    private sendPayload;
    private send;
    private emitError;
}
