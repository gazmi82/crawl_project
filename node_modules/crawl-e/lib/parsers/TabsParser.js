"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var ResponseParsers_1 = require("../ResponseParsers");
var ValueGrabber_1 = require("../ValueGrabber");
var TemplaterEvaluator_1 = require("../TemplaterEvaluator");
var Constants_1 = require("../Constants");
var Utils_1 = require("../Utils");
var MethodCallLogger_1 = require("../MethodCallLogger");
var TabsParser;
(function (TabsParser) {
    function parseTabs(container, context, logger, config, iterators, callback) {
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        parseTabButtons(container, context, logger, config, iterators.buttons, function (err, tabsContexts) {
            if (err) {
                return callback(err);
            }
            parseTabCards(container, context, logger, config, tabsContexts, iterators.cards, callback);
        });
    }
    TabsParser.parseTabs = parseTabs;
    function parseTabButtons(container, context, logger, config, buttonParser, callback) {
        MethodCallLogger_1.default.logMethodCall();
        callback = context.trackCallstackAsync(callback);
        var $ = context.cheerio;
        var buttonsSelector = TemplaterEvaluator_1.default.evaluate(config.buttons.box, context);
        var buttons = config.buttons.box === Constants_1.default.BOX_SELECTOR
            ? [container]
            : container.find(buttonsSelector);
        ResponseParsers_1.debugLogFoundBoxesCount(logger, 'tabs:buttons', buttons.length);
        var tabsContexts = {};
        var tabIndex = 0;
        Utils_1.default.mapSeries(buttons, context, function (buttonBox, context, cb) {
            var cheerioBox = $(buttonBox);
            logger.debug("tabs:buttons:box", '%s', $.html(cheerioBox).trim());
            var tabId = new ValueGrabber_1.default(config.buttons.id, logger, "tabs:buttons:id").grabFirst(cheerioBox, context);
            context.tabId = tabId;
            context.indexes.tab = tabIndex;
            tabIndex += 1;
            tabsContexts[tabId] = context;
            buttonParser(cheerioBox, context, cb);
        }, function (err, result) {
            callback(err, tabsContexts);
        });
    }
    TabsParser.parseTabButtons = parseTabButtons;
    function parseTabCards(container, context, logger, config, tabsContexts, cardIterator, callback) {
        if (!config.cards) {
            return callback(null);
        }
        var $ = context.cheerio;
        var tabIds = Object.keys(tabsContexts);
        async.mapSeries(Utils_1.default.limitList(tabIds), function (tabId, cb) {
            var tabContext = tabsContexts[tabId];
            var selector = TemplaterEvaluator_1.default.evaluate(config.cards.box, tabContext);
            var cheerioBox = container.find(selector);
            logger.debug("tabs:cards:box", "selected (" + selector + "): %s", $.html(cheerioBox).trim());
            cardIterator(cheerioBox, tabContext, cb);
        }, callback);
    }
    TabsParser.parseTabCards = parseTabCards;
})(TabsParser || (TabsParser = {}));
exports.default = TabsParser;
