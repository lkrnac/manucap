import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
//import postcss from 'rollup-plugin-postcss-modules'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'

import pkg from './package.json'

export default {
  input: 'src/indexLibrary.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    postcss(),
    url(),
    svgr(),
    resolve(),
    typescript({
      clean: true
    }),
    commonjs({
        namedExports: {
            'node_modules/humanize-duration/humanize-duration.js': ['humanizer'],
            'node_modules//platform/platform.js': ['os'],
            'node_modules/react-is/index.js': ['isValidElementType', 'isContextConsumer'],
            'node_modules/draft-js/lib/Draft.js': ['SelectionState', 'EditorState', 'RichUtils', 'convertFromHTML',
                'ContentState', 'Editor', 'getDefaultKeyBinding']
        }
    })
  ]
}
