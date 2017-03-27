import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

const rollupConfig = {
  entry: 'src/midigui.js',
  plugins: [
    nodeResolve({
      module: true,
      main: true,
      browser: false,
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
      format: 'umd',
      dest: 'build/midigui.umd.js',
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
