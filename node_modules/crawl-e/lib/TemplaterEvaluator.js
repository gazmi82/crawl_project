"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectPath = require("object-path");
var moment = require("moment");
var _ = require("underscore");
/**
 * Class with static functions to fill placeholders in templates with actual value.
 */
var TemplaterEvaluator = /** @class */ (function () {
    function TemplaterEvaluator() {
    }
    /**
     * Resolves placeholders in a url template string or json object in a given context,
     * such as interation on a single cinemas.
     * @param template
     * @param context
     * @returns the template with the placeholders
     */
    TemplaterEvaluator.evaluate = function (template, context) {
        if (typeof template === 'string') {
            return this.evaluateString(template, context);
        }
        else if (typeof template === 'object') {
            var jsonString = JSON.stringify(template);
            jsonString = this.evaluateString(jsonString, context);
            return JSON.parse(jsonString);
        }
        else {
            return template;
        }
    };
    /**
     * Resolves the placeholders in a template request's url and payload.
     * @param requestTemplate a request template object with placeholders
     * @param context
     */
    TemplaterEvaluator.evaluateRequestObject = function (requestTemplate, context) {
        return {
            url: this.evaluate(requestTemplate.url, context),
            postData: TemplaterEvaluator.evaluate(requestTemplate.postData, context)
        };
    };
    TemplaterEvaluator.evaluateString = function (template, context) {
        var url = template;
        var placeholders = template.match(/\:[a-z\.]*(\([^)]*\)){0,1}\:/gi) || [];
        placeholders.forEach(function (placeholder) {
            var keyPath = placeholder.slice(1, -1);
            keyPath = keyPath.replace(/\([^)]*\)/, '');
            var value;
            if (value = ObjectPath.get(context, keyPath)) {
                if (value instanceof moment) {
                    value = value.format(context.dateFormat);
                }
                url = url.replace(placeholder, value);
            }
        });
        return url;
    };
    /**
     * Parses a template string with `:page(*):` placeholder and returns an array of page identifiers.
     * Only matches a single / the first placeholder.
     * @param template template string that contains  placeholder
     * @returns the list page identifiers or `null` if no valid placeholder was found
     */
    TemplaterEvaluator.parseStaticPages = function (template) {
        if (!template) {
            return null;
        }
        var rangeMatch = template.match(/\:page\((\d+),(\d+)\)\:/);
        if (rangeMatch) {
            return _.range(parseInt(rangeMatch[1]), parseInt(rangeMatch[2]) + 1).map(function (i) { return "" + i; });
        }
        var match = template.match(/\:page\(\[([^\]]*)\]\)\:/);
        if (!match) {
            return null;
        }
        return match[1].split(',');
    };
    return TemplaterEvaluator;
}());
exports.default = TemplaterEvaluator;
