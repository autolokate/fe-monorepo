import { expect, test } from '@playwright/test';

import { loginAsAdmin } from './helpers/auth';
import { e2eSkuCode } from './helpers/env';
import { pauseIfWatching, showState } from './helpers/watch';

/**
 * Admin QR provisioning spine (M5c):
 * create DRAFT → generate CODES_GENERATED → provision PROVISIONED → distribute IN_DISTRIBUTION.
 *
 * Auth is injected (sessionStorage) so the suite does not depend on WhatsApp OTP
 * when bearer tokens are supplied via env.
 *
 * Watch each state: `pnpm test:e2e:watch` (headed + step delays + final pause).
 */
test.describe('QR batch provisioning', () => {
  test('create → generate → provision → distribute a small B2C batch', async ({ page }) => {
    const skuCode = e2eSkuCode();
    const totalCount = Number(process.env.E2E_BATCH_TOTAL_COUNT ?? '5');

    await loginAsAdmin(page);
    await showState(page, '1 · logged in — QR Batch Management');

    await page.getByRole('button', { name: 'Create batch' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create batch' });
    await expect(dialog).toBeVisible();
    await showState(page, '2 · Create batch sheet open');

    await dialog.getByLabel('Channel').selectOption('B2C');
    await expect(dialog.getByLabel('SKU')).toBeEnabled({ timeout: 15_000 });
    await dialog.getByLabel('SKU').selectOption({ label: skuCode });
    await dialog.getByLabel('Total count').fill(String(totalCount));
    await showState(page, '3 · form filled (B2C + SKU + count)');
    await dialog.getByRole('button', { name: 'Create batch' }).click();

    // Detail page opens on the new batch (title = human batchCode).
    await expect(page).toHaveURL(/\/qr-batches\/[^/]+$/, { timeout: 20_000 });
    const detail = page.locator('main');
    await expect(detail.getByRole('heading', { level: 2 })).toHaveText(
      new RegExp(`^B2C-[A-Z0-9]+-${String(totalCount)}-\\d{8}(?:-\\d+)?$`),
    );
    // The BATCH badge is the Overview section's direct child; each row in "Codes in batch" carries
    // its own per-code badge (inside a `td`), so an unscoped `.al-status-badge` is ambiguous.
    const batchStatus = detail.locator('.qr-batch-detail-hero__status .al-status-badge, .admin-detail-section__body > .al-status-badge');
    await expect(batchStatus.first()).toHaveText('DRAFT');
    await showState(page, '4 · DRAFT batch created');

    await detail.getByRole('button', { name: 'Generate codes' }).click();
    const generateConfirm = page.getByRole('alertdialog', { name: 'Generate codes' });
    await expect(generateConfirm).toBeVisible();
    await showState(page, '5 · Generate codes confirm');
    await generateConfirm.getByRole('button', { name: 'Generate codes' }).click();

    await expect(batchStatus.first()).toHaveText('CODES_GENERATED', { timeout: 30_000 });
    await expect(detail.getByText('Codes in batch')).toBeVisible();
    await expect(detail.getByText(/^ALK-/).first()).toBeVisible({ timeout: 15_000 });
    await showState(page, '6 · CODES_GENERATED (+ codes list)');

    await detail.getByRole('button', { name: 'Provision batch' }).click();
    const provisionConfirm = page.getByRole('alertdialog', { name: 'Provision batch' });
    await expect(provisionConfirm).toBeVisible();
    await showState(page, '7 · Provision batch confirm');
    await provisionConfirm.getByRole('button', { name: 'Provision batch' }).click();

    await expect(batchStatus.first()).toHaveText('PROVISIONED', { timeout: 30_000 });
    await showState(page, '8 · PROVISIONED (detail page)');

    await detail.getByRole('button', { name: 'Distribute batch' }).click();
    const distributeConfirm = page.getByRole('alertdialog', { name: 'Distribute batch' });
    await expect(distributeConfirm).toBeVisible();
    await showState(page, '9 · Distribute batch confirm');
    await distributeConfirm.getByRole('button', { name: 'Distribute batch' }).click();

    await expect(batchStatus.first()).toHaveText('IN_DISTRIBUTION', { timeout: 30_000 });
    await showState(page, '10 · IN_DISTRIBUTION (detail page)');

    await detail.getByRole('button', { name: 'QR Batch Management' }).click();
    await expect(page.getByRole('cell', { name: 'IN_DISTRIBUTION' }).first()).toBeVisible();
    await showState(page, '11 · list shows IN_DISTRIBUTION');

    // Stays open until you click Resume in the Playwright Inspector.
    await pauseIfWatching(page);
  });
});
