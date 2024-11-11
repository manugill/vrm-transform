import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic/ts': stylisticTs
    },
    rules: {
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/ts/function-call-spacing': ['error', 'never'],
      '@stylistic/ts/key-spacing': ['error'],
      '@stylistic/ts/keyword-spacing': ['error', { 'overrides': { 'if': { 'after': false }, 'for': { 'after': false }, 'while': { 'after': false } } }],
      '@stylistic/ts/lines-between-class-members': ['error', {
        'enforce': [
          { 'blankLine': 'always', 'prev': 'method', 'next': 'method' }
        ]
      }],
      '@stylistic/ts/member-delimiter-style': ['error', {
        'singleline': {
          'delimiter': 'comma',
          'requireLast': false
        },
      }],
      '@stylistic/ts/quotes': ['error', 'single'],
    }
  }
];