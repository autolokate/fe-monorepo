import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import { installUsersV4Routes, V4_FLAG_CLEARED_ID, V4_FLAG_ID } from './helpers/hermetic-users-v4';

/** Plate scanning admin (ANPR §9) — lookups, abuse flags, collisions, unparsed + backfill, dupes. */
test.describe('Plate scanning (hermetic)', () => {
  test('lookups show HMAC only and filter by result / window', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);

    await page.goto('/plate-scanning');
    const lookups = page.getByTestId('plate-lookups');
    await expect(lookups).toContainText('f00dfeedca…', { timeout: 30_000 });
    await expect(lookups).toContainText('Hot plate');
    await expect(lookups).toContainText('Verified');
    expect(capture.lookups[0]).toContain('hours=24');

    await page.getByTestId('filter-chip-NO_MATCH').click();
    await page.getByTestId('filter-chip-168').click();
    await expect(page).toHaveURL(/result=NO_MATCH/);
    await expect
      .poll(() =>
        capture.lookups.some((q) => q.includes('result=NO_MATCH') && q.includes('hours=168')),
      )
      .toBe(true);
  });

  test('abuse flag clear posts no body and only active flags offer it', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);

    await page.goto('/plate-scanning?tab=abuse');
    await expect(page.getByTestId('plate-abuse-scanners')).toContainText('37', { timeout: 30_000 });
    await expect(page.getByTestId(`plate-flag-clear-${V4_FLAG_CLEARED_ID}`)).toHaveCount(0);

    await page.getByTestId(`plate-flag-clear-${V4_FLAG_ID}`).click();
    await expect(page.getByTestId('plate-flag-clear-note')).toContainText(
      'does not accept a reason',
    );
    await page.getByTestId('plate-flag-clear-confirm').click();
    await expect.poll(() => capture.flagClear.length).toBe(1);
    expect(capture.flagClear[0]?.path).toBe(`/admin/v1/scan/flags/${V4_FLAG_ID}/clear`);
    expect(capture.flagClear[0]?.body ?? null).toBeNull();
    await expect(page.getByTestId(`plate-flag-clear-${V4_FLAG_ID}`)).toHaveCount(0, {
      timeout: 10_000,
    });
  });

  test('collisions, unparsed backfill and duplicate plans', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const capture = await installUsersV4Routes(page);
    await seedHermeticSession(page);

    await page.goto('/plate-scanning?tab=collisions');
    await expect(page.getByTestId('plate-collisions')).toContainText('MH 12 QW 9087', {
      timeout: 30_000,
    });
    await expect(page.getByTestId('plate-collisions')).toContainText('Unverified');

    await page.getByRole('tab', { name: 'Unparsed plates' }).click();
    await expect(page.getByTestId('plate-unparsed')).toContainText('TEMP-REG 12');
    await page.getByTestId('plate-backfill-run').click();
    await page.getByTestId('plate-backfill-confirm').click();
    await expect(page.getByTestId('plate-backfill-result')).toContainText('998');
    await expect(page.getByTestId('plate-backfill-result')).toContainText('backfill complete');
    expect(capture.backfill).toBe(1);
    await expect(page.getByTestId('plate-unparsed')).toContainText('No unparsed plates');

    await page.getByRole('tab', { name: 'Duplicate plans' }).click();
    await expect(page.getByTestId('plate-duplicates-index')).toContainText('Unique index missing');
    await expect(page.getByTestId('plate-duplicates')).toContainText('abababab');
  });
});
