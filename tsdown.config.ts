import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    platform: 'browser',
    format: {
      esm: {
        target: ['esnext'],
        css: {
          fileName: 'index.css',
          inject: true,
        },
      },
      umd: {
        target: ['es2021'],
        globalName: 'SakanaWidget',
        minify: true,
        css: {
          fileName: 'index.min.css',
          minify: true,
        },
      },
    },
    entry: './src/index.ts',
    outDir: './lib',
    loader: {
      '.png': 'dataurl',
      '.svg': 'text',
    },
    sourcemap: true,
  },
]);
