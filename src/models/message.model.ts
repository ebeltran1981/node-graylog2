/**
 * Node modules
 */
import os from "os";
import { GraylogLevelEnum } from "./enums.model";

/**
 * Interface to send messages to Graylog. It contains the basic set of properties
 * but also the ability to have more properties on the fly.
 */
export interface IGraylogMessage {
    [key: string]: any; // for properties on the fly
    short_message?: string;
    full_message?: string;
    host?: string;
    version?: string;
    level?: GraylogLevelEnum;
    exception?: string;
    readonly timestamp?: number;
}

/**
 * Implementation for the @type {IGraylogMessage}
 */
export class GraylogMessage implements IGraylogMessage {
    [key: string]: any;
    short_message?: string;
    full_message?: string;
    version?: string;
    host?: string;
    level?: GraylogLevelEnum;
    exception?: string;
    readonly timestamp: number;

    constructor(data?: IGraylogMessage) {
        if (!data) {
            data = {} as IGraylogMessage;
        }

        Object.keys(data).forEach(d => {
            if (data) {
                this[d] = data[d];
            }
        });

        this.version = data.version || "1.1";
        this.timestamp = data.timestamp || new Date().getTime() / 1000;
        this.host = data.host || os.hostname();
        this.level = data.level || GraylogLevelEnum.INFO;
        this.exception = data.exception;
    }
}