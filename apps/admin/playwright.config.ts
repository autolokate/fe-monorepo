import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_ADMIN_BASE_URL ?? 'http://127.0.0.1:5174';
const headed =
  process.env.E2E_HEADED === '1' ||
  process.env.E2E_HEADED === 'true' ||
  process.env.E2E_PAUSE === '1' ||
  process.env.E2E_PAUSE === 'true';
const slowMoMs = Number(process.env.E2E_SLOWMO_MS ?? (headed ? '0' : '0'));
/** When pausing for inspection, don't kill the test after 90s. */
const pause = process.env.E2E_PAUSE === '1' || process.env.E2E_PAUSE === 'true';

/**
 * Admin UI e2e — QR provisioning and related admin-plane flows.
 *
 * Prerequisites:
 * - API on `E2E_API_BASE_URL` (default http://127.0.0.1:3000)
 * - Admin Vite on `E2E_ADMIN_BASE_URL` (default http://127.0.0.1:5174)
 * - Auth: either `E2E_ADMIN_ACCESS_TOKEN` + `E2E_ADMIN_REFRESH_TOKEN` + `E2E_ADMIN_USER_ID`,
 *   or `E2E_ADMIN_PHONE` + `E2E_ADMIN_OTP` (real OTP verify)
 * - `E2E_SKU_ID` — UUID of a B2C SKU already in `qr.skus`
 *
 * Watch mode (visible browser, step delays, stays open until you resume):
 *   `pnpm test:e2e:watch`  → E2E_HEADED + E2E_PAUSE + slowMo
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: pause ? 0 : 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    headless: !headed,
    launchOptions: {
      ...(slowMoMs > 0 ? { slowMo: slowMoMs } : {}),
    },
  },
  projects: [{ name: 'chromium' }],
});
