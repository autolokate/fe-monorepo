import { expect, test } from '@playwright/test';

import {
  HERMETIC_SKU_ID,
  installHermeticApiRoutes,
  openQrBatchesPage,
  seedHermeticSession,
} from './helpers/hermetic';

/** 101 batches → one full page of 100 plus one on the next page (Nest `GET /admin/v1/inventory`). */
function olderBatches(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const n = String(index + 1).padStart(3, '0');
    return {
      id: `aaaaaaaa-0000-4000-8000-000000000${n}`,
      batchCode: `B2C-PAGE-${n}`,
      channel: 'B2C',
      skuId: HERMETIC_SKU_ID,
      status: 'DRAFT',
      totalCount: 10,
      generatedCount: 0,
      provisionedCount: 0,
      createdAt: `2026-09-${String(30 - Math.floor(index / 4)).padStart(2, '0')}T00:00:00.000Z`,
      provisionedAt: null,
    };
  });
}

const OLDEST_ID = 'aaaaaaaa-0000-4000-8000-000000000101';

test.describe('QR batches paging + single-batch read (hermetic)', () => {
  test('list follows nextCursor with Load more; counts read N+ only while hasMore', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      extraQrBatches: olderBatches(101),
    });
    await seedHermeticSession(page);
    await openQrBatchesPage(page);

    const kpis = page.getByRole('group', { name: 'Summary' });
    await expect(kpis).toContainText('100+', { timeout: 15_000 });
    await expect(kpis).toContainText('Batches (loaded)');

    await page.getByTestId('qr-batches-load-more').click();
    await expect(kpis).toContainText('101', { timeout: 15_000 });
    await expect(kpis).not.toContainText('100+');
    await expect(page.getByTestId('qr-batches-load-more')).toHaveCount(0);

    expect(capture.inventoryQueries.some((query) => query.includes('limit=100'))).toBe(true);
    expect(capture.inventoryQueries.at(-1)).toContain('cursor=inv%3A100');
    expect(capture.unexpected).toEqual([]);
  });

  test('a batch past the first page opens from GET /admin/v1/qr-batches/{id}', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      extraQrBatches: olderBatches(101),
    });
    await seedHermeticSession(page);
    await page.goto(`/qr-batches/${OLDEST_ID}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'B2C-PAGE-101' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('region', { name: 'Overview' })).toContainText('Draft');
    expect(capture.qrBatchGet).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('an unknown batch id shows Batch not found', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await page.goto('/qr-batches/aaaaaaaa-0000-4000-8000-00000000ffff', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText('Batch not found')).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByText('This batch may have been removed or the link is invalid.'),
    ).toBeVisible();
  });

  test('dashboard reads 100+ batches only when the server reports more pages', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      extraQrBatches: olderBatches(101),
    });
    await seedHermeticSession(page);
    await page.goto('/dashboard');
    const card = page.getByTestId('dashboard-card-qr');
    await expect(card).toContainText('Newest 100 batches', { timeout: 30_000 });
    await expect(card).toContainText('100+');
  });

  test('dashboard shows an exact count for a full final page', async ({ page }) => {
    await installHermeticApiRoutes(page, {
      sessionRole: 'OPERATOR',
      extraQrBatches: olderBatches(100),
    });
    await seedHermeticSession(page);
    await page.goto('/dashboard');
    const card = page.getByTestId('dashboard-card-qr');
    await expect(card).toContainText('Stock and batch lifecycle', { timeout: 30_000 });
    await expect(card).toContainText('100');
    await expect(card).not.toContainText('100+');
  });
});
