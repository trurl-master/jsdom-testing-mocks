import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginJest from 'eslint-plugin-jest';
import prettier from 'eslint-config-prettier';
import vitest from '@vitest/eslint-plugin'
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...typescript.configs.strict.rules,
      ...jsxA11y.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      // TS handles undefined types, turn off for TS files
      'no-undef': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    plugins: {
      jest: pluginJest,
      vitest,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...pluginJest.environments.globals.globals,
        ...vitest.environments.env.globals,
      },
    },
    rules: {
        ...vitest.configs.recommended.rules,
        // You can also bring in Jest recommended rules if desired
        // ...pluginJest.configs.recommended.rules,
    }
  },
  {
    ignores: ['dist/**'],
  },
  prettier,
]; 