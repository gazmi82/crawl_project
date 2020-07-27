import { renderSchemaPropertyRow } from './_helper/render-schema-list.js'

(function () {
  'use strict'

  const renderParam = (paramInput) => {
    let html
    let paramJson
    try {
      paramJson = paramInput
        .replace(/"/g, '\\"')
        .replace('[', '{"')
        .replace(/: /g, '": "')
        .replace(/, (?=[^,]*:)/g, '", "')
        .replace(']', '"}')
      let param = JSON.parse(paramJson)
      param.typeTags = [{ cssClass: param.type, label: param.type }]
      param.descriptionHtml = param.description
      html = renderSchemaPropertyRow(param)
    } catch (error) {
      html = [
        `<div class="error" style="font-size: 14px">failed to render param: <i>${error}</i>`,
        `paramInput: <small><code>${paramInput}</code></small>`,
        `paramJson: <small><code>${paramJson}</code></small>`,
        `</div>`
      ].join('<br>')
    }
    return html
  }

  const insertParameters = (html, next) => {
    var result = html
    var matches = html.match(/\{\{param:[^\}]*\}\}/g) || []

    async.eachLimit(matches, 5, (paramMatch, cb) => {
      let paramInput = paramMatch.replace('{{param:', '').replace('}}', '')
      result = result.replace(paramMatch, renderParam(paramInput))
      cb()
    },
    (e) => {
      var matches = html.match(/\{\{params:[^\}]*\}\}/g) || []
      async.eachLimit(matches, 5, (paramsMatch, cb) => {
        let paramsInput = paramsMatch.replace('{{params:', '').replace('}}', '')
        let lines = paramsInput.split('\n').filter(l => l.length > 0)
        let html = _.chain(lines).compact().map(l => renderParam(`[${l}]`)).value().join('\n')
        result = result.replace(paramsMatch, `<div class="api-reference parameter-list">${html}</div>`)
        cb()
      }, (e) => {
        next(result)
        console.log('done, insertParameters (' + matches.length + ')')
      })
    })
  }

  const install = (hook, vm) => {
    hook.afterEach((html, next) => {
      insertParameters(html, next)
    })
  }

  $docsify.plugins = [].concat(install, $docsify.plugins)
}())
