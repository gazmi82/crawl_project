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
exports.VersionParser = void 0;
var _ = require("underscore");
var MethodCallLogger_1 = require("../MethodCallLogger");
var LanguageParser_1 = require("./LanguageParser");
var ValueGrabber_1 = require("../ValueGrabber");
var BaseParser_1 = require("./BaseParser");
/**
 * Parses showitmes version details such as `is3d`, `isImax` or arbitrary `attributes`.
 * @category HTML Parsing
 */
var VersionParser = /** @class */ (function (_super) {
    __extends(VersionParser, _super);
    function VersionParser(logger) {
        var _this = _super.call(this, logger) || this;
        _this.contextKey = 'version';
        _this.languageParser = new LanguageParser_1.LanguageParser(_this.logger);
        return _this;
    }
    /**
     * Parses version details from a HTML box and merges them into the given context's `version` property.
     * @param dateBox
     * @param parsingConfig
     * @param context
     * @returns the merged version object as in the context after the parsing
     */
    VersionParser.prototype.parse = function (box, parsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        var version = __assign(__assign({}, this.languageParser.parse(box, parsingConfig, context)), { attributes: this.parseAttributesArray(box, parsingConfig, context), is3d: this.parseIs3dFlag(box, parsingConfig, context), isImax: this.parseIsImaxFlag(box, parsingConfig, context) });
        context.version = __assign(__assign(__assign({}, (context.movie || {}).version), context.version), version);
        context.popCallstack();
        return context.version;
    };
    /**
     * Parses a list of attributes from a HTML box.
     *
     * Hint: It does not add attributes into the given context.
     * @param box
     * @param parsingConfig
     * @param context the current context, which may have already some attributes set
     * @returns the parsed attributes merged with attribute from the given context if any present
     */
    VersionParser.prototype.parseAttributesArray = function (box, parsingConfig, context) {
        var attributes = context.version.attributes;
        if (parsingConfig.attributes) {
            var valueGrabber = new ValueGrabber_1.default(parsingConfig.attributes, this.logger, this.valueGrabberLogPrefix('attributes'));
            var grabbedattributes = valueGrabber.grab(box, context);
            attributes = _.chain([grabbedattributes])
                .union(attributes)
                .flatten()
                .compact()
                .value();
        }
        return attributes;
    };
    VersionParser.prototype.parseIs3dFlag = function (box, parsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        var flag = this.parseFlag({ key: 'is3d', regex: /\b3D\b/i }, box, parsingConfig, context);
        context.popCallstack();
        return flag;
    };
    VersionParser.prototype.parseIsImaxFlag = function (box, parsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        var flag = this.parseFlag({ key: 'isImax', regex: /\bIMAX\b/i }, box, parsingConfig, context);
        context.popCallstack();
        return flag;
    };
    VersionParser.prototype.parseFlag = function (flag, box, parsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        if (parsingConfig[flag.key]) {
            var valueGrabber = new ValueGrabber_1.default(parsingConfig[flag.key], this.logger, this.valueGrabberLogPrefix(flag.key));
            var flagValue = valueGrabber.grab(box, context);
            if (typeof flagValue === 'boolean') {
                return flagValue;
            }
            if (typeof flagValue === 'string') {
                return flag.regex.test(flagValue);
            }
        }
        if (_.has(context.version, flag.key)) {
            return context.version[flag.key];
        }
        if (context.movie && context.movie[flag.key] === true) {
            return true;
        }
        if (context.movie) {
            return flag.regex.test(context.movie.title);
        }
        return undefined;
    };
    return VersionParser;
}(BaseParser_1.BaseParser));
exports.VersionParser = VersionParser;
