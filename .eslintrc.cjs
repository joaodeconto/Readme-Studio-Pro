// .eslintrc.cjs
/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
  },
  ignorePatterns: ['.next/', 'node_modules/', 'dist/'],
};

module.exports = config;
