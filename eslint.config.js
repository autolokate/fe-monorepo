import { sharedConfig } from '@autolokate/config/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Archived audit/tooling scripts under docs/ are not app code — CI's per-package lint
  // never reaches them, so the root config skips them too (keeps the pre-commit gate in sync).
  { ignores: ['docs/**'] },
  ...sharedConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['apps/qr/scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        getComputedStyle: 'readonly',
      },
    },
  },
];
