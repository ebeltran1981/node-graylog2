"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplacerHelper = /** @class */ (function () {
    function ReplacerHelper() {
    }
    ReplacerHelper.replaceError = function (key, value) {
        if (value instanceof Error) {
            var error_1 = {};
            Object.getOwnPropertyNames(value).forEach(function (k) {
                error_1[k] = value[k];
            });
            return error_1;
        }
        return value;
    };
    return ReplacerHelper;
}());
exports.ReplacerHelper = ReplacerHelper;
//# sourceMappingURL=replacer.helper.js.map