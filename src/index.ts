/**
 * Node modules
 */
import { deflate } from "zlib";
import { randomBytes } from "crypto";
import { createSocket } from "dgram";
import { inherits } from "util";
import { EventEmitter } from "events";
import assert from "assert";

/**
 * Local modules
 */
import { IGraylogConfig, GraylogConfig } from "./models/config.model";

/**
 * Graylog main class
 */
export class Graylog {
    constructor(config?: IGraylogConfig) {
        if (!config) {
            config = new GraylogConfig();
        }
    }
}
