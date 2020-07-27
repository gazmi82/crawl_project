const fs = require('fs')
const path = require('path')

let schema = require('./config-schema_hooks.json')
let searchString = `"type": "object"`
let replaceString = `"type": "function"`
let schemaPropertiesAsString = JSON.stringify(schema.properties, null, 2)
schemaPropertiesAsString = schemaPropertiesAsString.replace(new RegExp(searchString, 'g'), replaceString)
schema.properties = JSON.parse(schemaPropertiesAsString)

fs.writeFileSync(path.join(__dirname, 'config-schema_hooks.json'), JSON.stringify(schema, null, 4))
