import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node env + a stubbed global `fetch` (see src/test/fake-fetch.ts): the website talks to the
    // backend only through the shared fetch-based @autolokate/api-client.
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Test the website against the shared packages' SOURCE so the suite never depends on a
      // stale (or missing) `dist/` build.
      '@autolokate/auth': path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@autolokate/api-client': path.resolve(__dirname, '../../packages/api-client/src/index.ts'),
    },
  },
});
