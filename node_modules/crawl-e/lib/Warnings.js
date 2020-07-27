"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Warnings;
(function (Warnings) {
    Warnings.CODES = {
        CINEMA_WIHOUT_ADDRESS: 3,
        CINEMA_WITH_INVALID_SLUG: 8,
        DUPLICATED_BOOKING_LINKS: 1,
        WRONG_IS_BOOKING_LINK_CAPABLE: 2,
        FAULTY_START_TIMES: 4,
        OUTPUT_SCHEMA_VALIDATION_ERROR: 5,
        SKIPPED_SHOWTIMES: 6,
        NO_SHOWTIMES: 7,
    };
    function print(warning, log) {
        var appendLineBreak = false;
        var msg = "[" + warning.code + "] " + warning.title;
        if (warning.recoveryHint) {
            msg += '\n\n 👉  ' + warning.recoveryHint;
            appendLineBreak = true;
        }
        if (warning.formatDetails) {
            msg += '\n\n ' + warning.formatDetails();
            appendLineBreak = true;
        }
        if (warning.acceptedReason) {
            msg += '\n  ✔ ignored because: ' + warning.acceptedReason;
            appendLineBreak = true;
        }
        if (appendLineBreak) {
            msg += '\n';
        }
        log(msg);
    }
    Warnings.print = print;
})(Warnings || (Warnings = {}));
exports.default = Warnings;
