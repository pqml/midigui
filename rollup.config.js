import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

const rollupConfig = {
  entry: 'src/midigui.js',
  plugins: [
    nodeResolve({
      main: true,
      module: true,
      browser: true,
      skip: [],
      extensions: ['.js', '.json']
    }),
    commonjs({}),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  targets: [
    {
      format: 'iife',
      dest: 'build/midigui.browser.js',
      moduleName: 'midigui'
    },
    {
      format: 'es',
      dest: 'build/midigui.es.js'
    },
    {
      format: 'cjs',
      dest: 'build/midigui.js'
    }
  ],
  indent: '  ',
  sourceMap: false
}

export default rollupConfig
