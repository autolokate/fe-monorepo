import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import { HERMETIC_RAS_ID, installHermeticRasRoutes } from './helpers/hermetic-content-v4';

test.describe('Roadside assistance (hermetic)', () => {
  test('list → status filter in URL → read-only detail drawer', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installHermeticRasRoutes(page);
    await seedHermeticSession(page);

    await page.goto('/roadside');
    await expect(page.getByRole('heading', { name: 'Roadside assistance' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('Hermetic Creta')).toBeVisible();
    await expect(page.getByText('Hermetic Nexon')).toBeVisible();

    await page.getByTestId('filter-chip-EN_ROUTE').click();
    await expect(page).toHaveURL(/status=EN_ROUTE/);
    await expect
      .poll(() => capture.listQueries.some((q) => q.get('status') === 'EN_ROUTE'))
      .toBe(true);
    await expect(page.getByText('Hermetic Nexon')).toHaveCount(0);

    await page.getByText('Hermetic Creta').click();
    const detail = page.getByTestId('roadside-detail');
    await expect(detail).toBeVisible();
    await expect.poll(() => capture.detail).toContain(HERMETIC_RAS_ID);
    const sheet = page.getByRole('dialog');
    await expect(sheet).toContainText('Hermetic Towing');
    await expect(sheet).toContainText('18 min');
    await expect(sheet).toContainText('Front left tyre flat near the signal.');
    await expect(sheet.getByRole('link', { name: '12.93456, 77.61234' })).toHaveAttribute(
      'href',
      /google\.com\/maps/,
    );
    // Read-only: no transition / write ever leaves the console.
    expect(capture.writes).toEqual([]);
    expect(base.unexpected).toEqual([]);
  });

  test('not deployed → honest state', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticRasRoutes(page, { listStatus: 404 });
    await seedHermeticSession(page);
    await page.goto('/roadside');
    await expect(page.getByTestId('admin-not-deployed')).toContainText(
      'GET /admin/v1/services/ras/requests',
      { timeout: 30_000 },
    );
  });
});
