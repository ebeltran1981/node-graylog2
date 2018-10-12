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
export declare class GraylogConfig implements IGraylogConfig {
    private DEFAULT_BUFFERSIZE;
    readonly servers: Array<IGraylogConfigServer>;
    readonly hostname: string;
    readonly deflate: "optimal" | "always" | "never";
    readonly bufferSize: number;
    constructor(data?: IGraylogConfig);
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
export declare class GraylogConfigServer implements IGraylogConfigServer {
    private DEFAULT_HOST;
    private DEFAULT_PORT;
    readonly host: string;
    readonly port: number;
    constructor(data?: IGraylogConfigServer);
}
