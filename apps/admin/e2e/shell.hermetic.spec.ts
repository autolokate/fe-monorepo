import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

/** App shell: grouped sidebar, collapse rail, breadcrumbs, command palette, skip link. */
test.describe('Admin shell (hermetic)', () => {
  test.beforeEach(async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await seedHermeticSession(page);
  });

  test('breadcrumbs follow the route and link back to the list', async ({ page }) => {
    await page.goto('/taxi-policy');
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(crumbs).toContainText('Taxi', { timeout: 30_000 });
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Taxi policy');
  });

  test('sidebar groups collapse, the rail persists across reloads', async ({ page }) => {
    await page.goto('/dashboard');
    const nav = page.getByRole('navigation', { name: 'Admin navigation' });
    await expect(nav.getByRole('link', { name: 'Bookings', exact: true })).toBeVisible({
      timeout: 30_000,
    });

    // Collapse the Taxi group: its links leave the accessibility tree.
    await nav.getByRole('button', { name: 'Taxi', exact: true }).click();
    await expect(nav.getByRole('button', { name: 'Taxi', exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(nav.getByRole('link', { name: 'Bookings', exact: true })).toHaveCount(0);

    // Icon rail: labels hidden, links keep their accessible names; remembered after reload.
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(nav.getByRole('link', { name: 'Orders', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();
  });

  test('⌘K palette filters pages and navigates with the keyboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await page.keyboard.press('ControlOrMeta+k');
    const palette = page.getByRole('dialog', { name: 'Command palette' });
    await expect(palette).toBeVisible();
    await page.keyboard.type('revenue');

    await expect(palette.locator('[cmdk-item][data-selected="true"]')).toContainText('Revenue');
    await page.keyboard.press('Enter');
    await expect(palette).toHaveCount(0);
    await expect(page).toHaveURL(/\/taxi\/revenue$/);

    // Reopen: the page just visited is listed under Recent; Escape closes.
    await page.getByRole('button', { name: /Jump to/ }).click();
    await expect(palette.getByText('Recent', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(palette).toHaveCount(0);
  });

  test('skip link moves focus to the main content', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#ax-main')).toBeFocused();
  });
});
