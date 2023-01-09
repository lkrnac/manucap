import json from "@rollup/plugin-json";
import svgr from "@svgr/rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import path from "path";

import pkg from "./package.json";
import copy from "rollup-plugin-copy";

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
        postcss({
            extract: path.resolve('dist/dist.css')
        }),
        url(),
        json(),
        svgr(),
        resolve(),
        typescript({ tsconfig: "./tsconfig.json" }),
        copy({
            targets: [
                { src: "src/@types", dest: "dist" }
            ]
        }),
        commonjs({
            namedExports: {
                'node_modules/humanize-duration/humanize-duration.js': ['humanizer'],
                'node_modules//platform/platform.js': ['os'],
                'node_modules/react-is/index.js': ['isValidElementType', 'isContextConsumer'],
                'node_modules/draft-js/lib/Draft.js': ['SelectionState', 'EditorState', 'RichUtils', 'convertFromHTML',
                    'ContentState', 'Editor', 'getDefaultKeyBinding', 'CompositeDecorator', 'Modifier'],
                'node_modules/lodash/lodash.js': ['lodash', 'debounce', 'findIndex', 'findLastIndex']
            }
        })
    ]
}
