"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
var ValueGrabber_1 = require("../ValueGrabber");
/**
 * Base class to implement a Parser for extracting data from boxes.
 * It may parse single values or object data.
 *
 * @category HTML Parsing
 */
var BaseParser = /** @class */ (function () {
    function BaseParser(logger) {
        this.logger = logger;
    }
    /**
     * Parses a single / first value from the given box.
     * @param key
     * @param box
     * @param context
     * @returns the value that was grabbed & evtl. mapped using the ValueGrabbing's mapper.
     * @protected
     */
    BaseParser.prototype.grabProperty = function (key, box, context) {
        return this.resovleValueGrabber(key, this.parsingConfig).grabFirst(box, context);
    };
    /**
     * Find or created a ValueGrabber form the parsingConfig at the given key, which must container a `ValueGrabbing`
     * @param key
     * @param parsingConfig
     * @param mapper
     * @protected
     */
    BaseParser.prototype.resovleValueGrabber = function (key, parsingConfig, mapper) {
        return new ValueGrabber_1.default(parsingConfig[key], this.logger, this.valueGrabberLogPrefix(key), mapper);
    };
    /** @private */
    BaseParser.prototype.valueGrabberLogPrefix = function (key) {
        return [this.logPrefix || this.contextKey, 'selection', key].join(':');
    };
    return BaseParser;
}());
exports.BaseParser = BaseParser;
