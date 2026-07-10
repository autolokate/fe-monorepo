import type { Page } from '@playwright/test';

/** Delay between major UI states when `E2E_STEP_MS` is set (watch mode). */
export async function showState(page: Page, label: string): Promise<void> {
  const ms = Number(process.env.E2E_STEP_MS ?? '0');
  if (ms > 0) {
    // eslint-disable-next-line no-console -- intentional watch-mode breadcrumb
    console.log(`[e2e:watch] ${label}`);
    await page.waitForTimeout(ms);
  }
}

/**
 * Keep the headed browser open (Playwright Inspector) until you click Resume.
 * Enabled with `E2E_PAUSE=1` — used by `pnpm test:e2e:watch`.
 */
export async function pauseIfWatching(page: Page): Promise<void> {
  if (process.env.E2E_PAUSE === '1' || process.env.E2E_PAUSE === 'true') {
    // eslint-disable-next-line no-console -- intentional watch-mode breadcrumb
    console.log('[e2e:watch] Paused — inspect the browser, then Resume in Playwright Inspector.');
    await page.pause();
  }
}
