const utils = require('./Utils.exports')

var CrawlE = window.CrawlE || {}
// Stick on the modules that need to be exported.
// You only need to require the top-level modules, browserify
// will walk the dependency graph and load everything correctly
CrawlE.Utils = utils
// Replace/Create the global namespace
window.CrawlE = CrawlE
