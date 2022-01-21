module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    // extraFileExtensions: ['.cjs'],
  },
  plugins: ['@typescript-eslint'],
  env: {
    es6: true,
    node: true,
    browser: true,
    commonjs: true,
    jest: true,
  },
  extends: [
    // 'airbnb-base',
    // 'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    'import/order': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/export': 'off',
    'no-empty-function': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/consistent-type-imports': 2,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowedNames: ['self', 'ctx'], // Allow `const self = this`; `[]` by default
      },
    ],
  },
}
