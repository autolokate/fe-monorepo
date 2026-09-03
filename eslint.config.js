import { baseConfig, reactConfig, nextConfig } from '@autolokate/config/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Archived audit/tooling scripts under docs/ are not app code — CI's per-package lint
  // never reaches them, so the root config skips them too (keeps the pre-commit gate in sync).
  // .vercel is gitignored deploy output; keep it out of root eslint scans too.
  { ignores: ['docs/**', '.vercel/**'] },
  // Identical everywhere: strict TypeScript base + the React layer (react + the two classic
  // hook-safety rules + jsx-a11y) on every .jsx/.tsx in the monorepo.
  ...baseConfig,
  ...reactConfig,
  // The ONLY rules that can't be identical: Next.js's own — scoped to the Next app alone.
  ...nextConfig.map((c) => ({
    ...c,
    files: ['apps/website/**/*.{ts,tsx,jsx}'],
    settings: {
      ...c.settings,
      next: { rootDir: 'apps/website' },
    },
  })),
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
