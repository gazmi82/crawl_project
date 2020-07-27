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
exports.DefaultResponseParser = exports.BaseHtmlParser = exports.debugLogFoundBoxesCount = void 0;
var cheerio = require("cheerio");
var _ = require("underscore");
var async = require("async");
var Logger_1 = require("./Logger");
var Context_1 = require("./Context");
var MethodCallLogger_1 = require("./MethodCallLogger");
var TableParser_1 = require("./parsers/TableParser/TableParser");
var Constants_1 = require("./Constants");
var TemplaterEvaluator_1 = require("./TemplaterEvaluator");
var Utils_1 = require("./Utils");
var parsers_1 = require("./parsers");
var PeriodParser_1 = require("./parsers/PeriodParser");
var ValueGrabber_1 = require("./ValueGrabber");
var Mappers_1 = require("./Mappers");
var TabsParser_1 = require("./parsers/TabsParser");
/** @private */
function debugLogFoundBoxesCount(logger, scope, count) {
    logger.debug(scope + ":count", "found " + count + " box" + (count === 1 ? '' : 'es'));
}
exports.debugLogFoundBoxesCount = debugLogFoundBoxesCount;
/**
 * Base ResponseParser, which supports
 * - loading the HTML and creating a ParsingContext
 * - parsing of lists
 */
var BaseHtmlParser = /** @class */ (function () {
    function BaseHtmlParser() {
        this._logger = new Logger_1.LoggerProxy(new Logger_1.SilentLogger());
    }
    Object.defineProperty(BaseHtmlParser.prototype, "logger", {
        get: function () {
            return this._logger;
        },
        set: function (newLogger) {
            this._logger.logger = newLogger;
        },
        enumerable: false,
        configurable: true
    });
    /**
      * Detects arbitrary lists at iterates over it's boxes asyncroniously.
      * @param container The base container which is the entrypoint
      * @param listName The name of the list, used for debug logs
      * @param listConfig The config for parsing the list
      * @param boxIterator A callback function which will be called for each box found in the list
      * @param callback The completion callback which will be called with final parsed data objects and opionally a url for the next page to crawl
      */
    BaseHtmlParser.prototype.parseList = function (container, context, listName, listConfig, boxIterator, callback) {
        var _this = this;
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        var $ = context.cheerio;
        var boxSelector = TemplaterEvaluator_1.default.evaluate(listConfig.box, context);
        var boxes = boxSelector === Constants_1.default.BOX_SELECTOR
            ? [container]
            : container.find(boxSelector).toArray();
        debugLogFoundBoxesCount(this.logger, listName + ":selection", boxes.length);
        async.mapSeries(Utils_1.default.limitList(boxes), function (box, cb) {
            var cheerioBox = $(box);
            _this.logger.debug(listName + ":selection:box", '%s', $.html(cheerioBox).trim());
            boxIterator(cheerioBox, Context_1.cloneContext(context), cb);
        }, function (err, items) {
            items = _.select(items, function (item) { return (typeof item === 'string') || _.chain(Utils_1.default.compactObj(item)).keys().any().value(); });
            var nextPageUrl;
            if (listConfig.nextPage) {
                var nextPageUrlGrabber = new ValueGrabber_1.default(listConfig.nextPage, _this.logger, 'next-page', Mappers_1.default.mapHref);
                nextPageUrl = nextPageUrlGrabber.grabFirst(container, context);
            }
            callback(err, items, nextPageUrl);
        });
    };
    /**
     * Loads the html text of a response into a cheerio container and creates a corresponding parsing context.
     * @param response
     * @param context
     */
    BaseHtmlParser.prototype.prepareHtmlParsing = function (html, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        var $ = cheerio.load(html);
        var parsingContext = context;
        parsingContext.cheerio = $;
        context.popCallstack();
        return {
            container: $('html'),
            parsingContext: parsingContext
        };
    };
    return BaseHtmlParser;
}());
exports.BaseHtmlParser = BaseHtmlParser;
var DefaultResponseParser = /** @class */ (function (_super) {
    __extends(DefaultResponseParser, _super);
    function DefaultResponseParser() {
        var _this = _super.call(this) || this;
        _this.resultsFlattenCallback = function (callback) { return function (err, result) {
            if (result instanceof Array) {
                result = _.chain(result).flatten().compact().value();
            }
            callback(err, result);
        }; };
        _this.cinemaParser = new parsers_1.CinemaParser(_this.logger);
        _this.auditoriumParser = new parsers_1.AuditoriumParser(_this.logger);
        _this.dateParser = new parsers_1.DateParser(_this.logger);
        _this.timeParser = new parsers_1.TimeParser(_this.logger);
        _this.periodParser = new PeriodParser_1.PeriodParser(_this.logger, _this.dateParser);
        _this.versionParser = new parsers_1.VersionParser(_this.logger);
        _this.movieParser = new parsers_1.MovieParser(_this.logger, _this.versionParser);
        _this.showtimesParser = new parsers_1.ShowtimesParser(_this.logger, _this.dateParser, _this.timeParser, _this.versionParser);
        return _this;
    }
    /**
     * Handles the repsonse of a cinemas parsing a list of cinemas
     */
    DefaultResponseParser.prototype.handleCinemasResponse = function (response, listConfig, context, callback) {
        var _this = this;
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        var _a = this.prepareHtmlParsing(response.text, context), container = _a.container, parsingContext = _a.parsingContext;
        parsingContext.listName = 'cinemas.list';
        this.parseList(container, context, 'cinemas', listConfig, function (box, context, cb) {
            cb(null, _this.cinemaParser.parseCinema(box, listConfig, context));
        }, callback);
    };
    /**
     * Handle the response of a single cinema's details page. Parses details and provides a partial cinema object via callback.
     */
    DefaultResponseParser.prototype.handleCinemaDetailsResponse = function (response, detailsParsingConfig, context, callback) {
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        var _a = this.prepareHtmlParsing(response.text, context), container = _a.container, parsingContext = _a.parsingContext;
        parsingContext.listName = 'cinemas.details';
        callback(null, this.cinemaParser.parseCinema(container, detailsParsingConfig, parsingContext));
    };
    DefaultResponseParser.prototype.handleMoviesResponse = function (response, listConfig, context, callback) {
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        var _a = this.prepareHtmlParsing(response.text, context), container = _a.container, parsingContext = _a.parsingContext;
        callback = this.resultsFlattenCallback(callback);
        this.parseMovies(container, listConfig, parsingContext, null, callback);
    };
    DefaultResponseParser.prototype.handleDatesResponse = function (response, config, context, callback) {
        var _this = this;
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        var _a = this.prepareHtmlParsing(response.text, context), container = _a.container, parsingContext = _a.parsingContext;
        callback = this.resultsFlattenCallback(callback);
        this.parseList(container, parsingContext, 'dates', config, function (box, context, cb) {
            var date = _this.dateParser.parse(box, config, context);
            var href = new ValueGrabber_1.default(config.href, _this.logger, 'dates').grab(box, context);
            cb(null, { date: date, href: href });
        }, callback);
    };
    DefaultResponseParser.prototype.handleShowtimesResponse = function (response, config, context, callback) {
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        var _a = this.prepareHtmlParsing(response.text, context), container = _a.container, parsingContext = _a.parsingContext;
        callback = this.resultsFlattenCallback(callback);
        // Each levels box acts as the next levels container.
        // So the response a showtimes page it the container 
        // for what ever it's first model to iterate is.
        var parser = this.boxIterator(config, parsingContext);
        if (parser) {
            parser(container, parsingContext, callback);
        }
        else {
            this.logger.warn('could not find parsing entry for showtimesResponse');
            callback(null, []);
        }
    };
    DefaultResponseParser.prototype.boxIterator = function (subConfig, context) {
        var _this = this;
        MethodCallLogger_1.default.logMethodCall();
        if (!subConfig) {
            this.logger.warn('counld not find next level box iterator for', subConfig);
            return null;
        }
        function asyncifyParserHook(parser) {
            return (parser.length < 3
                ? async.asyncify(parser)
                : parser);
        }
        if (subConfig.showtimes) {
            return function (box, context, cb) {
                var parseShowtimes = subConfig.showtimes.parser
                    ? function (container, showtimesConfig, context, callback) {
                        var parse = asyncifyParserHook(subConfig.showtimes.parser);
                        parse(container, context, callback);
                    }
                    : _this.showtimesParser.parseShowtimes.bind(_this.showtimesParser);
                parseShowtimes(box, subConfig.showtimes, context, cb);
            };
        }
        if (subConfig.periods) {
            return function (box, context, cb) {
                var nextIterator = _this.boxIterator(subConfig.periods, context);
                _this.parsePeriods(box, subConfig.periods, context, nextIterator, cb);
            };
        }
        if (subConfig.dates) {
            if (subConfig.dates.parser) {
                return function (box, context, cb) {
                    var nextIterator = _this.boxIterator(subConfig.dates, context);
                    var parseDates = asyncifyParserHook(subConfig.dates.parser);
                    async.waterfall([
                        function (cb) { return parseDates(box, context, cb); },
                        function (dates, cb) {
                            if (!nextIterator) {
                                return cb(null, []);
                            }
                            var perDateContexts = [];
                            _this.dateParser.iterateDates(dates, context, subConfig.dates, function (context) { return perDateContexts.push(context); });
                            async.mapSeries(Utils_1.default.limitList(perDateContexts), function (context, callback) {
                                nextIterator(box, context, callback);
                            }, cb);
                        }
                    ], cb);
                };
            }
            else {
                return function (box, context, cb) {
                    var nextIterator = _this.boxIterator(subConfig.dates, context);
                    _this.parseDates(box, subConfig.dates, context, nextIterator, cb);
                };
            }
        }
        if (subConfig.auditoria) {
            return function (box, context, cb) {
                var nextIterator = _this.boxIterator(subConfig.auditoria, context);
                _this.parseAuditoria(box, subConfig.auditoria, context, nextIterator, cb);
            };
        }
        if (subConfig.movies) {
            return function (box, context, cb) {
                var nextIterator = _this.boxIterator(subConfig.movies, context);
                _this.parseMovies(box, subConfig.movies, context, nextIterator, cb);
            };
        }
        if (subConfig.versions) {
            return function (box, context, cb) {
                var nextIterator = _this.boxIterator(subConfig.versions, context);
                _this.parseVersions(box, subConfig.versions, context, nextIterator, cb);
            };
        }
        if (subConfig.forEach) {
            return function (box, context, cb) {
                var nextIterator = _this.boxIterator(subConfig.forEach, context);
                nextIterator = nextIterator || (function (box, context, cb) { return cb(null); });
                _this.parseList(box, context, 'forEach', subConfig.forEach, nextIterator, cb);
            };
        }
        if (subConfig.table) {
            return function (box, parsingContext, cb) {
                var context = parsingContext;
                var showtimes = [];
                var thisRef = _this;
                var $ = context.cheerio;
                var headerCellIterator = function (headerConfig, debugToken) {
                    return function (cell, context) {
                        thisRef.parseHeaderBox(cell, context, headerConfig, "table:header:" + debugToken);
                    };
                };
                var headerRowIterator = headerCellIterator(subConfig.table.headerRow, 'row');
                var headerColIterator = subConfig.table.headerColumn
                    ? headerCellIterator(subConfig.table.headerColumn, 'column')
                    : null;
                var contentCellIterator = function (cell, context, callback) {
                    _this.logger.debug("table:content-cell", '%o: %s', context.indexes.table, $.html(cell).trim());
                    var boxIterator = _this.boxIterator(subConfig.table.cells, context);
                    if (!boxIterator) {
                        return callback(null);
                    }
                    if (context.dates) {
                        thisRef.dateParser.iterateMomentDatesAsync(context.dates, context, function (context, cb) {
                            boxIterator(cell, context, function (err, cellShowtimes) {
                                showtimes = _.union(showtimes, cellShowtimes);
                                cb(err);
                            });
                        }, callback);
                    }
                    else {
                        boxIterator(cell, context, function (err, cellShowtimes) {
                            showtimes = _.union(showtimes, cellShowtimes);
                            callback(err);
                        });
                    }
                };
                var tableSelector = TemplaterEvaluator_1.default.evaluate(subConfig.table.selector, context);
                var table = subConfig.table.selector === Constants_1.default.BOX_SELECTOR
                    ? box
                    : box.find(tableSelector).first();
                _this.logger.debug("table", '%s', context.cheerio(table).html());
                var contentCellFilter = subConfig.table.cells.filter || TableParser_1.default.emptyCellFilter;
                TableParser_1.default.parseTable(table, context, _this.logger, {
                    headerRow: headerRowIterator,
                    headerCol: headerColIterator,
                    content: contentCellIterator,
                    contentCellFilter: contentCellFilter
                }, subConfig.table, function (err, res) {
                    cb(err, showtimes);
                });
            };
        }
        if (subConfig.tabs) {
            return function (box, parsingContext, cb) {
                var thisRef = _this;
                TabsParser_1.default.parseTabs(box, parsingContext, thisRef.logger, subConfig.tabs, {
                    buttons: function (box, parsingContext, cb) {
                        thisRef.parseHeaderBox(box, parsingContext, subConfig.tabs.buttons, "tabs:buttons");
                        cb();
                    },
                    cards: _this.boxIterator(subConfig.tabs.cards, parsingContext) || (function (box, context, cb) { return cb(); })
                }, function (err, showtimes) { return cb(err, showtimes || []); });
            };
        }
        this.logger.warn('counld not find next level box iterator for', subConfig);
        return null;
    };
    DefaultResponseParser.prototype.parseHeaderBox = function (box, context, headerConfig, debugPrefix) {
        var $ = context.cheerio;
        this.logger.debug(debugPrefix, '%o: %s', context.indexes.table, $.html(box).trim());
        if (headerConfig.auditorium) {
            this.auditoriumParser.parse(box, headerConfig, context);
        }
        if (headerConfig.date) {
            this.dateParser.parse(box, headerConfig, context);
        }
        if (headerConfig.dates) {
            var dates = new ValueGrabber_1.default(headerConfig.dates, this.logger, 'dates').grabAll(box, context);
            context.dates = this.dateParser.mapDates(dates, context, headerConfig);
        }
        if (headerConfig.time) {
            this.timeParser.parse(box, headerConfig, context);
        }
        if (headerConfig.movieTitle) {
            this.movieParser.parse(box, headerConfig, context);
        }
        if (_.any(['is3d', 'isImax', 'language', 'subtitles'], function (key) { return _.has(headerConfig, key); })) {
            this.versionParser.parse(box, headerConfig, context);
        }
    };
    /** Parses and iterates a level of items such as movies, version, auditoria */
    DefaultResponseParser.prototype.parseLevel = function (levelName, container, parsingConfig, itemParser, context, iterator, callback) {
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        this.parseList(container, context, levelName, parsingConfig, function (box, context, cb) {
            itemParser.parse(box, parsingConfig, context);
            if (iterator) {
                iterator(box, context, cb);
            }
            else {
                cb(null, context[itemParser.contextKey]);
            }
        }, callback);
    };
    DefaultResponseParser.prototype.parseMovies = function (moviesContainer, moviesConfig, context, iterator, callback) {
        MethodCallLogger_1.default.logMethodCall();
        this.parseLevel('movies', moviesContainer, moviesConfig, this.movieParser, context, iterator, callback);
    };
    DefaultResponseParser.prototype.parseDates = function (datesContainer, datesConfig, context, iterator, callback) {
        MethodCallLogger_1.default.logMethodCall();
        this.parseLevel('dates', datesContainer, datesConfig, this.dateParser, context, iterator, callback);
    };
    DefaultResponseParser.prototype.parseAuditoria = function (auditoriaContainer, auditoriaConfig, context, iterator, callback) {
        MethodCallLogger_1.default.logMethodCall();
        this.parseLevel('auditoria', auditoriaContainer, auditoriaConfig, this.auditoriumParser, context, iterator, callback);
    };
    DefaultResponseParser.prototype.parseVersions = function (versionsContainer, versionsConfig, context, iterator, callback) {
        MethodCallLogger_1.default.logMethodCall();
        this.parseLevel('versions', versionsContainer, versionsConfig, this.versionParser, context, iterator, callback);
    };
    DefaultResponseParser.prototype.parsePeriods = function (periodsContainer, periodsConfig, context, iterator, callback) {
        MethodCallLogger_1.default.logMethodCall();
        this.parseLevel('periods', periodsContainer, periodsConfig, this.periodParser, context, iterator, callback);
    };
    return DefaultResponseParser;
}(BaseHtmlParser));
exports.DefaultResponseParser = DefaultResponseParser;
