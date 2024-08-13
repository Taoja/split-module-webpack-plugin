const HarmonyImportSpecifierDependency = require('webpack/lib/dependencies/HarmonyImportSpecifierDependency')

module.exports = class SplitModule {
  constructor(callback) {
    this.callback = callback
    this.pluginName = 'splitModule'
  }
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(this.pluginName, factory => {
      factory.hooks.createModule.tap(this.pluginName, (createData, resolveData) => {
        var dependencies = resolveData.dependencies.filter(e => e instanceof HarmonyImportSpecifierDependency)
        if (dependencies.length > 0) {
          const result = this.callback(dependencies)
          if (result && typeof result === 'string') {
            const noQuery = /[\.||\\||\/]\w+$/.test(createData.request)
            if (noQuery) {
              createData.request = `${createData.request}?${result}`
            } else {
              createData.request = `${createData.request}&${result}`
            }
          }
        }
      })
    })
  }
}