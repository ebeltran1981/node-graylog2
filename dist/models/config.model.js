"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = __importDefault(require("os"));
var GraylogConfig = /** @class */ (function () {
    function GraylogConfig(data) {
        var _this = this;
        this.DEFAULT_BUFFERSIZE = 1400;
        if (!data) {
            data = {};
        }
        this.servers = [];
        if (data.servers) {
            data.servers.forEach(function (server) {
                _this.servers.push(new GraylogConfigServer(server));
            });
        }
        else {
            this.servers.push(new GraylogConfigServer());
        }
        this.hostname = data.hostname || os_1.default.hostname();
        this.deflate = data.deflate || "optimal";
        this.bufferSize = data.bufferSize || this.DEFAULT_BUFFERSIZE;
    }
    return GraylogConfig;
}());
exports.GraylogConfig = GraylogConfig;
var GraylogConfigServer = /** @class */ (function () {
    function GraylogConfigServer(data) {
        this.DEFAULT_PORT = 12201;
        if (!data) {
            data = {};
        }
        this.host = data.host || this.getLocalIP();
        this.port = data.port || this.DEFAULT_PORT;
    }
    GraylogConfigServer.prototype.getLocalIP = function () {
        var interfaces = os_1.default.networkInterfaces();
        var ip;
        Object.keys(interfaces).forEach(function (i) {
            ip = i;
        });
        return ip;
    };
    return GraylogConfigServer;
}());
exports.GraylogConfigServer = GraylogConfigServer;
//# sourceMappingURL=config.model.js.map