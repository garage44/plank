import stylistic from '@stylistic/eslint-plugin'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'

export default [
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                WebSocket: 'readonly',
                fetch: 'readonly',
                Bun: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            '@stylistic': stylistic,
            'react': react,
        },
        rules: {
            // TypeScript rules
            '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
            '@typescript-eslint/no-explicit-any': 'warn',

            // Stylistic rules
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
            '@stylistic/indent': ['error', 4],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/arrow-parens': ['error', 'always'],
            '@stylistic/brace-style': ['error', '1tbs'],
            '@stylistic/object-curly-spacing': ['error', 'never'],
            '@stylistic/array-bracket-spacing': ['error', 'never'],

            // React/Preact rules
            'react/react-in-jsx-scope': 'off', // Not needed with Preact
            'react/prop-types': 'off', // Using TypeScript
        },
        settings: {
            react: {
                pragma: 'h',
                version: '18.0',
            },
        },
    },
]
