import { type Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

import {
  installHermeticApiRoutes,
  openGarageCommercialPage,
  openTaxiPolicyPage,
  openUsersPage,
  seedHermeticSession,
} from './helpers/hermetic';
import {
  installHermeticPartnersRoutes,
  openPartnerDetailPage,
  openPartnersDirectoryPage,
} from './helpers/hermetic-partners';

/**
 * One-shot hermetic screenshots for Admin wow redesign evidence.
 * Not part of CI smoke — set ADMIN_WOW_SHOT_DIR to enable:
 *   ADMIN_WOW_SHOT_DIR=… pnpm exec playwright test e2e/admin-wow-screenshots.hermetic.spec.ts
 */
const OUT = process.env.ADMIN_WOW_SHOT_DIR ? path.resolve(process.env.ADMIN_WOW_SHOT_DIR) : null;

async function shot(page: Page, name: string) {
  if (!OUT) return;
  mkdirSync(OUT, { recursive: true });
  await page.screenshot({
    path: path.join(OUT, `admin-wow-${name}-2026-10-29.png`),
    fullPage: false,
  });
}

test.describe('Admin wow screenshots (hermetic)', () => {
  test.skip(!OUT, 'Set ADMIN_WOW_SHOT_DIR to capture wow screenshots');

  test('capture priority + shell screens', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticPartnersRoutes(page);
    await seedHermeticSession(page);

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor({ timeout: 30_000 });
    await shot(page, 'dashboard');

    await openTaxiPolicyPage(page);
    await shot(page, 'taxi-policy');

    await page.getByRole('button', { name: 'Provision Taxi' }).click();
    await page.getByRole('heading', { name: 'Provision Taxi partner' }).waitFor();
    await shot(page, 'taxi-provision-modal');
    await page.keyboard.press('Escape');

    await openGarageCommercialPage(page);
    await shot(page, 'garage-commercial');

    await openUsersPage(page);
    await shot(page, 'customers');

    await openPartnersDirectoryPage(page);
    await shot(page, 'partners');

    await openPartnerDetailPage(page);
    await shot(page, 'partner-detail');

    await page.goto('/discovery', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Discovery|Overview/i }).waitFor({ timeout: 30_000 });
    await shot(page, 'discovery');

    await page.goto('/orders', { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Orders' }).waitFor({ timeout: 30_000 });
    await shot(page, 'orders');

    await page.emulateMedia({ colorScheme: 'light' });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await openTaxiPolicyPage(page);
    await shot(page, 'taxi-policy-light');
  });
});
