import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: {
            globals: {
                ...globals.node,
                window: true
            }
        }
    },
    {
        plugins: {
            custom: {
                rules: {
                    'no-throw': {
                        create(context) {
                            return {
                                ThrowStatement(node) {
                                    context.report({
                                        node,
                                        message: 'Throwing an Error is not allowed'
                                    });
                                }
                            };
                        },
                        meta: {
                            name: 'no-throw',
                            type: 'problem',
                            docs: {
                                description: 'Disallows throwing erorrs',
                                recommended: true
                            }
                        }
                    }
                }
            }
        },
        rules: {
            'custom/no-throw': 'error'
        }
    },
    {
        rules: {
            'array-callback-return': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'block-scoped-var': 'error',
            'camelcase': 'error',
            'default-case-last': 'error',
            'default-param-last': 'warn',
            'dot-notation': 'error',
            'eqeqeq': 'error',
            'for-direction': 'error',
            'func-names': 'error',
            'func-style': ['error', 'expression'],
            'getter-return': 'error',
            'no-alert': 'error',
            'no-async-promise-executor': 'error',
            'no-case-declarations': 'error',
            'no-class-assign': 'error',
            'no-cond-assign': 'error',
            'no-constant-condition': 'error',
            'no-constructor-return': 'error',
            'no-control-regex': 'error',
            'no-debugger': 'error',
            'no-dupe-args': 'error',
            'no-dupe-class-members': 'error',
            'no-dupe-else-if': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-duplicate-imports': 'error',
            'no-empty': ['error', { 'allowEmptyCatch': true }],
            'no-empty-character-class': 'error',
            'no-empty-function': 'error',
            'no-empty-pattern': 'error',
            'no-empty-static-block': 'error',
            'no-ex-assign': 'error',
            'no-extra-bind': 'error',
            'no-extra-boolean-cast': 'error',
            'no-fallthrough': 'error',
            'no-func-assign': 'error',
            'no-import-assign': 'error',
            'no-implicit-globals': 'error',
            'no-implied-eval': 'error',
            'no-invalid-regexp': 'error',
            'no-invalid-this': 'error',
            'no-irregular-whitespace': 'error',
            'no-labels': 'error',
            'no-lone-blocks': 'error',
            'no-lonely-if': 'error',
            'no-loss-of-precision': 'error',
            'no-misleading-character-class': 'error',
            'no-multi-assign': 'error',
            'no-multi-str': 'error',
            'no-new': 'error',
            'no-new-func': 'error',
            'no-new-wrappers': 'error',
            'no-nonoctal-decimal-escape': 'error',
            'no-obj-calls': 'error',
            'no-octal': 'error',
            'no-octal-escape': 'error',
            'no-redeclare': 'error',
            'no-script-url': 'error',
            'no-self-compare': 'error',
            'no-sequences': 'error',
            'no-shadow': 'error',
            'no-shadow-restricted-names': 'error',
            'no-sparse-arrays': 'error',
            'no-template-curly-in-string': 'error',
            'no-this-before-super': 'error',
            'no-throw-literal': 'error',
            'no-unassigned-vars': 'error',
            'no-underscore-dangle': ['error'],
            'no-unexpected-multiline': 'error',
            'no-unmodified-loop-condition': 'warn',
            'no-unneeded-ternary': ['error'],
            'no-unreachable': 'error',
            'no-unreachable-loop': 'warn',
            'no-unsafe-finally': 'error',
            'no-unsafe-negation': 'error',
            'no-unsafe-optional-chaining': ['error', { 'disallowArithmeticOperators': true }],
            'no-unused-expressions': 'error',
            'no-unused-private-class-members': 'error',
            'no-unused-vars': 'error',
            'no-use-before-define': 'error',
            'no-useless-assignment': 'error',
            'no-useless-backreference': 'error',
            'no-useless-call': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-concat': 'error',
            'no-useless-constructor': 'error',
            'no-useless-escape': 'error',
            'no-useless-return': 'error',
            'no-var': 'error',
            'no-void': 'error',
            'no-warning-comments': 'error',
            'object-shorthand': ['error', 'always'],
            'operator-assignment': ['error', 'always'],
            'prefer-arrow-callback': ['error'],
            'prefer-const': 'error',
            'prefer-rest-params': 'error',
            'use-isnan': 'error',
            'valid-typeof': 'error',
            'yoda': 'error'
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
                'code': 150,
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
]