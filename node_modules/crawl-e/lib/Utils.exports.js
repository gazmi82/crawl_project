const Utils = require('./Utils')
const DatesParsing = require('./parsers/DatesParsing').DatesParsing

var utils = {
  ...Utils.default,
  parseDates: DatesParsing.parseDates
}

module.exports = utils
