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
exports.ShowtimesParser = void 0;
var cheerio = require("cheerio");
var url = require("url");
var _ = require("underscore");
var moment = require("moment");
var MethodCallLogger_1 = require("../MethodCallLogger");
var Constants_1 = require("../Constants");
var TemplaterEvaluator_1 = require("../TemplaterEvaluator");
var ResponseParsers_1 = require("../ResponseParsers");
var Context_1 = require("../Context");
var Utils_1 = require("../Utils");
var Warnings_1 = require("../Warnings");
var ValueGrabber_1 = require("../ValueGrabber");
var BaseParser_1 = require("./BaseParser");
/** @private */
var defaultTimeFormat = 'HH:mm'; // configSchema.properties.showtimes.oneOf[0].properties.showtimes.properties.timeFormat.default
/**
 * ShowtimesParser
 * @category HTML Parsing
 */
var ShowtimesParser = /** @class */ (function (_super) {
    __extends(ShowtimesParser, _super);
    function ShowtimesParser(logger, dateParser, timeParser, versionParser) {
        var _this = _super.call(this, logger) || this;
        _this.dateParser = dateParser;
        _this.timeParser = timeParser;
        _this.versionParser = versionParser;
        return _this;
    }
    ShowtimesParser.prototype.parseShowtimes = function (showtimesContainer, showtimesConfig, context, callback) {
        var _this = this;
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        context.movie = context.movie || {};
        context.version = context.version || {};
        var $ = context.cheerio;
        var results = [];
        var showtimesBoxSelector = TemplaterEvaluator_1.default.evaluate(showtimesConfig.box, context);
        var showtimesBoxes = showtimesBoxSelector === Constants_1.default.BOX_SELECTOR
            ? [showtimesContainer]
            : showtimesContainer.find(showtimesBoxSelector).toArray().map(function (e) { return $(e); });
        ResponseParsers_1.debugLogFoundBoxesCount(this.logger, "showtimes:selection", showtimesBoxes.length);
        var thisRef = this;
        if (showtimesConfig.delimiter) {
            showtimesBoxes = _.flatten(showtimesBoxes.map(function (box) {
                return box.html().split(showtimesConfig.delimiter).map(function (str) {
                    var subBox = cheerio.load(str).root();
                    subBox.get(0).parent = box.get(0);
                    return subBox;
                });
            }));
        }
        var parentContext = context;
        Utils_1.default.limitList(showtimesBoxes).forEach(function (element) {
            var box = $(element);
            thisRef.logger.debug("showtimes:selection:box", '%s', $.html(element).trim());
            var parsingItems = [];
            if (showtimesConfig.dates) {
                var dateParsingConfig = _this.dateParsingConfig(showtimesConfig);
                var dates = new ValueGrabber_1.default(showtimesConfig.dates, _this.logger, 'showtimes:selection:dates').grabAll(box, context);
                _this.dateParser.iterateDates(dates, parentContext, dateParsingConfig, function (context) { return parsingItems.push({ box: box, context: context }); });
            }
            else {
                var context_1 = Context_1.cloneContext(parentContext);
                parsingItems.push({ box: box, context: context_1 });
            }
            results = _.union(results, thisRef.parseItems(parsingItems, showtimesConfig));
        });
        callback(null, results);
    };
    ShowtimesParser.prototype.parseItems = function (items, showtimesConfig) {
        var _this = this;
        var showtimes = [];
        items.forEach(function (item) {
            var showtime = _this.parseShowtime(item.box, showtimesConfig, item.context);
            // filter empty showtime 
            if (_.chain(showtime).values().compact().any().value()) {
                showtimes.push(Utils_1.default.compactObj(showtime));
            }
        });
        return showtimes;
    };
    ShowtimesParser.prototype.parseShowtime = function (box, showtimesConfig, context) {
        this.resolveFallbacksAndDefaults(showtimesConfig);
        this.parsingConfig = showtimesConfig;
        var time;
        var datetime;
        if (!showtimesConfig.datetimeParsing) {
            datetime = this.grabProperty('date', box, context);
        }
        else {
            if (!context.date) {
                var dateParsingConfig = this.dateParsingConfig(showtimesConfig);
                this.dateParser.parse(box, dateParsingConfig, context);
            }
            datetime = context.date;
        }
        if (moment.isMoment(datetime) && !datetime.isValid()) {
            this.logger.debug("showtimes:selection", "skipping showtime due to invalid date");
            context.addWarning({
                code: Warnings_1.default.CODES.SKIPPED_SHOWTIMES,
                title: "Skipped showtimes due to invalid date.",
                recoveryHint: "Run again with -v date:parsing to check debug outputs for more information."
            });
            return;
        }
        if (context.time) {
            time = context.time;
        }
        else if (showtimesConfig.datetimeParsing) {
            var timeParsingConfig = {
                time: showtimesConfig.time,
                timeFormat: showtimesConfig.timeFormat || showtimesConfig.datetimeFormat || defaultTimeFormat,
                timeLocale: showtimesConfig.timeLocale || showtimesConfig.datetimeLocale
            };
            time = this.timeParser.parse(box, timeParsingConfig, context);
            if (!time.isValid()) {
                this.logger.debug("showtimes:selection", "skipping showtime due to invalid time");
                context.addWarning({
                    code: Warnings_1.default.CODES.SKIPPED_SHOWTIMES,
                    title: "Skipped showtimes due to invalid time.",
                    recoveryHint: "Run again with -v time:parsing to check debug outputs for more information."
                });
                return;
            }
        }
        if (time) {
            datetime.set({
                hour: time.get('hour'),
                minute: time.get('minute'),
                second: time.get('second')
            });
            datetime = datetime.format('YYYY-MM-DDTHH:mm:ss');
        }
        var bookingLink = this.grabProperty('bookingLink', box, context);
        if (bookingLink && context.requestUrl) {
            bookingLink = url.resolve(context.requestUrl, bookingLink);
            var host = url.parse(bookingLink).host;
            bookingLink = bookingLink.replace(new RegExp(host + "/" + host), host);
        }
        context.movie.title = context.movie.title || this.grabProperty('movieTitle', box, context);
        context.movie.titleOriginal = context.movie.titleOriginal || this.grabProperty('movieTitleOriginal', box, context);
        var subtitles = context.version.subtitles || this.grabProperty('subtitles', box, context);
        if (subtitles && subtitles instanceof Array) {
            subtitles = _.compact(subtitles).join(',');
        }
        this.versionParser.parse(box, showtimesConfig, context);
        return {
            movie_title: context.movie.title,
            movie_title_original: context.movie.titleOriginal,
            start_at: datetime,
            is_3d: context.version.is3d === true,
            is_imax: context.version.isImax === true ? true : undefined,
            attributes: (context.version.attributes && context.version.attributes.length) ? context.version.attributes : undefined,
            booking_link: bookingLink,
            auditorium: context.auditorium || this.grabProperty('auditorium', box, context),
            language: context.version.language || this.grabProperty('language', box, context),
            subtitles: subtitles
        };
    };
    ShowtimesParser.prototype.dateParsingConfig = function (showtimesConfig) {
        return {
            date: showtimesConfig.date,
            dateFormat: showtimesConfig.datetimeFormat || showtimesConfig.dateFormat,
            dateLocale: showtimesConfig.datetimeLocale || showtimesConfig.dateLocale,
            preserveYear: showtimesConfig.preserveYear
        };
    };
    ShowtimesParser.prototype.resolveFallbacksAndDefaults = function (config) {
        config.time = config.time || config['datetime'] || Constants_1.default.BOX_SELECTOR;
        config.date = config.date || config['datetime'] || Constants_1.default.BOX_SELECTOR;
        config.bookingLink = config.bookingLink || (Utils_1.default.isLinkTagSelector(config.box) ? ':box@href' : null);
        if (config.datetimeParsing === undefined) {
            config.datetimeParsing = true;
        }
    };
    return ShowtimesParser;
}(BaseParser_1.BaseParser));
exports.ShowtimesParser = ShowtimesParser;
