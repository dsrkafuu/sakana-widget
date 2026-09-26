import { defineConfig } from 'tsdown';

const shared = {
  platform: 'browser' as const,
  outDir: './lib',
  loader: {
    '.png': 'dataurl' as const,
    '.svg': 'text' as const,
  },
};

export default defineConfig([
  {
    ...shared,
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
  },
  {
    ...shared,
    format: {
      esm: {
        target: ['esnext'],
        css: {
          inject: true,
        },
      },
    },
    entry: {
      core: './src/core.ts',
      'characters/chisato': './src/characters/chisato.ts',
      'characters/takina': './src/characters/takina.ts',
    },
    hash: false,
    clean: false,
  },
]);
