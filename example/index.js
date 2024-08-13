const webpack = require('webpack');
const path = require('path')
const SplitModuleWebpackPlugin = require('../index')

function build() {
  const options = [{
    entry: {
      a: './src/a.js',
      b: './src/b.js',
      c: './src/c.js',
      d: './src/d.js',
      e: './src/e.js',
    },
    output: {
      filename: '[name].js',
      clean: true,
      path: path.resolve(__dirname, 'dist', 'before')
    },
    optimization: {
      moduleIds: 'deterministic',
      minimize: false,
      splitChunks: {
        chunks: 'async',
        minSize: 1,
        minChunks: 2,
      }
    }
  }, {
    entry: {
      a: './src/a.js',
      b: './src/b.js',
      c: './src/c.js',
      d: './src/d.js',
      e: './src/e.js',
    },
    output: {
      filename: '[name].js',
      clean: true,
      path: path.resolve(__dirname, 'dist', 'after')
    },
    plugins: [
      new SplitModuleWebpackPlugin((dependencies) => {
        return dependencies.map(e => e.name).join('_').toLowerCase()
      })
    ],
    optimization: {
      moduleIds: 'deterministic',
      minimize: false,
      splitChunks: {
        chunks: 'async',
        minSize: 1,
        minChunks: 2,
      }
    }
  },]
  const compiler = webpack(options)
  compiler.run(e => {
    if (e) {
      console.error(e)
      process.exit(1)
    }
    compiler.close(err => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      process.exit(0)
    })
  })
}

build()