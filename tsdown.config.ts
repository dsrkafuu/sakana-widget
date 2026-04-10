import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['./src/index-umd.ts'],
    format: ['umd'],
    outDir: './dist/umd',
    globalName: 'SakanaWidget',
    sourcemap: true,
    css: {
      splitting: true,
    },
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
      '.gif': 'dataurl',
      '.svg': 'text',
    },
    deps: {
      alwaysBundle: ['@juggle/resize-observer'],
    },
  },
  {
    entry: ['./src/index-umd.ts'],
    format: ['umd'],
    outDir: './dist/cdn',
    globalName: 'SakanaWidget',
    sourcemap: true,
    minify: true,
    css: {
      splitting: true,
      minify: true,
    },
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
      '.gif': 'dataurl',
      '.svg': 'text',
    },
    deps: {
      alwaysBundle: ['@juggle/resize-observer'],
    },
  },
  {
    entry: ['./src/index.ts'],
    format: ['esm'],
    outDir: './dist/esm',
    sourcemap: true,
    css: {
      inject: true,
    },
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
      '.gif': 'dataurl',
      '.svg': 'text',
    },
  },
]);
