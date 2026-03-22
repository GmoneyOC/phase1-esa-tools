import js from '@eslint/js';
import globals from 'globals';
import html from 'eslint-plugin-html';

export default [
    js.configs.recommended,
    {
        // HTML files with inline <script> blocks
        files: ['**/*.html'],
        plugins: { html },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.es2021,
                Chart: 'readonly',
                DOMPurify: 'readonly'
            }
        },
        rules: {
            'no-undef': 'error',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'no-redeclare': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-unreachable': 'error',
            'no-constant-condition': 'warn',
            'use-isnan': 'error',
            'valid-typeof': 'error',
            'eqeqeq': ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-with': 'error',
            'no-throw-literal': 'error',
            'no-self-assign': 'error',
            'no-self-compare': 'error',
            // Relax for inline scripts — these are common patterns
            'no-var': 'off',
            'prefer-const': 'off',
            'semi': 'off'
        }
    },
    {
        // JS module files (vite config, eslint config, future src/)
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2021
            }
        },
        rules: {
            'no-undef': 'error',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'no-redeclare': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-unreachable': 'error',
            'no-constant-condition': 'warn',
            'use-isnan': 'error',
            'valid-typeof': 'error',
            'eqeqeq': ['error', 'always'],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-with': 'error',
            'no-throw-literal': 'error',
            'prefer-const': 'warn',
            'no-var': 'warn',
            'no-self-assign': 'error',
            'no-self-compare': 'error',
            'semi': ['warn', 'always'],
            'no-trailing-spaces': 'warn',
            'no-multiple-empty-lines': ['warn', { max: 2 }]
        }
    },
    {
        ignores: [
            'build/**',
            'dist/**',
            'node_modules/**'
        ]
    }
];
