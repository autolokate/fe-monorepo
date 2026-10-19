import { defineConfig, devices } from '@playwright/test';

/**
 * Hermetic Admin UI smoke — ownership-transfer + garage commercial/entitlement.
 *
 * Dead API base; Playwright `page.route` stubs session/profile + admin endpoints.
 * Does not load `.env.e2e.local` or require `E2E_ADMIN_*`.
 */
const hermeticPort = Number(process.env.E2E_HERMETIC_ADMIN_PORT ?? '5179');
const baseURL = `http://127.0.0.1:${String(hermeticPort)}`;
const deadApi = 'http://127.0.0.1:3971';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.hermetic.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: { width: 1440, height: 900 },
    headless: true,
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: `pnpm exec vite --host 127.0.0.1 --port ${String(hermeticPort)} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_API_BASE_URL: deadApi,
      VITE_ENVIRONMENT: 'development',
      VITE_ENABLE_LOGS: 'true',
    },
  },
});
