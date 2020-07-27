//  customizing of prism 

(function () {
  'use strict'

  const install = (hook, vm) => {
    hook.doneEach(() => {
      Prism.highlightAll()
    })
  }

  $docsify.plugins = [].concat(install, $docsify.plugins)
}())
