const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const image = require('@rollup/plugin-image');
const scss = require('rollup-plugin-scss');
const svgo = require('rollup-plugin-svgo');

const name = 'SakanaWidget';
const input = './src/index.ts';

/** @type {import('rollup').RollupOptions} */
const umd = {
  input,
  output: {
    file: './lib/index.js',
    format: 'umd',
    name,
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    scss(),
    image({
      exclude: './src/**/*.svg',
    }),
    svgo(),
  ],
};

/** @type {import('rollup').RollupOptions} */
const esm = {
  input,
  output: {
    file: './lib/index.esm.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    scss({
      output: false,
    }),
    image({
      exclude: './src/**/*.svg',
    }),
    svgo(),
  ],
};

/** @type {import('rollup').RollupOptions} */
const cdn = {
  input,
  output: {
    file: './lib/sakana.min.js',
    format: 'umd',
    name,
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    scss({
      outputStyle: 'compressed',
    }),
    image({
      exclude: './src/**/*.svg',
    }),
    svgo(),
    terser(),
  ],
};

module.exports = [umd, esm, cdn];
