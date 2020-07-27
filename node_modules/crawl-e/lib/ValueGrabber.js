"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = require("./Logger");
var Constants_1 = require("./Constants");
var TemplaterEvaluator_1 = require("./TemplaterEvaluator");
/**
 * A ValueGrabber extracts a single or list of values from Cheerio HTML node by traversing it.
 *
 * @category HTML Parsing
 */
var ValueGrabber = /** @class */ (function () {
    function ValueGrabber(input, logger, logPrefix, fallbackMapper) {
        var _this = this;
        if (logger === void 0) { logger = new Logger_1.SilentLogger(); }
        if (logPrefix === void 0) { logPrefix = ''; }
        if (fallbackMapper === void 0) { fallbackMapper = undefined; }
        this.logger = logger;
        this.logPrefix = logPrefix;
        if (input instanceof ValueGrabber) {
            return input;
        }
        var grabber;
        if (!input) {
            grabber = {};
            this.grabAll = function (itemBox, context) {
                if (context === void 0) { context = null; }
                return [null];
            };
        }
        else if (input.constructor === Function) {
            this.grabAll = function (itemBox, context) {
                if (context === void 0) { context = null; }
                var grab = input;
                var value = grab(itemBox, context);
                _this.logger.debug(_this.logPrefix + ":value", "custom grabbed:", value);
                return Array.isArray(value) ? value : [value];
            };
            return;
        }
        else if (input.constructor === String) {
            grabber = ValueGrabber.parseShortHandle(input);
        }
        else {
            grabber = input;
        }
        this.selector = [undefined, Constants_1.default.BOX_SELECTOR].indexOf(grabber.selector) > -1
            ? null
            : grabber.selector;
        this.attribute = grabber.attribute || null;
        this.mapper = grabber.mapper || fallbackMapper || ValueGrabber.defaultMapper;
    }
    ValueGrabber.parseShortHandle = function (handle) {
        var parts = handle.split(' @');
        if (parts.length === 1 && handle.indexOf('@') > -1) {
            return {
                selector: null,
                attribute: handle.split('@').reverse()[0]
            };
        }
        return {
            selector: parts[0],
            attribute: parts[1] || null
        };
    };
    /**
     * Grabs matching values form within a given container node and it's children nodes.
     * @param container A cheerio container or box to search a value in.
     * @param context
     * @returns the grabbed value if only one found, an array of the values when multiple found or `null` if none found.
     */
    ValueGrabber.prototype.grab = function (container, context) {
        if (context === void 0) { context = null; }
        var values = this.grabAll(container, context);
        switch (values.length) {
            case 0: return null;
            case 1: return values[0];
            default: return values;
        }
    };
    /**
     * Grabs the first matching value form within a given container node and it's children nodes.
     * @param container A cheerio container or box to search a value in.
     * @param context
     * @returns the first value that was found or `null` if none
     */
    ValueGrabber.prototype.grabFirst = function (container, context) {
        if (context === void 0) { context = null; }
        return this.grabAll(container, context)[0] || null;
    };
    /**
     * Grabs all matching values form within a given container node and it's children nodes.
     * @param container A cheerio container or box to search a value in.
     * @param context
     * @returns An array of the values that where found.
     */
    ValueGrabber.prototype.grabAll = function (container, context) {
        var _this = this;
        if (context === void 0) { context = null; }
        var values = [];
        var selector = this.selector || Constants_1.default.BOX_SELECTOR;
        selector.split(',').forEach(function (subSelector) {
            subSelector = TemplaterEvaluator_1.default.evaluate(subSelector, context);
            var valueBox = subSelector === Constants_1.default.BOX_SELECTOR
                ? container
                : container.find(subSelector);
            if (context && _this.logger) {
                _this.logger.debug(_this.logPrefix + ":box", "selected (" + subSelector + "): %s", context.cheerio.html(valueBox).trim());
            }
            switch (valueBox.length) {
                case 0:
                    _this.logger.debug(_this.logPrefix + ":box", "selected (" + (_this.selector || Constants_1.default.BOX_SELECTOR) + "): <box not found>");
                    break;
                case 1:
                    values.push(_this.grabValue(valueBox, context));
                    break;
                default:
                    valueBox.each(function (index, elem) {
                        values.push(_this.grabValue(context.cheerio(elem), context));
                    });
                    break;
            }
        });
        return values;
    };
    ValueGrabber.prototype.grabValue = function (box, context) {
        var rawValue;
        switch (this.attribute) {
            case null:
                rawValue = box.text();
                break;
            case 'html()':
                rawValue = context.cheerio.html(box);
                break;
            case 'ownText()':
                rawValue = box.contents().filter(function (index, element) { return element.type === 'text'; }).text();
                break;
            default:
                rawValue = box.attr(this.attribute);
                break;
        }
        var grabbing = this.attribute ? "attribute " + this.attribute : "text()";
        this.logger.debug(this.logPrefix + ":value", "grabbing " + grabbing + ":", rawValue);
        var result;
        if (rawValue !== undefined && this.mapper) {
            var mappedValue = this.mapper(rawValue, context);
            this.logger.debug(this.logPrefix + ":value", "mapped:", mappedValue);
            result = mappedValue;
        }
        else {
            result = rawValue;
        }
        if (typeof result === 'string') {
            return result.replace(/\s+/g, ' ');
        }
        return result || null;
    };
    ValueGrabber.defaultMapper = function (value) { return value.trim(); };
    return ValueGrabber;
}());
exports.default = ValueGrabber;
