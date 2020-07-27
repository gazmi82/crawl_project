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
exports.TimeParser = void 0;
var moment = require("moment");
var colors = require("colors");
var MethodCallLogger_1 = require("../MethodCallLogger");
var DateParser_1 = require("./DateParser");
var BaseParser_1 = require("./BaseParser");
/**
 * Parser for parsing formatted time strings.
 * @category HTML Parsing
 */
var TimeParser = /** @class */ (function (_super) {
    __extends(TimeParser, _super);
    function TimeParser() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.contextKey = 'time';
        return _this;
    }
    /**
     * Parses a single time from a HTML box and adds it as moment object to the given context's `time` property.
     * @param dateBox the HTML box to grab the time string from
     * @param timeParsingConfig config for grabbing the time string and parsing it
     * @param context the context which to set the `time` property on
     * @returns the parsed time as moment object
     */
    TimeParser.prototype.parse = function (box, timeParsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        // strict time parsing helps filtering showtimes boxes which don't actually contain showtimes, e.g. empty cells in tables.
        // this might be moved into the config to allow non-strict time parsing
        var useStrictTimeParsing = true;
        var timeStr = this.resovleValueGrabber('time', timeParsingConfig).grab(box, context);
        var time = moment(timeStr, timeParsingConfig.timeFormat, timeParsingConfig.timeLocale, useStrictTimeParsing);
        this.logger.debug("showtimes:selection:time:parsing", 'timeStr:', DateParser_1.styleString(timeStr), 'format:', DateParser_1.styleString(timeParsingConfig.timeFormat), 'locale:', DateParser_1.styleString(timeParsingConfig.timeLocale), colors.bold(' => '), DateParser_1.styleMoment(time, 'HH:mm:ss'));
        context.time = time;
        context.popCallstack();
        return time;
    };
    return TimeParser;
}(BaseParser_1.BaseParser));
exports.TimeParser = TimeParser;
