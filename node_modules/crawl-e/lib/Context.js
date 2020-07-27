"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultContext = exports.cloneContext = exports.Resource = void 0;
var _ = require("underscore");
var MethodCallLogger_1 = require("./MethodCallLogger");
/**
 * An resource model that the framework may work on.
 */
var Resource;
(function (Resource) {
    Resource["CinemaList"] = "CinemaList";
    Resource["CinemaDetails"] = "CinemaDetails";
    Resource["MovieList"] = "MovieList";
    Resource["MovieDetails"] = "MovieDetails";
    Resource["DateList"] = "DateList";
    Resource["Showtimes"] = "Showtimes";
})(Resource = exports.Resource || (exports.Resource = {}));
/**
 * Clones a Context and sets the given context as parent of the clone.
 * The context should always be cloned befor passing it on, to avoid side effects.
 */
function cloneContext(context) {
    var childContext = _.clone(context);
    childContext.parentContext = context;
    childContext.indexes = JSON.parse(JSON.stringify(context.indexes));
    if (context.movie) {
        childContext.movie = _.clone(context.movie);
    }
    return childContext;
}
exports.cloneContext = cloneContext;
/**
 * Default implementation of the Context.
 *
 * @category Context
 */
var DefaultContext = /** @class */ (function () {
    function DefaultContext() {
        this.indexes = {};
        this.parentContext = null;
        this.warnings = null;
        this.callstack = [];
        this.currentTask = null;
        this.isTemporarilyClosed = false;
    }
    DefaultContext.prototype.addWarning = function (warning) {
        this.warnings = this.warnings || [];
        if (_.find(this.warnings, function (w) { return w.code = warning.code; }) === undefined) {
            this.warnings.push(warning);
        }
        if (this.parentContext) {
            this.parentContext.addWarning(warning);
        }
    };
    DefaultContext.prototype.trackCallstackAsync = function (callback) {
        var _this = this;
        this.pushCallstack(1); // offset for method name as this is another method call wrapped
        var callbackWrapper = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.popCallstack();
            callback.apply(void 0, args);
        };
        return callbackWrapper;
    };
    DefaultContext.prototype.pushCallstack = function (offset) {
        if (offset === void 0) { offset = 0; }
        this.callstack.push(MethodCallLogger_1.default.currentMethodName(offset));
    };
    DefaultContext.prototype.popCallstack = function () {
        this.callstack.pop();
    };
    return DefaultContext;
}());
exports.DefaultContext = DefaultContext;
