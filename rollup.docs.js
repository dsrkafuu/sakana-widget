const fs = require('fs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const html = require('@rollup/plugin-html');
const image = require('@rollup/plugin-image');
const scss = require('rollup-plugin-scss');
const svgo = require('rollup-plugin-svgo');

const name = 'SakanaWidget';
const input = './src/index.ts';

/** @type {import('rollup').RollupOptions} */
const site = {
  input,
  output: {
    file: './docs/sakana.min.js',
    format: 'umd',
    name,
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: false,
      outDir: './docs',
    }),
    image({
      exclude: './src/**/*.svg',
    }),
    svgo(),
    scss({
      outputStyle: 'compressed',
      fileName: 'sakana.min.css',
    }),
    html({
      template: () => fs.readFileSync('./index.html', 'utf-8'),
    }),
    terser(),
  ],
};

module.exports = site;
