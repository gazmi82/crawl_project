"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORIGINAL_VERSION = exports.SUBTITLES_UNDETERMINED = void 0;
var _ = require("underscore");
/** @private */
var Iso6391 = require('iso-639-1');
var Constants_1 = require("./Constants");
/** @private */
exports.SUBTITLES_UNDETERMINED = Constants_1.default.SUBTITLES_UNDETERMINED;
/** @private */
exports.ORIGINAL_VERSION = Constants_1.default.ORIGINAL_VERSION;
/** @private */
var map = {};
var langugeMap = (_a = {},
    _a[exports.ORIGINAL_VERSION] = ['o', 'o.v', 'OV', 'Ov/', 'orig', 'orig. språk', 'original', 'originalsprache', 'originalversion', 'vo'],
    _a.en = ['e', 'eng', 'engl', 'englisch', 'english-spoken', 'version anglaise'],
    _a.de = ['d', 'de', 'dt', 'deu', 'deut', 'deutsch', 'german'],
    _a['de-ch'] = ['schweizerdeutsch'],
    _a.es = ['s', 'sp', 'span', 'spanish', 'vo espagnole'],
    _a.it = ['i', 'it', 'ita', 'ital', 'itali', 'italian', 'italienisch', 'vo italienne'],
    _a.fr = ['f', 'fra', 'frz', 'fran', 'franz', 'französisch', 'v.f.', 'version originale en français'],
    _a.pl = ['polski'],
    _a.ru = ['russian', '(russ.)'],
    _a.tr = ['türkisch', 'türk.'],
    _a.gu = ['gujarati'],
    _a.hi = ['hindi'],
    _a.ja = ['japanese', 'jpn'],
    _a.kn = ['kannada'],
    _a.kok = ['konkani'],
    _a.ml = ['malayalam'],
    _a.mr = ['marathi'],
    _a.ko = ['kor'],
    _a.ne = ['nepali'],
    _a);
/** @private */
function mapping(code) {
    return code === exports.ORIGINAL_VERSION
        ? { language: code, subtitles: null }
        : { language: code, subtitles: [code] };
}
Iso6391.getAllCodes()
    .filter(function (code) { return code !== 'la'; }) // filter la as 1. la is a common article and 2. latin is not a spoken language we need to care of
    .forEach(function (code) {
    map[code] = mapping(code);
    map[Iso6391.getName(code).toLocaleLowerCase()] = mapping(code);
    map[Iso6391.getNativeName(code).toLocaleLowerCase()] = mapping(code);
});
_.mapObject(langugeMap, function (inputs, code) {
    inputs.map(function (k) { return k.toLocaleLowerCase(); }).forEach(function (key) {
        map[key] = mapping(code);
    });
});
map['mit untertitel'] = { language: null, subtitles: exports.SUBTITLES_UNDETERMINED };
map['omdtu'] = { language: exports.ORIGINAL_VERSION, subtitles: ['de'] };
map['omdu'] = { language: exports.ORIGINAL_VERSION, subtitles: ['de'] };
map['omeu'] = { language: exports.ORIGINAL_VERSION, subtitles: ['en'] };
map['omu'] = { language: exports.ORIGINAL_VERSION, subtitles: exports.SUBTITLES_UNDETERMINED };
map['subs'] = { language: null, subtitles: exports.SUBTITLES_UNDETERMINED };
exports.default = map;
