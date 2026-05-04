import { defineConfig } from 'oxlint';

export default defineConfig({
  // https://oxc.rs/docs/guide/usage/linter/plugins.html#supported-plugins
  plugins: ['oxc', 'node', 'eslint', 'import', 'promise', 'unicorn', 'typescript'],
  rules: {},
});
