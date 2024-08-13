# split-module-webpack-plugin
本插件通过在创建模块`createData`阶段审查模块内部依赖，将同一个模块分割输出。

This plugin output the internal dependencies of the module during the `createData` phase of creating the module and splits the output of the same module.

----

# 使用方式 HowToUse

```bash
npm i split-module-webpack-plugin --save-dev
```

```js
// webpack config

const SplitModule = require('split-module-webpack-plugin')

{
  plugins: [
    new SplitModule((dependencies) => {
      return dependencies.map(e => e.name).join('_').toLowerCase()
    })
  ],
}

```

----

# 问题 Problem
当我们使用webpack作为脚手架构建单页应用时，`splitChunk`、`usedExports`和webpack模块缓存机制可能会导致同名模块引用错误。

When we use webpack as a scaffold to build a single-page application, `splitChunk`, `usedExports` and webpack module cache may cause errors in referencing modules with the same name.

```js
// -----------
// source code
// -----------

// utils.js
export func1() {}
export func2() {}

// a.js
import { func1 } from './utils.js'

// b.js
import { func2 } from './utils.js'

// -----------
// after build
// -----------

// 321.js
...
/***/ 321:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ak: () => (/* binding */ func1),
/* harmony export */ });
/* unused harmony exports func2 */
function func1 () {}
function func2 () {}

// 702.js
...
/***/ 321:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   m0: () => (/* binding */ func1),
/* harmony export */ });
/* unused harmony exports func1 */
function func1 () {}
function func2 () {}

/***/ })
```

从例子中可以看出，不同chunk中321模块输出的方法名不同，一个是Ak，另一个是m0，webpack将`utils.js`模块命名为321。但是`splitChunk`有可能会将该模块打包在不同`chunk`中，`usedExports`会将不需要使用的依赖过滤。在单页应用中，321模块的内容会被互相覆盖并最终导致出现问题。

 like the example, webpack names the `utils.js` module as 321. However, `splitChunk` may package the module in different `chunks`, and `usedExports` will filter out unnecessary dependencies. In a single-page application, the contents of the 321 module will overwrite each other and eventually cause problems.

---

# 解决方式 Solution

本插件通过`normalModuleFactory`下的`createModule`钩子对每一次引用的内部依赖进行分析，将内部依赖拼接成字符串并添加进模块的原始请求路径中，以此来区分同一个源代码的不同引用。

This plugin analyzes the internal dependencies of each reference through the `createModule` hook under `normalModuleFactory`, concatenates the internal dependencies into a string and adds it to the request path of the module to distinguish different references to the same source code.

```js
// -----------
// source code
// -----------

// utils.js
export func1() {}
export func2() {}

// a.js
import { func1 } from './utils.js'

// b.js
import { func2 } from './utils.js'

// -----------
// in building
// -----------

// the webpack module createData
{
  ...
  request: './utils.js?func1',
  dependencies: [...]
}

{
  ...
  request: './utils.js?func2',
  dependencies: [...]
}


// -----------
// after build
// -----------

// 321.js
...
/***/ 321:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ak: () => (/* binding */ func1),
/* harmony export */ });
/* unused harmony exports func2 */
function func1 () {}
function func2 () {}

// 814.js
...
/***/ 814:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   m0: () => (/* binding */ func1),
/* harmony export */ });
/* unused harmony exports func1 */
function func1 () {}
function func2 () {}

/***/ })
```