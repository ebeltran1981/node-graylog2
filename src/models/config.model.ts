import os from "os";

/**
 * Interface to provide the config object required by the main
 * Graylog object to start working
 */
export interface IGraylogConfig {
    readonly servers?: Array<IGraylogConfigServer>;
    readonly hostname?: string;
    readonly deflate?: "optimal" | "always" | "never";
    readonly bufferSize?: number;
}

/**
 * Implementation for the @type {IGraylogConfig} interface.
 */
export class GraylogConfig implements IGraylogConfig {
    private DEFAULT_BUFFERSIZE = 1400;

    readonly servers: Array<IGraylogConfigServer>;
    readonly hostname: string;
    readonly deflate: "optimal" | "always" | "never";
    readonly bufferSize: number;

    constructor(data?: IGraylogConfig) {
        if (!data) {
            data = {} as IGraylogConfig;
        }

        this.servers = new Array<IGraylogConfigServer>();
        if (data.servers) {
            data.servers.forEach(server => {
                this.servers.push(new GraylogConfigServer(server));
            });
        } else {
            this.servers.push(new GraylogConfigServer());
        }

        this.hostname = data.hostname || os.hostname();
        this.deflate = data.deflate || "optimal";
        this.bufferSize = data.bufferSize || this.DEFAULT_BUFFERSIZE;
    }
}

/**
 * Interface to provide the required properties for the server object
 */
export interface IGraylogConfigServer {
    readonly host: string;
    readonly port: number;
}

/**
 * Implementation for the @type {IGraylogConfigServer} interface.
 */
export class GraylogConfigServer implements IGraylogConfigServer {
    private DEFAULT_HOST = "127.0.0.1";
    private DEFAULT_PORT = 12201;

    readonly host: string;
    readonly port: number;

    constructor(data?: IGraylogConfigServer) {
        if (!data) {
            data = {} as IGraylogConfigServer;
        }

        this.host = data.host || this.DEFAULT_HOST;
        this.port = data.port || this.DEFAULT_PORT;
    }
}
