import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';

/**
 * `GET /admin/v1/audit-events` writes an AUDIT_EXPORTED row on every call. Signing in and viewing the
 * dashboard must not read it, or the Activity log fills with the operator's own page loads.
 */
test('dashboard loads without reading (and so self-auditing) the audit log', async ({ page }) => {
  const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  await seedHermeticSession(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText('QR stickers')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Activity log/ })).toBeVisible();
  expect(capture.auditEventsGet).toBe(0);

  // The header bell reads the latest page only when the operator opens it.
  await page.getByRole('button', { name: 'Recent activity' }).click();
  await expect(page.getByRole('dialog', { name: 'Recent activity' })).toBeVisible();
  await expect.poll(() => capture.auditEventsGet).toBe(1);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /^Activity log/ }).click();
  await expect.poll(() => capture.auditEventsGet).toBeGreaterThan(1);
  expect(capture.unexpected).toEqual([]);
});

test('needs-attention queue shows real counts, revenue sums and deep-links into a filtered list', async ({
  page,
}) => {
  const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
  await seedHermeticSession(page);
  await page.goto('/dashboard');

  const disputes = page.getByTestId('dashboard-attention-taxi-disputes');
  await expect(disputes).toContainText('Taxi disputes', { timeout: 30_000 });
  await expect(disputes).toContainText('1');
  await expect(page.getByTestId('dashboard-attention-gst-reviews')).toContainText('0');
  // Sum of the three stubbed ledger rows (₹90 + ₹25 + ₹126), straight from server paise.
  await expect(page.getByTestId('dashboard-taxi-revenue')).toContainText('₹241');
  await expect(page.getByTestId('dashboard-taxi-revenue')).toContainText('₹126');

  await disputes.click();
  await expect(page).toHaveURL(/\/taxi\/bookings\?status=DISPUTED$/);
  await expect(page.getByTestId('filter-chip-DISPUTED')).toHaveAttribute('aria-pressed', 'true');
  // The filter survives a reload (it lives in the URL).
  await page.reload();
  await expect(page.getByTestId('filter-chip-DISPUTED')).toHaveAttribute('aria-pressed', 'true', {
    timeout: 30_000,
  });
  expect(capture.auditEventsGet).toBe(0);
  expect(capture.unexpected).toEqual([]);
});
