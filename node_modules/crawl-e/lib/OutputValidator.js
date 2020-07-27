"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Warnings_1 = require("./Warnings");
var _ = require("underscore");
var tv4 = require("tv4");
/** @private */
var showtimeSchema = require('./../spec/output-schema_showtime.json');
/** @private */
var checks = [
    // validate OutputSchema
    function (data, context) {
        var outputDataSchema = {
            '$schema': 'http://json-schema.org/draft-04/schema',
            'title': 'Output JSON Schema',
            'type': 'object',
            'properties': {
                'showtimes': {
                    'type': 'array',
                    'items': showtimeSchema
                }
            }
        };
        if (!tv4.validate(data, outputDataSchema)) {
            var OutputSchemaValidationWarning = /** @class */ (function () {
                function OutputSchemaValidationWarning(error, data) {
                    this.code = Warnings_1.default.CODES.OUTPUT_SCHEMA_VALIDATION_ERROR;
                    this.title = 'Output Validation Error';
                    this.details = {
                        error: error,
                        data: data
                    };
                }
                OutputSchemaValidationWarning.prototype.formatDetails = function () {
                    return "Schema validation failed: " + this.details.error.message + " at " + this.details.error.dataPath;
                };
                return OutputSchemaValidationWarning;
            }());
            return [new OutputSchemaValidationWarning(tv4.error, data)];
        }
        return [];
    },
    // check cinema.address 
    function (data, context) {
        if (data.cinema.address === undefined) {
            return [{
                    code: Warnings_1.default.CODES.CINEMA_WIHOUT_ADDRESS,
                    title: 'cinema without address'
                }];
        }
        return [];
    },
    // check cinema.slug 
    function (data, context) {
        if (data.cinema.slug && data.cinema.slug.indexOf('_') > -1) {
            return [{
                    code: Warnings_1.default.CODES.CINEMA_WITH_INVALID_SLUG,
                    title: 'cinema.slug contains underscore'
                }];
        }
        return [];
    },
    // check for empty showtimes 
    function (data, context) {
        if (data.showtimes.length === 0 && !context.isTemporarilyClosed) {
            return [{
                    code: Warnings_1.default.CODES.NO_SHOWTIMES,
                    title: 'no showtimes'
                }];
        }
        return [];
    },
    // check for duplicated booking links
    function (data, context) {
        var warnings = [];
        var bookingLinksGrouped = _.chain(data.showtimes)
            .filter(function (show) { return !!show.booking_link; })
            .countBy(function (show) { return show.booking_link; })
            .value();
        var duplicatedBookingLinks = _.filter(_.keys(bookingLinksGrouped), function (key) { return bookingLinksGrouped[key] > 1; });
        if (duplicatedBookingLinks.length > 0) {
            warnings.push({
                code: Warnings_1.default.CODES.DUPLICATED_BOOKING_LINKS,
                title: 'duplicated booking links',
                details: {
                    bookingLinks: duplicatedBookingLinks
                }
            });
        }
        return warnings;
    },
    // check is_booking_link_capable marker
    function (data, context) {
        var hasBookingLink = _.find(data.showtimes, function (show) { return show.booking_link; }) !== undefined;
        if (data.showtimes.length > 0 && ((data.crawler.is_booking_link_capable && !hasBookingLink) || (!data.crawler.is_booking_link_capable && hasBookingLink))) {
            return [{
                    code: Warnings_1.default.CODES.WRONG_IS_BOOKING_LINK_CAPABLE,
                    title: 'crawler.is_booking_link_capable value appears wrong',
                    recoveryHint: 'If you finished all configurations and still see this warning please add the following to the top of the config object.' +
                        ("\n\n  crawler: {is_booking_link_capable: " + hasBookingLink + "},")
                }];
        }
        return [];
    },
    // check showtimes having proper start_at time
    function (data, context) {
        if (data.showtimes.length > 0 && data.showtimes.filter(function (showtime) { return showtime.start_at && showtime.start_at.match('00:00:00'); }).length === data.showtimes.length) {
            return [{
                    code: Warnings_1.default.CODES.FAULTY_START_TIMES,
                    title: "all (" + data.showtimes.length + ") showtimes are at 00:00:00"
                }];
        }
        return [];
    }
];
var OutputValidator = /** @class */ (function () {
    function OutputValidator() {
    }
    /** Validates output data for cinema showtimes crawling */
    OutputValidator.validate = function (data, context) {
        return _.chain(checks)
            .map(function (check) { return check(data, context); })
            .flatten()
            .value();
    };
    return OutputValidator;
}());
exports.default = OutputValidator;
