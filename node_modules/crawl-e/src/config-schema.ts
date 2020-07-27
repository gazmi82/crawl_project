import * as path from 'path'
import * as _ from 'underscore'
let configSchema = require('../spec/config-schema.json')

export default configSchema

export function replaceTypesByRef(schema, type, ref) {
  let schemaAsString = JSON.stringify(schema, null, 2)
  let searchString = `"type": "${type}"`
  let replaceString = `"$ref": "${ref}"`
  schemaAsString = schemaAsString.replace(new RegExp(searchString, 'g'), replaceString)
  return JSON.parse(schemaAsString)
}

export function resolveAllOfs(schema: any) {
  if (schema.allOf) {
    schema.properties = schema.properties || {}
    let _resolveAllOfs = (_schema) => {
      (_schema.allOf || []).forEach(subSchema => {
        _.mapObject(subSchema.properties || {}, (prop, key) => {
          schema.properties[key] = prop
        })
        _resolveAllOfs(subSchema)
      })
    }
    _resolveAllOfs(schema)
  }
  
  // recursively check all sub schemas
  _.mapObject(schema.properties, (prop, key) => {
    if (prop.type === 'object') {
      resolveAllOfs(schema.properties[key])
    }
    else if (prop.oneOf) {
      prop.oneOf.filter(one => one.type === 'object').map(one => {
        resolveAllOfs(one)
      })
      prop.oneOf.filter(one => one.type === 'array').map(one => {
        resolveAllOfs(one.items)
      })
    }
  })
}

let derefBaseDir = 'spec'
var node_modules_match = __dirname.match(/node_modules.*/)
if (node_modules_match) {
  derefBaseDir = path.join(node_modules_match[0]
    .split(path.sep)
    .slice(0, -1)
    .join(path.sep),
    derefBaseDir)
}

export const specsDirPath = path.join(path.resolve(), derefBaseDir)