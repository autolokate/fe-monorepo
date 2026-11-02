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
