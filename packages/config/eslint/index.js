import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';

const TS_FILES = ['**/*.{ts,tsx,mts,cts}'];
const JS_FILES = ['**/*.{js,mjs,cjs}'];
const JSX_FILES = ['**/*.{jsx,tsx}'];

/**
 * Strict-TypeScript base — enforced identically in EVERY package and app.
 * This is the single source of the shared quality bar; nothing below it may relax a base rule.
 */
export const baseConfig = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/.next/**',
      '**/next-env.d.ts', // Next-generated, never hand-edited
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: TS_FILES,
    extends: [...tseslint.configs.strictTypeChecked],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: JS_FILES,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    extends: [tseslint.configs.disableTypeChecked],
  },
);

/**
 * React layer — applied identically to every app that renders React (qr, admin, ui-preview,
 * website) and every React package (ui, design-system, …). Only the two classic, stable
 * hook-safety rules are enabled; react-hooks v7's experimental React-Compiler rules stay off.
 */
export const reactConfig = [
  { ...react.configs.flat.recommended, files: JSX_FILES },
  { ...react.configs.flat['jsx-runtime'], files: JSX_FILES },
  { ...jsxA11y.flatConfigs.recommended, files: JSX_FILES },
  {
    files: JSX_FILES,
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // TypeScript owns prop typing and the automatic JSX runtime handles the import — off to
      // avoid noise on a fully-typed codebase.
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];

/**
 * Next.js layer — the ONLY framework-specific rules that can't be identical everywhere
 * (they're meaningless outside a Next app). The consumer scopes this to the Next app via `files`.
 */
export const nextConfig = [{ ...nextPlugin.configs['core-web-vitals'] }];

/** @deprecated Use {@link baseConfig}. Kept so existing `import { sharedConfig }` sites keep working. */
export const sharedConfig = baseConfig;

export default baseConfig;
