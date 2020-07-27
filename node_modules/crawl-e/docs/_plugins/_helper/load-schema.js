import loadJson from './load-json.js'

let SCHEMA_CACHE = {}

export default (name, cb, errorCb) => {
  if (SCHEMA_CACHE[name]) {
    setTimeout(() => {
      cb(SCHEMA_CACHE[name])
    }, 1)
  } else {
    loadJson(`_schemas/${name}.json`.replace('.json.json', '.json'), schema => {
      SCHEMA_CACHE[name] = schema
      cb(schema)
    }, errorCb)
  }
}
