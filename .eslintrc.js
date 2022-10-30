const { getESLintConfig } = require('@dsrca/config');

module.exports = getESLintConfig('base', {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
});
