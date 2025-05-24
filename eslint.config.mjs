import config from '@dsrca/config/eslint/eslint.config.js';

export default [
  ...config,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**/*',
      'assets/**/*',
      'dist/**/*',
      'dev-dist/**',
      'public/**/*',
      'scripts/**/*',
    ],
  },
];
