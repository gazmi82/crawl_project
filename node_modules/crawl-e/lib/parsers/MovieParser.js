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
exports.MovieParser = void 0;
var MethodCallLogger_1 = require("../MethodCallLogger");
var Utils_1 = require("../Utils");
var BaseParser_1 = require("./BaseParser");
/**
 * @category HTML Parsing
 */
var MovieParser = /** @class */ (function (_super) {
    __extends(MovieParser, _super);
    function MovieParser(logger, versionParser) {
        var _this = _super.call(this, logger) || this;
        _this.versionParser = versionParser;
        _this.contextKey = 'movie';
        return _this;
    }
    MovieParser.prototype.parse = function (movieBox, parsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        parsingConfig.title = parsingConfig.movieTitle || parsingConfig.title;
        parsingConfig.titleOriginal = parsingConfig.movieTitleOriginal || parsingConfig.titleOriginal;
        this.parsingConfig = parsingConfig;
        context.movie = {};
        context.movie.id = this.grabProperty('id', movieBox, context);
        context.movie.title = this.grabProperty('title', movieBox, context);
        context.movie.titleOriginal = this.grabProperty('titleOriginal', movieBox, context);
        context.movie.href = this.grabProperty('href', movieBox, context);
        context.movie = Utils_1.default.compactObj(context.movie);
        context.movie.version = this.versionParser.parse(movieBox, parsingConfig, context);
        this.logger.debug("movies:result", context.movie);
        context.popCallstack();
        return context.movie;
    };
    return MovieParser;
}(BaseParser_1.BaseParser));
exports.MovieParser = MovieParser;
