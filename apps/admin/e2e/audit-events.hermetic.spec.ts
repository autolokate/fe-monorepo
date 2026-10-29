import { expect, test } from '@playwright/test';

import {
  HERMETIC_AUDIT_BATCH_ID,
  installHermeticApiRoutes,
  openAuditEventsPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin Activity Log (audit explorer) wiring — `GET /admin/v1/audit-events`.
 * Does NOT prove Live OPERATOR / step_up / real audit retention.
 */
test.describe('Audit explorer (hermetic)', () => {
  test('list events → open detail sheet', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openAuditEventsPage(page);

    expect(capture.auditEventsGet).toBeGreaterThanOrEqual(1);
    await expect(page.getByText('Batch Provisioned', { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('batch', { exact: true }).first()).toBeVisible();

    await page.getByRole('row').filter({ hasText: 'Batch Provisioned' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog).toContainText('Batch Provisioned');
    await expect(dialog).toContainText('batch');
    expect(capture.unexpected).toEqual([]);
  });

  test('filter by action + target type — query wiring', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openAuditEventsPage(page);

    await page.getByTestId('audit-filter-action').click();
    await page.getByRole('option', { name: 'Batch provisioned' }).click();
    await page.getByTestId('audit-filter-target-type').fill('batch');
    await page.getByTestId('audit-filter-apply').click();

    await expect(page.getByText('Batch Provisioned', { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    // Refund row filtered out.
    await expect(page.getByText('Refund Or Clawback', { exact: true })).toHaveCount(0);

    const filtered = capture.auditEventsGetQueries.filter(
      (query) => query.includes('action=BATCH_PROVISIONED') && query.includes('targetType=batch'),
    );
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('filter by entity reference — targetId query', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openAuditEventsPage(page);

    await page.getByRole('button', { name: 'More' }).click();
    await page.getByPlaceholder('Filter by entity').fill(HERMETIC_AUDIT_BATCH_ID);
    await page.getByTestId('audit-filter-apply').click();

    await expect
      .poll(() =>
        capture.auditEventsGetQueries.some((query) =>
          query.includes(`targetId=${encodeURIComponent(HERMETIC_AUDIT_BATCH_ID)}`),
        ),
      )
      .toBe(true);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces AlErrorState', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      auditEventsGetStatus: 403,
    });
    await seedHermeticSession(page);
    await page.goto('/audit-events', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Something went wrong. Try again.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
