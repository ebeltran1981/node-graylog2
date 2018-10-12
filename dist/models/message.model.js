"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Node modules
 */
var os_1 = __importDefault(require("os"));
var enums_model_1 = require("./enums.model");
/**
 * Implementation for the @type {IGraylogMessage}
 */
var GraylogMessage = /** @class */ (function () {
    function GraylogMessage(data) {
        var _this = this;
        if (!data) {
            data = {};
        }
        Object.keys(data).forEach(function (d) {
            if (data) {
                _this[d] = data[d];
            }
        });
        this.version = data.version || "1.1";
        this.timestamp = data.timestamp || new Date().getTime() / 1000;
        this.host = data.host || os_1.default.hostname();
        this.level = data.level || enums_model_1.GraylogLevelEnum.INFO;
        this.exception = data.exception;
    }
    return GraylogMessage;
}());
exports.GraylogMessage = GraylogMessage;
//# sourceMappingURL=message.model.js.map