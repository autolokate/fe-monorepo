import { type Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { installHermeticAcademyRoutes } from './helpers/hermetic-academy';
import { installHermeticDailyDriveRoutes } from './helpers/hermetic-daily-drive';
import { installHermeticDiscoveryRoutes } from './helpers/hermetic-discovery';
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
import { installHermeticRepliesRoutes } from './helpers/hermetic-replies';

/**
 * Full Admin wow redesign evidence screenshots.
 * Run: ADMIN_WOW_SHOT_DIR=… pnpm exec playwright test e2e/admin-full-wow-screenshots.hermetic.spec.ts
 */
const OUT = path.resolve(
  process.env.ADMIN_WOW_SHOT_DIR ??
    '/Users/kapil/Library/Application Support/Cursor/AgentStores/cursor_agent_stores/bc-838898e5-01b7-4a1b-9290-525bdb8c17ab/files/media',
);

async function shot(page: Page, name: string) {
  mkdirSync(OUT, { recursive: true });
  await page.screenshot({
    path: path.join(OUT, `admin-full-wow-${name}-2026-10-29.png`),
    fullPage: false,
  });
}

async function gotoHeading(page: Page, route: string, heading: string | RegExp) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: heading })
    .first()
    .waitFor({ timeout: 30_000 })
    .catch(async () => {
      // Still capture error / empty surfaces so the checklist stays honest.
      await page.waitForTimeout(500);
    });
}

test.describe('Admin full wow screenshots (hermetic)', () => {
  test('capture remaining modules', async ({ page }) => {
    test.setTimeout(240_000);
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await installHermeticPartnersRoutes(page);
    await installHermeticDiscoveryRoutes(page);
    await installHermeticRepliesRoutes(page);
    await installHermeticDailyDriveRoutes(page);
    await installHermeticAcademyRoutes(page);

    // Login is unauthenticated — capture before seeding session.
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByText('Autolokate').first().waitFor({ timeout: 30_000 });
    await shot(page, 'login');

    await seedHermeticSession(page);

    await gotoHeading(page, '/dashboard', 'Dashboard');
    await shot(page, 'dashboard');

    await openUsersPage(page);
    await shot(page, 'customers');

    await gotoHeading(page, '/orders', 'Orders');
    await shot(page, 'orders');
    const orderRow = page.locator('[data-testid="orders-table"] tbody tr, table tbody tr').first();
    if (await orderRow.isVisible().catch(() => false)) {
      await orderRow.click();
      await page
        .getByRole('dialog')
        .waitFor({ timeout: 10_000 })
        .catch(() => undefined);
      await shot(page, 'order-detail');
      await page.keyboard.press('Escape');
    }

    await gotoHeading(page, '/shipments', /Deliver|Shipment/i);
    await shot(page, 'deliveries');

    await gotoHeading(page, '/payments', 'Payments');
    await shot(page, 'payments');

    await gotoHeading(page, '/subscriptions', /Coverage|Subscription/i);
    await shot(page, 'coverage');

    await gotoHeading(page, '/finance', /Settlement|Finance|Clawback/i);
    await shot(page, 'settlements');

    await gotoHeading(page, '/promos', /Promo/i);
    await shot(page, 'promos');

    await gotoHeading(page, '/catalog', /Catalog|Plans|SKU/i);
    await shot(page, 'catalog');

    await gotoHeading(page, '/inventory', /Stock|Inventory/i);
    await shot(page, 'stock');

    await gotoHeading(page, '/qr-batches', /Batch/i);
    await shot(page, 'batches');

    await openGarageCommercialPage(page);
    await shot(page, 'garage-commercial');

    await openTaxiPolicyPage(page);
    await shot(page, 'taxi-policy');

    await gotoHeading(page, '/services-catalogue', /Service/i);
    await shot(page, 'services');

    await openPartnersDirectoryPage(page);
    await shot(page, 'partners');

    await openPartnerDetailPage(page);
    await shot(page, 'partner-detail');

    await gotoHeading(page, '/partners/requests', /Request|Bid/i);
    await shot(page, 'requests-bids');

    await gotoHeading(page, '/discovery', /Discovery|Overview/i);
    await shot(page, 'discovery');

    await gotoHeading(page, '/discovery/qa', /Q&A|Question/i);
    await shot(page, 'discovery-qa');

    await gotoHeading(page, '/discovery/replies', /Repl/i);
    await shot(page, 'discovery-replies');

    await gotoHeading(page, '/discovery/reels', /Reel/i);
    await shot(page, 'discovery-reels');

    await gotoHeading(page, '/discovery/daily-drive', /Daily Drive/i);
    await shot(page, 'daily-drive');

    await gotoHeading(page, '/discovery/academy', /Academy/i);
    await shot(page, 'academy');

    await gotoHeading(page, '/ownership-claims', /Ownership claim/i);
    await shot(page, 'ownership-claims');

    await gotoHeading(page, '/ownership-transfers', /Ownership/i);
    await shot(page, 'ownership-transfers');

    await gotoHeading(page, '/audit-events', /Activity|Audit/i);
    await shot(page, 'activity-log');

    await gotoHeading(page, '/incidents', /Incident/i);
    await shot(page, 'incidents');

    await gotoHeading(page, '/support', /Ticket|Support|not available/i);
    await shot(page, 'tickets');
  });
});
