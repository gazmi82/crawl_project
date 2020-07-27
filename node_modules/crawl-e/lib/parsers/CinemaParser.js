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
exports.CinemaParser = void 0;
var MethodCallLogger_1 = require("../MethodCallLogger");
var Utils_1 = require("../Utils");
var ValueGrabber_1 = require("../ValueGrabber");
var BaseParser_1 = require("./BaseParser");
/**
 * @category HTML Parsing
 */
var CinemaParser = /** @class */ (function (_super) {
    __extends(CinemaParser, _super);
    function CinemaParser() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.logPrefix = "cinemas";
        return _this;
    }
    /**
     * Parses a single cinema from a box
     * @returns a cinema object with it's parsed properties
     */
    CinemaParser.prototype.parseCinema = function (cinemaBox, cinemaParsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        this.logPrefix = context.listName;
        this.parsingConfig = cinemaParsingConfig;
        if (cinemaParsingConfig.isTemporarilyClosed) {
            context.isTemporarilyClosed = !!this.grabProperty('isTemporarilyClosed', cinemaBox, context);
        }
        var locationGrabber = new ValueGrabber_1.default(cinemaParsingConfig.location, this.logger, this.valueGrabberLogPrefix('location'), Utils_1.default.parseMapsUrl);
        var location = locationGrabber.grabFirst(cinemaBox, context) || {};
        var cinema = Utils_1.default.compactObj({
            id: this.grabProperty('id', cinemaBox, context),
            name: this.grabProperty('name', cinemaBox, context),
            slug: this.grabProperty('slug', cinemaBox, context),
            address: this.grabProperty('address', cinemaBox, context),
            phone: this.grabProperty('phone', cinemaBox, context),
            email: this.grabProperty('email', cinemaBox, context),
            lat: location.lat,
            lon: location.lon,
            href: this.grabProperty('href', cinemaBox, context),
            website: this.grabProperty('website', cinemaBox, context)
        });
        this.logger.debug((context.listName || 'cinemas') + ":result", cinema);
        context.popCallstack();
        return cinema;
    };
    return CinemaParser;
}(BaseParser_1.BaseParser));
exports.CinemaParser = CinemaParser;
