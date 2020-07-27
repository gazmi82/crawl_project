import * as _ from 'underscore'
import * as Ajv from 'ajv'
import * as fs from 'fs'
import * as path from 'path'
import { ConfigError } from './Errors'
import { Logger, SilentLogger } from './Logger'
import { resolveAllOfs, replaceTypesByRef, specsDirPath } from './config-schema'

export default class ConfigValidator {
  private schema: any
  private schemaStore: any = {}
  
  private ajv: Ajv.Ajv
  private validator: Ajv.ValidateFunction

  logger: Logger
  constructor (schema: any, logger?: Logger) {
    this.schema = schema

    this.ajv = new Ajv({ schemaId: 'auto' })
    this.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
    this.ajv.addKeyword('typeof', {
      compile: function (expectedTypes, parentSchema) {
        expectedTypes = typeof expectedTypes === 'string'
          ? [expectedTypes]
          : expectedTypes
        
        function validate(data) {
          //@ts-ignore
          validate.errors = [{
            message: `should be ${expectedTypes}`
          }]
          return data === null || data === undefined || expectedTypes.indexOf(typeof data) !== -1
        }
        return validate
      },
      errors: 'full'
    });
    
    this.loadSpecs()
    this.validator = this.ajv.compile(this.schema)
    this.logger = logger || new SilentLogger()
  }

  private loadSpecs () {
    let specs = fs
      .readdirSync(specsDirPath)
      .filter(f => /^config.*\.json$/.test(f))
    specs.push('cinema-schema.json')
    specs.push('value-grabber-schema.json')
    specs.push('value-grabber-extensive-schema.json')
    specs.forEach(f => {
      let subSchema = require(path.join(specsDirPath, f))
      subSchema = replaceTypesByRef(subSchema, 'ValueGrabber', 'value-grabber-schema.json')
      try {
        this.ajv.addSchema(subSchema)
      } catch (error) {

      }

      this.schemaStore[f] = subSchema
    })
  }

  validate (config: any) {
    if (!config) {
      throw new ConfigError(`Missing Config (got ${config === null ? 'null' : typeof config})`)
    }

    var isValid = this.validator(config);
    if (!isValid)  {
      let cinemasType = typeof config.cinemas
      let errors = this.validator.errors
        .filter(error => {
          if (cinemasType === 'object' && error.message === 'should be array') return false
          if (error.keyword === 'oneOf' && error.dataPath === '.cinemas') return false
          return true
        })

      let error = errors[0]
      this.logErrors(errors)
      throw new ConfigError(this.getErrorMessage(error))
    }

    this.checkForUnkownKeys(config, this.schema)
  }

  private derefSchema(schema: any) {
    let result = schema
    if (result['$ref']) result = this.schemaStore[schema['$ref']]
    if (result['allOf']) result.allOf = result.allOf.map(one => this.derefSchema(one))
    return result
  }

  private checkForUnkownKeys(config: any, schema: any, parentKeyPath?: string) {
    schema = this.derefSchema(schema)
    if (!schema) { return }
    resolveAllOfs(schema)
    if (!schema.properties) { return }

    if (!schema.properties) {
      console.log('schema', schema)
    }
    let knownKeys = Object.keys(schema.properties)

    _.difference(Object.keys(config), knownKeys).forEach(key => {
      this.logger.warn('Found unknown key in crawler config: %s', _.compact([parentKeyPath, key]).join('.'))
    })

    // recursively check all sub schemas
    _.mapObject(schema.properties, (prop, key) => {
      if (config[key]) {
        let configValue = config[key]
        if (prop.properties) {
          this.checkForUnkownKeys(configValue, prop, _.compact([parentKeyPath, key]).join('.'))
        }
        else if (prop['$ref']) {
          let refSchema = this.schemaStore[prop['$ref']]
          if (refSchema) {
            this.checkForUnkownKeys(configValue, refSchema, _.compact([parentKeyPath, key]).join('.'))
          }
        }
        else if (_.has(prop, 'oneOf')) { // special handling for showtimes crawling config 
          prop.oneOf = prop.oneOf.map(one => this.derefSchema(one))
          let configValueType = configValue.constructor.name.toLowerCase() // expecting either array or object
          let subSchema: any = _.find(prop.oneOf, one => one['type'] == configValueType) 
          subSchema = subSchema || {}
          switch (subSchema.type) {
            case 'object':
              this.checkForUnkownKeys(configValue, subSchema, _.compact([parentKeyPath, key]).join('.'))  
              break;
            case 'array':
              configValue.forEach((element, index) => {
                let keypath = _.compact([parentKeyPath, key, `${index}`]).join('.')
                this.checkForUnkownKeys(element, subSchema.items, keypath)
              });
              break;
            default: break;
          }
        }
      }
    })
  }

  private logErrors(errors: Ajv.ErrorObject[]) {
    this.logger.info('\n\n')
    this.logger.error('--------- Config Validation Error ---------')
    errors.forEach(err => {
      this.logger.error(this.getErrorMessage(err))
    })
    this.logger.error('-------------------------------------------')
    this.logger.info('\n\n')
  }

  private getErrorMessage(error: Ajv.ErrorObject) {
    return this.ajv.errorsText([error], { dataVar: 'config' })
  }

  private logSubErrors(err, level: number = 1) {
    if (!err.subErrors) { return }
    err.subErrors.forEach(suberr => {
      this.logger.error(_.range(level).map(i => '-').join(''), suberr.message, 'at', suberr.dataPath)
      this.logSubErrors(suberr, level + 1)
    })
  }
}
