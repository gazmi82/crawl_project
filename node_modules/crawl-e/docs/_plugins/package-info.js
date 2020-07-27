import loadJson from './_helper/load-json.js'

(function () {
  'use strict'
  
  const packageMacroRegex = /(\{\{package:)(\w*)(\}\})/gm
  const install = (hook, vm) => {
    hook.afterEach((html, next) => {
      if (!packageMacroRegex.test(html)) {
        next(html)
        return
      }

      let packageLastModified
      fetch('_plugins/_helper/package.json')
        .then(response => {
          packageLastModified = response.headers.get('Last-Modified')
          return response.json()
        })
        .then(packageInfo => {
          packageInfo['lastModified'] = packageLastModified
          var matches = html.match(packageMacroRegex) || []
          matches.forEach(match => {
            let key = match.replace('{{package:', '').replace('}}', '')
            html = html.replace(match, '' + packageInfo[key])
          })
          next(html)
        })
        .catch(error => {
          console.error(error)
          next(html)
        })
    })
  }

  $docsify.plugins = [].concat(install, $docsify.plugins)
}())
