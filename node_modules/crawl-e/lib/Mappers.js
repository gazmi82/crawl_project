"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var Mappers;
(function (Mappers) {
    /**
     * Turns a relative href into a full url accoring to the parsed url
     * @param href href value, e.g. grabbed from a link tag
     * @param context
     */
    function mapHref(href, context) {
        if (href && context.requestUrl) {
            href = url.resolve(context.requestUrl, href);
            var host = url.parse(href).host;
            href = href.replace(new RegExp(host + "/" + host), host);
        }
        return href;
    }
    Mappers.mapHref = mapHref;
})(Mappers || (Mappers = {}));
exports.default = Mappers;
