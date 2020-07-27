import jsonSchemaToMarkdownTable from './_helper/json-schema_to_markdown.js'
import loadSchema from './_helper/load-schema.js'
import renderSchemaList from './_helper/render-schema-list.js'

(function () {
  'use strict'

  const insertSchemas = (html, next) => {
    var result = html
    var matches = html.match(/\{\{schema:[^\}]*\}\}/g) || []

    async.eachLimit(matches, 5, (schemaMatch, cb) => {
      let schemaInput = schemaMatch.replace('{{schema:', '').replace('}}', '')
      let schemaName = schemaInput.split(',')[0]
      let maxDepth = parseInt(schemaInput.split(',')[1]) || 0
      console.log(`Inserting schema for ${schemaName}`, ', maxDepth:', maxDepth)
      renderSchemaList(schemaName, null, maxDepth, subSchemaHtml => {
        result = result.replace(schemaMatch, subSchemaHtml)
        cb()
      })
    },
    (e) => {
      next(result)
      console.log('done, insertSchemas (' + matches.length + ')')
    })
  }

  const install = (hook, vm) => {
    hook.afterEach((html, next) => {
      insertSchemas(html, next)
    })
  }

  $docsify.plugins = [].concat(install, $docsify.plugins)
}())
