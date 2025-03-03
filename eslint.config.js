import globals from 'globals';
import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended, {
        rules: {
            'block-scoped-var': 'error',
            'camelcase': 'error',
            'no-implicit-globals': 'error',
            'no-lonely-if': 'error',
            'no-var': 'error',
            'prefer-const': 'error'
        }
    }, {
        plugins: { stylistic },
        rules: {
            'stylistic/arrow-spacing': 'error',
            'stylistic/block-spacing': ['error', 'always'],
            'stylistic/brace-style': ['error', '1tbs', {
                'allowSingleLine': true
            }],
            'stylistic/comma-dangle': ['error', 'never'],
            'stylistic/comma-style': ['error', 'last'],
            'stylistic/indent': ['error', 4],
            'stylistic/key-spacing': ['error', {
                'beforeColon': false
            }],
            'stylistic/max-len': ['error', {
                'code': 140,
                'tabWidth': 4
            }],
            'stylistic/no-extra-semi': 'error',
            'stylistic/no-mixed-spaces-and-tabs': 'error',
            'stylistic/no-multi-spaces': 'error',
            'stylistic/no-multiple-empty-lines': ['error', { 'max': 1 }],
            'stylistic/no-tabs': 'error',
            'stylistic/object-curly-newline': ['error', {
                'multiline': true,
                'minProperties': 8,
                'consistent': true
            }],
            'stylistic/object-curly-spacing': ['error', 'always'],
            'stylistic/quotes': ['error', 'single']
        }
    }
];