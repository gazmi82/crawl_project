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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageParser = void 0;
var Utils_1 = require("../Utils");
var BaseParser_1 = require("./BaseParser");
/** @private */
var trimmingWrapper = function (mapper) { return function (text) { return mapper(text.trim()); }; };
/**
 * Parser for `language` and `subtitles`.
 * @category HTML Parsing
 */
var LanguageParser = /** @class */ (function (_super) {
    __extends(LanguageParser, _super);
    function LanguageParser() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.contextKey = 'version';
        return _this;
    }
    /**
     * Parses a HTML box and language & subtitles into the given context's `version` property.
     * @param box
     * @param config
     * @param context the context which to set the language details on
     * @returns the parsed language details
     */
    LanguageParser.prototype.parse = function (box, config, context) {
        this.resolveValueGrabbers(config);
        var languageDetails = Utils_1.default.compactObj({
            language: config.language.grab(box, context),
            subtitles: config.subtitles.grab(box, context)
        });
        context.version = __assign(__assign({}, languageDetails), context.version);
        return languageDetails;
    };
    /** @private */
    LanguageParser.prototype.resolveValueGrabbers = function (config) {
        config.language = this.resovleValueGrabber('language', config, trimmingWrapper(Utils_1.default.mapLanguage));
        config.subtitles = this.resovleValueGrabber('subtitles', config, trimmingWrapper(Utils_1.default.mapSubtitles));
    };
    return LanguageParser;
}(BaseParser_1.BaseParser));
exports.LanguageParser = LanguageParser;
