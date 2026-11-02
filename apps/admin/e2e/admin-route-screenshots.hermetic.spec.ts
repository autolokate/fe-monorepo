import { type Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { adminNavRoutes } from '../src/app/routes/admin-paths';
import { installHermeticAcademyRoutes } from './helpers/hermetic-academy';
import { installHermeticDailyDriveRoutes } from './helpers/hermetic-daily-drive';
import { installHermeticDiscoveryRoutes } from './helpers/hermetic-discovery';
import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import { installHermeticPartnersRoutes } from './helpers/hermetic-partners';
import { installHermeticRepliesRoutes } from './helpers/hermetic-replies';

/**
 * Evidence screenshots for every sidebar route (hermetic fixtures, no live API).
 * Opt-in only — skipped unless ADMIN_SHOT_DIR is set:
 *   ADMIN_SHOT_DIR=… ADMIN_SHOT_TAG=after pnpm test:hermetic e2e/admin-route-screenshots.hermetic.spec.ts
 */
const OUT = process.env.ADMIN_SHOT_DIR ? path.resolve(process.env.ADMIN_SHOT_DIR) : null;
const TAG = process.env.ADMIN_SHOT_TAG ?? 'shot';

function slug(route: string): string {
  return route.replace(/^\//, '').replace(/\//g, '-') || 'root';
}

async function shot(page: Page, name: string, theme: 'light' | 'dark') {
  if (!OUT) return;
  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `${TAG}-${theme}-${name}.png`), fullPage: false });
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  // Let skeleton → content transitions finish (motion tokens are ≤ 250 ms).
  await page.waitForTimeout(400);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Admin route screenshots — ${theme}`, () => {
    test.skip(!OUT, 'Set ADMIN_SHOT_DIR to capture route screenshots');

    test(`every nav route (${theme})`, async ({ page }) => {
      test.setTimeout(300_000);
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.addInitScript((mode) => {
        try {
          window.localStorage.setItem('al-qr-theme', mode);
        } catch {
          /* storage blocked — the OS colour scheme still applies */
        }
      }, theme);
      await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
      await installHermeticPartnersRoutes(page);
      await installHermeticDiscoveryRoutes(page);
      await installHermeticRepliesRoutes(page);
      await installHermeticDailyDriveRoutes(page);
      await installHermeticAcademyRoutes(page);

      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await settle(page);
      await shot(page, 'login', theme);

      await seedHermeticSession(page);
      for (const route of adminNavRoutes) {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        // Wait past the auth bootstrap until the page's own heading is on screen.
        await page
          .locator('#ax-main h2')
          .first()
          .waitFor({ timeout: 20_000 })
          .catch(() => undefined);
        await settle(page);
        await shot(page, slug(route.path), theme);
      }
    });
  });
}
