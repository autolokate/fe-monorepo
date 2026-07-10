import { expect, test } from '@playwright/test';

import { loginAsAdmin } from './helpers/auth';
import { e2eSkuCode } from './helpers/env';
import { pauseIfWatching, showState } from './helpers/watch';

/**
 * Admin QR provisioning spine (M5c):
 * create DRAFT → generate CODES_GENERATED → provision PROVISIONED.
 *
 * Auth is injected (sessionStorage) so the suite does not depend on WhatsApp OTP
 * when bearer tokens are supplied via env.
 *
 * Watch each state: `pnpm test:e2e:watch` (headed + step delays + final pause).
 */
test.describe('QR batch provisioning', () => {
  test('create → generate → provision a small B2C batch', async ({ page }) => {
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

    // Detail sheet opens on the new batch (title = human batchCode).
    const detail = page.getByRole('dialog').filter({ hasText: 'Batch lifecycle' });
    await expect(detail).toBeVisible({ timeout: 20_000 });
    await expect(detail.getByRole('heading')).toHaveText(
      new RegExp(`^B2C-[A-Z0-9]+-${totalCount}-\\d{8}$`),
    );
    await expect(detail.locator('.al-status-badge', { hasText: 'DRAFT' })).toBeVisible();
    await showState(page, '4 · DRAFT batch created');

    await detail.getByRole('button', { name: 'Generate codes' }).click();
    const generateConfirm = page.getByRole('alertdialog', { name: 'Generate codes' });
    await expect(generateConfirm).toBeVisible();
    await showState(page, '5 · Generate codes confirm');
    await generateConfirm.getByRole('button', { name: 'Generate codes' }).click();

    await expect(detail.locator('.al-status-badge', { hasText: 'CODES_GENERATED' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(detail.getByText('Codes in batch')).toBeVisible();
    await expect(detail.getByText(/^ALK-/).first()).toBeVisible({ timeout: 15_000 });
    await showState(page, '6 · CODES_GENERATED (+ codes list)');

    await detail.getByRole('button', { name: 'Provision batch' }).click();
    const provisionConfirm = page.getByRole('alertdialog', { name: 'Provision batch' });
    await expect(provisionConfirm).toBeVisible();
    await showState(page, '7 · Provision batch confirm');
    await provisionConfirm.getByRole('button', { name: 'Provision batch' }).click();

    await expect(detail.locator('.al-status-badge', { hasText: 'PROVISIONED' })).toBeVisible({
      timeout: 30_000,
    });
    await showState(page, '8 · PROVISIONED (detail sheet)');

    await detail.getByRole('button', { name: 'Close panel' }).click();
    await expect(page.getByRole('cell', { name: 'PROVISIONED' }).first()).toBeVisible();
    await showState(page, '9 · list shows PROVISIONED');

    // Stays open until you click Resume in the Playwright Inspector.
    await pauseIfWatching(page);
  });
});
