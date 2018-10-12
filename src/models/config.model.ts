import os from "os";

export interface IGraylogConfig {
    servers?: IGraylogConfigServer[];
    hostname?: string;
    deflate?: "optimal" | "always" | "never";
    bufferSize?: number;
}

export class GraylogConfig implements IGraylogConfig {
    private DEFAULT_BUFFERSIZE = 1400;

    servers: IGraylogConfigServer[];
    hostname: string;
    deflate: "optimal" | "always" | "never";
    bufferSize: number;

    constructor(data?: IGraylogConfig) {
        if (!data) {
            data = {} as IGraylogConfig;
        }

        this.servers = [];
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

export interface IGraylogConfigServer {
    host: string;
    port: number;
}

export class GraylogConfigServer implements IGraylogConfigServer {
    private DEFAULT_PORT = 12201;

    host: string;
    port: number;

    constructor(data?: IGraylogConfigServer) {
        if (!data) {
            data = {} as IGraylogConfigServer;
        }

        this.host = data.host || this.getLocalIP();
        this.port = data.port || this.DEFAULT_PORT;
    }

    private getLocalIP(): string {
        const interfaces = os.networkInterfaces();
        let ip: string;
        Object.keys(interfaces).forEach(i => {
            ip = i;
        });
        return ip;
    }
}
