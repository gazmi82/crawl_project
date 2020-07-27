"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = void 0;
var ConfigError = /** @class */ (function (_super) {
    __extends(ConfigError, _super);
    function ConfigError(message, subError) {
        var _newTarget = this.constructor;
        if (message === void 0) { message = null; }
        if (subError === void 0) { subError = null; }
        var _this = this;
        var errMessage = message || subError.message;
        _this = _super.call(this, message) || this; // 'Error' breaks prototype chain here
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain
        _this.name = 'ConfigError';
        _this.subError = subError;
        return _this;
    }
    return ConfigError;
}(TypeError));
exports.ConfigError = ConfigError;
