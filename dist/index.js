"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Local modules
 */
var config_model_1 = require("./models/config.model");
/**
 * Graylog main class
 */
var Graylog = /** @class */ (function () {
    function Graylog(config) {
        if (!config) {
            config = new config_model_1.GraylogConfig();
        }
    }
    return Graylog;
}());
exports.Graylog = Graylog;
//# sourceMappingURL=index.js.map