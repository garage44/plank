import stylistic from '@stylistic/eslint-plugin'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import perfectionist from 'eslint-plugin-perfectionist'

export default [
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            globals: {
                Bun: 'readonly',
                console: 'readonly',
                document: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                WebSocket: 'readonly',
                window: 'readonly',
            },
            parser: tsparser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@stylistic': stylistic,
            '@typescript-eslint': tseslint,
            'perfectionist': perfectionist,
            'react': react,
        },
        rules: {
            '@stylistic/array-bracket-spacing': ['error', 'never'],
            '@stylistic/arrow-parens': ['error', 'always'],

            '@stylistic/brace-style': ['error', '1tbs'],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/indent': ['error', 4],
            '@stylistic/member-delimiter-style': ['error', {
                multiline: {
                    delimiter: 'none',
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            }],
            '@stylistic/object-curly-spacing': ['error', 'never'],
            '@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
            // Stylistic rules
            '@stylistic/semi': ['error', 'never'],
            '@typescript-eslint/naming-convention': ['error', {
                filter: {
                    match: false,
                    regex: '^(__.*__|Content-Type)$',
                },
                format: ['snake_case'],
                leadingUnderscore: 'allow',
                selector: 'objectLiteralProperty',
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            // TypeScript rules
            '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],

            'perfectionist/sort-interfaces': ['error', {
                ignoreCase: true,
                order: 'asc',
                type: 'natural',
            }],
            'perfectionist/sort-object-types': ['error', {
                ignoreCase: true,
                order: 'asc',
                type: 'natural',
            }],
            // Sorting rules (auto-fixable)
            'perfectionist/sort-objects': ['error', {
                ignoreCase: true,
                order: 'asc',
                type: 'natural',
            }],

            'react/prop-types': 'off', // Using TypeScript
            // React/Preact rules
            'react/react-in-jsx-scope': 'off', // Not needed with Preact
        },
        settings: {
            react: {
                pragma: 'h',
                version: '18.0',
            },
        },
    },
]
