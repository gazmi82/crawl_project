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
exports.AuditoriumParser = void 0;
var BaseParser_1 = require("./BaseParser");
/**
 * @category HTML Parsing
 */
var AuditoriumParser = /** @class */ (function (_super) {
    __extends(AuditoriumParser, _super);
    function AuditoriumParser() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.contextKey = 'auditorium';
        _this.logPrefix = 'auditoria';
        return _this;
    }
    /** parses a single auditorium title from a box and adds it to the context */
    AuditoriumParser.prototype.parse = function (auditoriumBox, auditoriumConfig, context) {
        context.auditorium = this.resovleValueGrabber('auditorium', auditoriumConfig).grabFirst(auditoriumBox, context);
    };
    return AuditoriumParser;
}(BaseParser_1.BaseParser));
exports.AuditoriumParser = AuditoriumParser;
