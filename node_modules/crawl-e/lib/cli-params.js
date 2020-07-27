"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var _ = require("underscore");
var Constants_1 = require("./Constants");
program
    .option('-v, --verbose [filter]', "Enables all Crawl-E framework related debug outputs. Same as calling with DEBUG=" + Constants_1.default.MAIN_DEBUG_PREFIX + "* when calling wihtout filter. Filter translates into DEBUG=" + Constants_1.default.MAIN_DEBUG_PREFIX + "*filter* and may also be a comma separted list.")
    .option('-l, --limit <n>', 'Limits all iteration of list to the given number. (e.g. limit crawling to only 1 cinema during development)', parseInt)
    .option('-c, --cache-dir [directory]', 'Caches requests in a local files stored in the given [directory] or into `cache` to save requests and speed up development')
    .allowUnknownOption()
    .parse(process.argv);
if (program.verbose) {
    if (program.verbose === true) {
        process.env.DEBUG = _.compact([process.env.DEBUG, Constants_1.default.MAIN_DEBUG_PREFIX + '*']).join(',');
    }
    else {
        process.env.DEBUG = _.chain([process.env.DEBUG]).union(program.verbose.split(',').map(function (f) { return Constants_1.default.MAIN_DEBUG_PREFIX + "*" + f.trim() + "*"; })).compact().join(',').value();
    }
}
if (program.cacheDir === true) {
    program.cacheDir = 'cache';
}
exports.default = program;
