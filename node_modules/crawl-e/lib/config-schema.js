"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specsDirPath = exports.resolveAllOfs = exports.replaceTypesByRef = void 0;
var path = require("path");
var _ = require("underscore");
var configSchema = require('../spec/config-schema.json');
exports.default = configSchema;
function replaceTypesByRef(schema, type, ref) {
    var schemaAsString = JSON.stringify(schema, null, 2);
    var searchString = "\"type\": \"" + type + "\"";
    var replaceString = "\"$ref\": \"" + ref + "\"";
    schemaAsString = schemaAsString.replace(new RegExp(searchString, 'g'), replaceString);
    return JSON.parse(schemaAsString);
}
exports.replaceTypesByRef = replaceTypesByRef;
function resolveAllOfs(schema) {
    if (schema.allOf) {
        schema.properties = schema.properties || {};
        var _resolveAllOfs_1 = function (_schema) {
            (_schema.allOf || []).forEach(function (subSchema) {
                _.mapObject(subSchema.properties || {}, function (prop, key) {
                    schema.properties[key] = prop;
                });
                _resolveAllOfs_1(subSchema);
            });
        };
        _resolveAllOfs_1(schema);
    }
    // recursively check all sub schemas
    _.mapObject(schema.properties, function (prop, key) {
        if (prop.type === 'object') {
            resolveAllOfs(schema.properties[key]);
        }
        else if (prop.oneOf) {
            prop.oneOf.filter(function (one) { return one.type === 'object'; }).map(function (one) {
                resolveAllOfs(one);
            });
            prop.oneOf.filter(function (one) { return one.type === 'array'; }).map(function (one) {
                resolveAllOfs(one.items);
            });
        }
    });
}
exports.resolveAllOfs = resolveAllOfs;
var derefBaseDir = 'spec';
var node_modules_match = __dirname.match(/node_modules.*/);
if (node_modules_match) {
    derefBaseDir = path.join(node_modules_match[0]
        .split(path.sep)
        .slice(0, -1)
        .join(path.sep), derefBaseDir);
}
exports.specsDirPath = path.join(path.resolve(), derefBaseDir);
