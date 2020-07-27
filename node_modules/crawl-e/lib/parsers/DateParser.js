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
exports.DateParser = exports.styleMoment = exports.styleString = void 0;
var moment = require("moment");
var colors = require("colors");
var _ = require("underscore");
var Constants_1 = require("../Constants");
var MethodCallLogger_1 = require("../MethodCallLogger");
var Context_1 = require("../Context");
var Utils_1 = require("../Utils");
var BaseParser_1 = require("./BaseParser");
/** @private */
exports.styleString = function (str) { return str
    ? colors.underline.green(str)
    : colors.inverse.red('null'); };
/** @private */
exports.styleMoment = function (m, format) {
    var color = m.isValid() ? colors.green : colors.red;
    return colors.bold(color(m.format(format)));
};
/**
 * DateParser
 * @category HTML Parsing
 */
var DateParser = /** @class */ (function (_super) {
    __extends(DateParser, _super);
    function DateParser() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.debugKey = 'dates:selection:date:parsing';
        _this.contextKey = 'date';
        _this.logPrefix = 'date';
        return _this;
    }
    /**
     * Parses a single date from a HTML box and adds it as moment object to the given context's `date` property.
     * @param dateBox the HTML box to grab the date string from
     * @param dateParsingConfig config for grabbing the date string and parsing it
     * @param context the context which to set the `date` property on
     * @returns the parsed date as moment object
     */
    DateParser.prototype.parse = function (dateBox, dateParsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        var dateStr = this.resovleValueGrabber('date', dateParsingConfig).grabFirst(dateBox, context);
        var date = this.parseDateStr(dateStr, dateParsingConfig, context);
        context.popCallstack();
        return date;
    };
    /**
     * Parses a date string and sets it as moment object into the given context's `date` property.
     * @param dateStr the formatted date stirng to parse
     * @param dateParsingConfig config for parsing the date string
     * @param context the context which to set the `date` property on
     * @returns the parsed date as moment object
     */
    DateParser.prototype.parseDateStr = function (dateStr, dateParsingConfig, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        var date;
        function testMatchAnyWords(dateStr, words) {
            if (typeof dateStr !== 'string') {
                return false;
            }
            if (words.indexOf(dateStr.trim()) !== -1) {
                return true;
            }
            var regex = new RegExp('\\b(' + words
                .map(function (w) { return "(" + w + ")"; })
                .join('|') + ')\\b', 'gi');
            return regex.test(dateStr.trim());
        }
        date = moment(dateStr, dateParsingConfig.dateFormat, dateParsingConfig.dateLocale, true);
        var isDateFormatWithoutYear = !/y/i.test(JSON.stringify(dateParsingConfig.dateFormat));
        if (date.isValid() && isDateFormatWithoutYear && !dateParsingConfig.preserveYear) {
            // in case of guessing the year, we will use the closest date to the day 4 month from now, so that:
            // - any date appearing up to 2 month ago shall be treated as past date
            // - all dates appearing up to 10 month from now shall be treated as future dates
            var refDate_1 = moment().add(4, 'months');
            var potentialDates = [
                date.clone().subtract(1, 'year'),
                date,
                date.clone().add(1, 'year')
            ];
            date = _.chain(potentialDates)
                .sortBy(function (d) { return Math.abs(refDate_1.diff(d)); })
                .first()
                .value();
        }
        if (!date.isValid() && testMatchAnyWords(dateStr, Constants_1.default.DAY_AFTER_TOMORROW_WORS)) {
            date = moment().add(2, 'days').set('hour', 0);
            this.logger.debug(this.debugKey, 'dateStr:', exports.styleString(dateStr), '-> matched regex for day after tomorrow', colors.bold(' => '), exports.styleMoment(date, 'YYYY-MM-DD'));
        }
        else if (!date.isValid() && testMatchAnyWords(dateStr, Constants_1.default.TOMORROW_WORS)) {
            date = moment().add(1, 'day').set('hour', 0);
            this.logger.debug(this.debugKey, 'dateStr:', exports.styleString(dateStr), '-> matched tomorrow regex', colors.bold(' => '), exports.styleMoment(date, 'YYYY-MM-DD'));
        }
        else if (!date.isValid() && testMatchAnyWords(dateStr, Constants_1.default.TODAY_WORDS)) {
            date = moment().set('hour', 0);
            this.logger.debug(this.debugKey, 'dateStr:', exports.styleString(dateStr), '-> matched today regex', colors.bold(' => '), exports.styleMoment(date, 'YYYY-MM-DD'));
        }
        else {
            this.logger.debug(this.debugKey, 'dateStr:', exports.styleString(dateStr), 'format:', exports.styleString(dateParsingConfig.dateFormat), 'locale:', exports.styleString(dateParsingConfig.dateLocale), colors.bold(' => '), exports.styleMoment(date, 'YYYY-MM-DD'));
        }
        context.date = date;
        context.popCallstack();
        return date;
    };
    /**
     * Maps any array of dates either as formatted strings, JS Date object or moment objects into a unified array of momemnt data objects.
     * @param dates
     * @param context
     * @param dateParsingConfig
     */
    DateParser.prototype.mapDates = function (dates, context, dateParsingConfig) {
        var _this = this;
        if (!Array.isArray(dates)) {
            throw new Error("dates value grabber must return an array of string, but was " + JSON.stringify(dates));
        }
        return dates.map(function (date, index) {
            if (!date) {
                throw new Error("dates value grabber must return an array of string, but found " + date + " at index " + index);
            }
            switch (date.constructor.name) {
                case 'String': return _this.parseDateStr(date, dateParsingConfig, context);
                case 'Date': return moment(date);
                case 'Moment': return date;
                default:
                    throw new Error("dates value grabber must return an array of string, but found " + date + " (" + date.constructor.name + ") at index " + index);
            }
        });
    };
    DateParser.prototype.iterateDates = function (dates, parentContext, dateParsingConfig, iterator) {
        var momentDates = this.mapDates(dates, parentContext, dateParsingConfig);
        this.iterateMomentDates(momentDates, parentContext, iterator);
    };
    /**
     * Iterates over a list of dates, calling the iterator function with a ParsingContext configured for the current data each.
     * @param dates
     * @param parentContext
     * @param iterator
     */
    DateParser.prototype.iterateMomentDates = function (dates, parentContext, iterator) {
        dates.forEach(function (date) {
            var context = Context_1.cloneContext(parentContext);
            context.date = date;
            iterator(context);
        });
    };
    /**
     * Iterates asynchronously over a list of dates, calling the iterator function with a ParsingContext configured for the current data each.
     * @param dates
     * @param context
     * @param iterator
     * @param cb
     */
    DateParser.prototype.iterateMomentDatesAsync = function (dates, context, iterator, cb) {
        Utils_1.default.mapSeries(dates, context, function (date, context, cb) {
            context.date = date;
            iterator(context, cb);
        }, cb);
    };
    return DateParser;
}(BaseParser_1.BaseParser));
exports.DateParser = DateParser;
