import { GraylogLevelEnum } from "./enums.model";
/**
 * Interface to send messages to Graylog. It contains the basic set of properties
 * but also the ability to have more properties on the fly.
 */
export interface IGraylogMessage {
    [key: string]: any;
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
export declare class GraylogMessage implements IGraylogMessage {
    [key: string]: any;
    short_message?: string;
    full_message?: string;
    version?: string;
    host?: string;
    level?: GraylogLevelEnum;
    exception?: string;
    readonly timestamp: number;
    constructor(data?: IGraylogMessage);
}
