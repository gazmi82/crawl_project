"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("./Constants");
var debug = require("debug");
var util = require("util");
var _debbuPrefix = Constants_1.default.MAIN_DEBUG_PREFIX + ":callstack";
var _logMethodCallDebug = debug(_debbuPrefix);
var MethodCallLogger;
(function (MethodCallLogger) {
    function currentMethodName(offset) {
        if (offset === void 0) { offset = 0; }
        var err = new Error();
        var methodName = err.stack.split('\n')[3 + offset].match(/(at )([\w|.]+)/)[2];
        return methodName;
    }
    MethodCallLogger.currentMethodName = currentMethodName;
    function logMethodCall() {
        var optionalParams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            optionalParams[_i] = arguments[_i];
        }
        _logMethodCallDebug(util.format.apply(util, __spreadArrays([currentMethodName()], optionalParams)));
    }
    MethodCallLogger.logMethodCall = logMethodCall;
})(MethodCallLogger || (MethodCallLogger = {}));
exports.default = MethodCallLogger;
