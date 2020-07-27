import fnMeta from './_helper/fn-meta.js'

var functionNames = []

function createLogger (fnName) {
  let logsTag = document.querySelector(`#${fnName}-logs`)
  logsTag.innerHTML = ''
  var logs = []
  function log (key, ...args) {
    logs.push(`[${key}] ${args.join(' ')}`)
    logsTag.style.display = 'inherit'
    logsTag.innerHTML = logs.join('<br>')
  }
  return {
    debug: (...args) => log('D', ...args)
  }
}

function getInputParams (func) {
  return fnMeta
    .getParamNames(func)
    .filter(pName => !/logger/i.test(pName))
}

function setupLiveDemoFunctions (params) {
  functionNames.forEach(fnName => {
    var func = CrawlE.Utils[fnName]
    var params = getInputParams(func)
    var inputs = params.map(pName => document.querySelector(`#${fnName}-${pName}-input`))
    var output = document.querySelector(`#${fnName}-output`)

    function runDemo () {
      var errorTag = document.querySelector(`#${fnName}-error`)
      try {
        var values = fnMeta.getParamNames(func).map(pName => {
          if (/logger/i.test(pName)) return createLogger(fnName)
          let input = document.querySelector(`#${fnName}-${pName}-input`)
          if (/config/i.test(input.id)) return JSON.parse(input.value)
          return input.value
        })

        var mapped = func.apply(null, values)
        errorTag.style.display = 'none'
      } catch (error) {
        errorTag.style.display = 'block'
        errorTag.innerHTML = error
      }

      console.log(`invoke: ${fnName}:`, values, '->', mapped)
      output.innerHTML = mapped ? JSON.stringify(mapped) : 'null'
    }

    if (output && inputs[0]) {
      inputs.forEach(input => {
        input.addEventListener('keyup', runDemo)
      })
    }
  })
}

function buildDemoHtml (fnName) {
  function buildParamHtml (pName) {
    let id = `${fnName}-${pName}-input`
    return pName === 'config' ? `
    <span class="label">${pName}:</span>
    <textarea id ="${id}" rows="6" cols="50" placeholder="enter JSON …"></textarea>
    ` : `
    <span class="label">${pName}:</span>
    <input id="${id}" placeholder="enter ${pName} …" >
    `
  }

  var func = CrawlE.Utils[fnName]

  if (!func) {
    return `**[DEMO Plugin] ERROR: function <code>${fnName}</code> not found**`
  }

  functionNames.push(fnName)
  var params = getInputParams(func)

  return `
<strong>Live Demo</strong>
<div class="live-demo">
  <span>Inputs</span>
  <span>Output</span>
</div>
<div class="live-demo">
  <div class="inputs">
    ${params.map(buildParamHtml).join('<br>')}    
  </div>
  <div class="output">
    <code id="${fnName}-output"></code>
    <span id="${fnName}-logs" class="logs" style="display: none"></span>
    <span id="${fnName}-error" style="display: none" class="error"></span>
  </div>
</div>
  `
}

(function () {
  'use strict'

  const install = (hook, vm) => {
    hook.afterEach((html, next) => {
      var matches = html.match(/(\{\{demo:)(\w*)(\}\})/gm) || []
      matches.forEach(match => {
        let key = match.replace('{{demo:', '').replace('}}', '')
        html = html.replace(match, buildDemoHtml(key))
      })
      next(html)
    })

    hook.doneEach(() => {
      setTimeout(() => setupLiveDemoFunctions(), 200)
    })
  }

  $docsify.plugins = [].concat(install, $docsify.plugins)
}())
