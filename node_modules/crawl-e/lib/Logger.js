"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerProxy = exports.SilentLogger = exports.DefaultLogger = void 0;
var debug = require("debug");
var util = require("util");
var colors = require("colors");
var _ = require("underscore");
var Constants_1 = require("./Constants");
/** @private */
var LOG_STYLES = {
    emoji: {
        warn: '⚠️ ',
        error: '❗️ '
    },
    short: {
        warn: 'W:',
        error: 'E:'
    },
    long: {
        warn: 'WARNING:',
        error: 'ERROR:'
    }
};
/**
 * Default Logger class. Logs as following:
 * - debug →   the [debug](https://github.com/visionmedia/debug) package. See [Debug Logs](http://crawl-e.internal.cinepass.de/#/basics/debug-logs) in the framework documentation.
 * - info →    `console.log()` in default color
 * - warning → `console.log()` in yellow color
 * - error →   `console.log()` in red color
 */
var DefaultLogger = /** @class */ (function () {
    function DefaultLogger() {
        this.logStyle = LOG_STYLES.emoji;
    }
    /**
     * Logs a message via the debug module
     * @param debugPrefix prefix for the debug module
     * @param msg
     */
    DefaultLogger.prototype.debug = function (debugPrefix) {
        var msg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            msg[_i - 1] = arguments[_i];
        }
        debugPrefix = _.compact([Constants_1.default.MAIN_DEBUG_PREFIX, debugPrefix]).join(':');
        debug(debugPrefix).apply(void 0, msg);
    };
    DefaultLogger.prototype.info = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        console.info(util.format.apply(util, __spreadArrays([message], optionalParams)));
    };
    DefaultLogger.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        console.warn(colors.yellow(this.logStyle.warn), colors.yellow(util.format.apply(util, __spreadArrays([message], optionalParams))));
    };
    DefaultLogger.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        console.error(colors.red(this.logStyle.error), colors.red(util.format.apply(util, __spreadArrays([message], optionalParams))));
    };
    return DefaultLogger;
}());
exports.DefaultLogger = DefaultLogger;
/**
 * Placeholder Logger implemenation that actually logs nothing.
 */
var SilentLogger = /** @class */ (function () {
    function SilentLogger() {
    }
    SilentLogger.prototype.debug = function (debugPrefix, msg) { };
    SilentLogger.prototype.info = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
    };
    SilentLogger.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
    };
    SilentLogger.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
    };
    return SilentLogger;
}());
exports.SilentLogger = SilentLogger;
/**
 * Object to bridges a reference to a logger, so that the underlying logger can be changed anywhere for all usages.
 */
var LoggerProxy = /** @class */ (function () {
    function LoggerProxy(logger) {
        this.logger = logger || new SilentLogger();
    }
    LoggerProxy.prototype.debug = function (name, message) {
        var _a;
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        (_a = this.logger).debug.apply(_a, __spreadArrays([name, message], optionalParams));
    };
    LoggerProxy.prototype.info = function (message) {
        var _a;
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        (_a = this.logger).info.apply(_a, __spreadArrays([message], optionalParams));
    };
    LoggerProxy.prototype.warn = function (message) {
        var _a;
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        (_a = this.logger).warn.apply(_a, __spreadArrays([message], optionalParams));
    };
    LoggerProxy.prototype.error = function (message) {
        var _a;
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        (_a = this.logger).error.apply(_a, __spreadArrays([message], optionalParams));
    };
    return LoggerProxy;
}());
exports.LoggerProxy = LoggerProxy;
