"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodParser = void 0;
var ValueGrabber_1 = require("../ValueGrabber");
var MethodCallLogger_1 = require("../MethodCallLogger");
/**
 * @category HTML Parsing
 */
var PeriodParser = /** @class */ (function () {
    function PeriodParser(logger, dateParser) {
        this.logger = logger;
        this.dateParser = dateParser;
        this.contextKey = 'period';
    }
    /** parses a date period from a box and adds it to the context */
    PeriodParser.prototype.parse = function (box, config, context) {
        MethodCallLogger_1.default.logMethodCall();
        context.pushCallstack();
        var dateParserDebugKey = this.dateParser.debugKey;
        this.dateParser.debugKey = 'period.dates';
        var periodDates = new ValueGrabber_1.default(config.datesParser, this.logger, this.dateParser.debugKey).grabAll(box, context);
        context.period = [];
        this.dateParser.iterateDates(periodDates, context, config, function (dateContext) {
            context.period.push(dateContext.date);
        });
        this.dateParser.debugKey = dateParserDebugKey;
        context.popCallstack();
        return context.period;
    };
    return PeriodParser;
}());
exports.PeriodParser = PeriodParser;
