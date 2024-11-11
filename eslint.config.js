import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/key-spacing': ['error'],
      '@stylistic/keyword-spacing': ['error', { 'overrides': { 'if': { 'after': false }, 'for': { 'after': false }, 'while': { 'after': false } } }],
      '@stylistic/lines-between-class-members': ['error', {
        'enforce': [
          { 'blankLine': 'always', 'prev': 'method', 'next': 'method' }
        ]
      }],
      '@stylistic/member-delimiter-style': ['error', {
        'singleline': {
          'delimiter': 'comma',
          'requireLast': false
        },
      }],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/no-trailing-spaces': ['error'],
      '@stylistic/no-multi-spaces': ['error'],
    }
  }
];