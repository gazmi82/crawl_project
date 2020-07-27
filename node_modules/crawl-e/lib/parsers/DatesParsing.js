"use strict";
/**
 * This file contains functions for parsing more complex dates strings as examples show below.
 * It plugs into the dates value grabbing on showtimes parsing.
 *
 *   Sat 3/24 12:50 3:50 6:40 9:05
 *   Mon 3/26 - Wed 3/28 4:10 7:10
 *   Mon 3/26 & Tue 3/27 4:30 7:30
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatesParsing = void 0;
var _ = require("underscore");
var moment = require("moment");
var colors = require("colors");
var Logger_1 = require("../Logger");
var DateParser_1 = require("./DateParser");
var DatesParsing;
(function (DatesParsing) {
    /** builds a regular expression for giving date format to find matching sub-strings. */
    function dateFormatToRegexPattern(format, locale) {
        if (locale === void 0) { locale = 'en'; }
        format = "" + format;
        var monthRegex = /M+/;
        var monthFormat = format.match(monthRegex)[0];
        var monthPattern = '';
        if (monthFormat) {
            if (monthFormat.length === 1) {
                monthPattern += '0?';
            }
            monthPattern += "(" + _.range(0, 12).map(function (i) { return moment(0).add(i, 'months').locale(locale).format(monthFormat); }).join('|') + ")";
        }
        return format
            .replace(/\./, '\\.')
            .replace(/[DY]/g, '\\d')
            .replace(monthRegex, monthPattern);
    }
    /**
     * Parses individual dates, ranges of dates and compound dates from the given text.
     * @param text input text to parse
     * @param config configuarion for dates parsing
     * @returns an array of dates as momentjs objects.
     */
    function parseDates(text, config, logger) {
        if (logger === void 0) { logger = new Logger_1.DefaultLogger(); }
        var result = [];
        var dateLocale = config.dateLocale || 'en';
        var dateRegexPattern = config.dateRegexPattern || dateFormatToRegexPattern(config.dateFormat, dateLocale);
        var dateRegex = new RegExp(dateRegexPattern);
        logger.debug("dates:parsing", "using dateRege " + dateRegex);
        var rangeRegex = new RegExp("(" + dateRegexPattern + ").*" + config.rangeSeparator + "[^\\d]*(" + dateRegexPattern + ")");
        var compoundRegex = new RegExp("(" + dateRegexPattern + ").*(" + config.compoundSeparator + "[^\\d]*(" + dateRegexPattern + "))+");
        function parseDateStr(dateStr, scope) {
            var date = moment(dateStr, config.dateFormat, dateLocale);
            logger.debug("dates:parsing:" + scope, 'dateStr:', DateParser_1.styleString(dateStr), 'format:', DateParser_1.styleString(config.dateFormat), 'locale:', DateParser_1.styleString(dateLocale), colors.bold(' => '), DateParser_1.styleMoment(date, 'YYYY-MM-DD'));
            return date;
        }
        logger.debug("dates:parsing", 'text:', text);
        if (rangeRegex.test(text)) {
            var range = text.match(rangeRegex);
            range = range
                .slice(1, range.length)
                .filter(function (s) { return dateRegex.test(s); });
            logger.debug("dates:parsing", 'found range:', range.join(' → '));
            var fromDate = parseDateStr(range[0], 'range:dateFrom');
            var toDate = parseDateStr(range[1], 'range:dateTo');
            var dates = [];
            var date = fromDate;
            while (date.unix() <= toDate.unix()) {
                dates.push(date);
                date = moment(date).add(1, 'day');
            }
            result = dates;
        }
        else if (compoundRegex.test(text)) {
            var dateStrings = text.split(new RegExp(config.compoundSeparator, 'g')).map(function (t) { return t.match(dateRegex)[0]; });
            logger.debug("dates:parsing", 'found compound:', dateStrings.join(' & '));
            result = dateStrings.map(function (str) { return parseDateStr(str, 'compound-list'); });
        }
        else if (dateRegex.test(text)) {
            var dateString = text.match(dateRegex)[0];
            logger.debug("dates:parsing", 'found individual:', dateString);
            result = [parseDateStr(dateString, 'individual')];
        }
        else {
            logger.debug("dates:parsing", 'found no dates');
        }
        logger.debug("dates:parsing", 'result:', result.map(function (r) { return r.format('YYYY-MM-DD'); }));
        return result;
    }
    DatesParsing.parseDates = parseDates;
})(DatesParsing = exports.DatesParsing || (exports.DatesParsing = {}));
