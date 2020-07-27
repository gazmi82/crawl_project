import jsonSchemaToMarkdownTable from './_helper/json-schema_to_markdown.js'
import loadSchema from './_helper/load-schema.js'
import renderSchemaList from './_helper/render-schema-list.js'

(function () {
  'use strict'

  const insertSchemas = (html, next) => {
    var result = html
    var matches = html.match(/(\{\{schema:)(.*)(\}\})/g)

    async.eachLimit(matches, 5, (schemaMatch, cb) => {
      let schemaName = schemaMatch.replace('{{schema:', '').replace('}}', '')
      // console.log(schemaName)
      loadSchema(schemaName, schema => {
        renderSchemaList(schemaName, null, subSchemaHtml => {
          let replacement = marked(jsonSchemaToMarkdownTable(schema))
          replacement += '<hr>'
          replacement += subSchemaHtml
          result = result.replace(schemaMatch, replacement)
          cb()
        })
      },
      err => {
        console.error(err)
        result = result.replace(schemaMatch, schemaMatch + ' **ERROR: failed to replace**')
        cb()
      })
    },
    (e) => {
      next(result)
      console.log('done')
    })
  }

  const index = (html, maxDepth, next) => {
    renderSchemaList('config-schema', null, maxDepth, (schemaHtml) => {
      insertSchemas(html + schemaHtml, next)
    })
  }

  const details = (property, html, next) => {
    loadSchema('config-schema', schema => {
      var result = html
      // result += marked(`## Schema`)
      // result += `<div class="schema">`
      // result += `<pre><code>${JSON.stringify(schema.properties[property], null, 2)}</code></pre>`
      // result += '<hr>'
      // result += marked(jsonSchemaToMarkdownTable(schema))
      // result += '<hr>'
      // result += `</div>`
      next(result)
    })
  }

  const install = (hook, vm) => {
    hook.afterEach((html, next) => {
      var property = (window.location.href.match(/(api)(\/)(\w*)/) || {})[3]
      if (property) {
        details(property, html, next)
      } else if (window.location.href.match(/api$/)) {
        index(html, 2, next)
      } else if (window.location.href.match(/api-complete$/)) {
        index(html, 5, next)
      } else {
        next(html)
      }
    })
  }

  $docsify.plugins = [].concat(install, $docsify.plugins)
}())
