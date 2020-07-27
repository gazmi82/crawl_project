"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var Ajv = require("ajv");
var fs = require("fs");
var path = require("path");
var Errors_1 = require("./Errors");
var Logger_1 = require("./Logger");
var config_schema_1 = require("./config-schema");
var ConfigValidator = /** @class */ (function () {
    function ConfigValidator(schema, logger) {
        this.schemaStore = {};
        this.schema = schema;
        this.ajv = new Ajv({ schemaId: 'auto' });
        this.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
        this.ajv.addKeyword('typeof', {
            compile: function (expectedTypes, parentSchema) {
                expectedTypes = typeof expectedTypes === 'string'
                    ? [expectedTypes]
                    : expectedTypes;
                function validate(data) {
                    //@ts-ignore
                    validate.errors = [{
                            message: "should be " + expectedTypes
                        }];
                    return data === null || data === undefined || expectedTypes.indexOf(typeof data) !== -1;
                }
                return validate;
            },
            errors: 'full'
        });
        this.loadSpecs();
        this.validator = this.ajv.compile(this.schema);
        this.logger = logger || new Logger_1.SilentLogger();
    }
    ConfigValidator.prototype.loadSpecs = function () {
        var _this = this;
        var specs = fs
            .readdirSync(config_schema_1.specsDirPath)
            .filter(function (f) { return /^config.*\.json$/.test(f); });
        specs.push('cinema-schema.json');
        specs.push('value-grabber-schema.json');
        specs.push('value-grabber-extensive-schema.json');
        specs.forEach(function (f) {
            var subSchema = require(path.join(config_schema_1.specsDirPath, f));
            subSchema = config_schema_1.replaceTypesByRef(subSchema, 'ValueGrabber', 'value-grabber-schema.json');
            try {
                _this.ajv.addSchema(subSchema);
            }
            catch (error) {
            }
            _this.schemaStore[f] = subSchema;
        });
    };
    ConfigValidator.prototype.validate = function (config) {
        if (!config) {
            throw new Errors_1.ConfigError("Missing Config (got " + (config === null ? 'null' : typeof config) + ")");
        }
        var isValid = this.validator(config);
        if (!isValid) {
            var cinemasType_1 = typeof config.cinemas;
            var errors = this.validator.errors
                .filter(function (error) {
                if (cinemasType_1 === 'object' && error.message === 'should be array')
                    return false;
                if (error.keyword === 'oneOf' && error.dataPath === '.cinemas')
                    return false;
                return true;
            });
            var error = errors[0];
            this.logErrors(errors);
            throw new Errors_1.ConfigError(this.getErrorMessage(error));
        }
        this.checkForUnkownKeys(config, this.schema);
    };
    ConfigValidator.prototype.derefSchema = function (schema) {
        var _this = this;
        var result = schema;
        if (result['$ref'])
            result = this.schemaStore[schema['$ref']];
        if (result['allOf'])
            result.allOf = result.allOf.map(function (one) { return _this.derefSchema(one); });
        return result;
    };
    ConfigValidator.prototype.checkForUnkownKeys = function (config, schema, parentKeyPath) {
        var _this = this;
        schema = this.derefSchema(schema);
        if (!schema) {
            return;
        }
        config_schema_1.resolveAllOfs(schema);
        if (!schema.properties) {
            return;
        }
        if (!schema.properties) {
            console.log('schema', schema);
        }
        var knownKeys = Object.keys(schema.properties);
        _.difference(Object.keys(config), knownKeys).forEach(function (key) {
            _this.logger.warn('Found unknown key in crawler config: %s', _.compact([parentKeyPath, key]).join('.'));
        });
        // recursively check all sub schemas
        _.mapObject(schema.properties, function (prop, key) {
            if (config[key]) {
                var configValue = config[key];
                if (prop.properties) {
                    _this.checkForUnkownKeys(configValue, prop, _.compact([parentKeyPath, key]).join('.'));
                }
                else if (prop['$ref']) {
                    var refSchema = _this.schemaStore[prop['$ref']];
                    if (refSchema) {
                        _this.checkForUnkownKeys(configValue, refSchema, _.compact([parentKeyPath, key]).join('.'));
                    }
                }
                else if (_.has(prop, 'oneOf')) { // special handling for showtimes crawling config 
                    prop.oneOf = prop.oneOf.map(function (one) { return _this.derefSchema(one); });
                    var configValueType_1 = configValue.constructor.name.toLowerCase(); // expecting either array or object
                    var subSchema_1 = _.find(prop.oneOf, function (one) { return one['type'] == configValueType_1; });
                    subSchema_1 = subSchema_1 || {};
                    switch (subSchema_1.type) {
                        case 'object':
                            _this.checkForUnkownKeys(configValue, subSchema_1, _.compact([parentKeyPath, key]).join('.'));
                            break;
                        case 'array':
                            configValue.forEach(function (element, index) {
                                var keypath = _.compact([parentKeyPath, key, "" + index]).join('.');
                                _this.checkForUnkownKeys(element, subSchema_1.items, keypath);
                            });
                            break;
                        default: break;
                    }
                }
            }
        });
    };
    ConfigValidator.prototype.logErrors = function (errors) {
        var _this = this;
        this.logger.info('\n\n');
        this.logger.error('--------- Config Validation Error ---------');
        errors.forEach(function (err) {
            _this.logger.error(_this.getErrorMessage(err));
        });
        this.logger.error('-------------------------------------------');
        this.logger.info('\n\n');
    };
    ConfigValidator.prototype.getErrorMessage = function (error) {
        return this.ajv.errorsText([error], { dataVar: 'config' });
    };
    ConfigValidator.prototype.logSubErrors = function (err, level) {
        var _this = this;
        if (level === void 0) { level = 1; }
        if (!err.subErrors) {
            return;
        }
        err.subErrors.forEach(function (suberr) {
            _this.logger.error(_.range(level).map(function (i) { return '-'; }).join(''), suberr.message, 'at', suberr.dataPath);
            _this.logSubErrors(suberr, level + 1);
        });
    };
    return ConfigValidator;
}());
exports.default = ConfigValidator;
