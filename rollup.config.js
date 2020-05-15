import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/eventController.js',
  output: {
    file: 'dist/eventController.min.js',
    format: 'esm', // https://rollupjs.org/guide/en/#outputformat
    name: 'eventController',
    plugins: [
      /**
       * https://rollupjs.org/guide/en/#rollupplugin-node-resolve
       * https://github.com/rollup/plugins/tree/master/packages/node-resolve#resolveonly
       */
      resolve({ resolveOnly: ['@babel/runtime'] }),
      // https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babel({
        babelHelpers: 'runtime',
        include: 'src',
        exclude: '*.test.*', // only transpile our source code
      }),
      /**
       * https://github.com/rollup/plugins/tree/master/packages/babel#babel-configuration-files
       * https://github.com/rollup/plugins/tree/master/packages/babel#using-formats-other-than-es-modules-or-commonjs
       */
      getBabelOutputPlugin({
        configFile: path.resolve(__dirname, '.babelrc'),
      }),
      terser(),
    ],
  },
};
