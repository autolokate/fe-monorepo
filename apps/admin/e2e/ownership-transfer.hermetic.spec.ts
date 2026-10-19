import { expect, test } from '@playwright/test';

import {
  HERMETIC_QR_CODE,
  HERMETIC_TO_ACCOUNT_ID,
  HERMETIC_TRANSFER_ID,
  installHermeticApiRoutes,
  openOwnershipTransfersPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin ownership-transfer UI regression (Phase 0 Step 3B4 / Option A).
 *
 * Verifies route, permission-gated CTAs, initiate/approve request wiring, and
 * existing success/error surfaces with stubbed HTTP only.
 *
 * Does NOT verify BE authz, FSM, persistence, audit, or notifications.
 * Never uses E2E_ADMIN_*, live OTP, or real account/QR/transfer ids.
 */
test.describe('Ownership transfer (hermetic)', () => {
  test('initiate success — write CTAs, POST body, success panel + toast', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipTransfersPage(page);

    await expect(page.getByRole('button', { name: 'Initiate transfer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve transfer' })).toBeVisible();
    await expect(
      page.getByText('Transfer status appears here after you initiate or approve a transfer.'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Initiate transfer' }).click();
    const dialog = page.getByRole('dialog', { name: 'Initiate ownership transfer' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('QR code').fill(HERMETIC_QR_CODE);
    await dialog.getByRole('button', { name: 'Initiate transfer' }).click();

    await expect(page.getByRole('status')).toContainText('Transfer initiated.', {
      timeout: 10_000,
    });
    await expect(page.getByLabel('Transfer initiated')).toBeVisible();
    await expect(page.getByLabel('Transfer initiated')).toContainText('INITIATED');
    await expect(dialog).toBeHidden();

    expect(capture.initiate).toHaveLength(1);
    expect(capture.initiate[0]?.path).toBe('/admin/v1/ownership-transfers');
    expect(capture.initiate[0]?.method).toBe('POST');
    expect(capture.initiate[0]?.body).toEqual({ code: HERMETIC_QR_CODE });
    expect(capture.unexpected).toEqual([]);
  });

  test('approve success — path/body, success panel + toast', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openOwnershipTransfersPage(page);

    await page.getByRole('button', { name: 'Approve transfer' }).click();
    const dialog = page.getByRole('dialog', { name: 'Approve ownership transfer' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Transfer reference').fill(HERMETIC_TRANSFER_ID);
    await dialog.getByLabel('New owner account').fill(HERMETIC_TO_ACCOUNT_ID);
    await dialog.getByRole('button', { name: 'Approve transfer' }).click();

    await expect(page.getByRole('status')).toContainText('Transfer completed.', {
      timeout: 10_000,
    });
    await expect(page.getByLabel('Transfer completed')).toBeVisible();
    await expect(page.getByLabel('Transfer completed')).toContainText('COMPLETED');
    await expect(dialog).toBeHidden();

    expect(capture.approve).toHaveLength(1);
    expect(capture.approve[0]?.method).toBe('POST');
    expect(capture.approve[0]?.path).toBe(
      `/admin/v1/ownership-transfers/${HERMETIC_TRANSFER_ID}/approve`,
    );
    expect(capture.approve[0]?.body).toEqual({ toAccountId: HERMETIC_TO_ACCOUNT_ID });
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY session hides write CTAs (inventory:view only)', async ({
    page,
  }) => {
    // READ_ONLY has inventory:view (page gate) but not qr-lifecycle:write (CTA gate).
    // See apps/admin/src/platform/rbac/permissions.ts ROLE_PERMISSIONS.
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await openOwnershipTransfersPage(page);

    await expect(page.getByRole('heading', { name: 'Ownership' })).toBeVisible();
    await expect(
      page.getByText('Transfer status appears here after you initiate or approve a transfer.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Initiate transfer' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Approve transfer' })).toHaveCount(0);
    await expect(page.getByText('Access denied')).toHaveCount(0);
    expect(capture.initiate).toEqual([]);
    expect(capture.approve).toEqual([]);
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 surfaces form error + toast', async ({ page }) => {
    // normalizeApiError maps 403 → code `unknown` → userMessage
    // "Something went wrong. Try again." (admin-api-errors.ts USER_MESSAGES).
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      initiateStatus: 403,
    });
    await seedHermeticSession(page);
    await openOwnershipTransfersPage(page);

    await page.getByRole('button', { name: 'Initiate transfer' }).click();
    const dialog = page.getByRole('dialog', { name: 'Initiate ownership transfer' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('QR code').fill(HERMETIC_QR_CODE);
    await dialog.getByRole('button', { name: 'Initiate transfer' }).click();

    // mapAdminApiError(403) → unknown → USER_MESSAGES.unknown
    const expectedMessage = 'Something went wrong. Try again.';
    // Durable in-sheet surface (OwnershipTransferSheets submitError).
    await expect(dialog.locator('.admin-form-error')).toHaveText(expectedMessage, {
      timeout: 10_000,
    });
    // ToastHost also emits the same message; while the modal is open Radix sets
    // aria-hidden on outside content, so assert via DOM class (not getByRole('alert')).
    await expect(page.locator('.admin-toast.admin-toast--error')).toContainText(expectedMessage);
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel('Transfer initiated')).toHaveCount(0);

    expect(capture.initiate).toHaveLength(1);
    expect(capture.initiate[0]?.body).toEqual({ code: HERMETIC_QR_CODE });
    expect(capture.unexpected).toEqual([]);
  });
});
