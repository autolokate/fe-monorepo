import { expect, test } from '@playwright/test';

import {
  HERMETIC_GARAGE_ACCOUNT_ID,
  HERMETIC_GARAGE_AUDIT_ID,
  HERMETIC_GARAGE_IDEMPOTENCY_KEY,
  HERMETIC_GARAGE_ORG_ID,
  HERMETIC_GARAGE_PURCHASE_ID,
  HERMETIC_GARAGE_STAFF_ID,
  installHermeticApiRoutes,
  openGarageCommercialPage,
  seedHermeticSession,
} from './helpers/hermetic';

/**
 * Hermetic Admin Garage commercial + entitlement ops (Batch C).
 *
 * Stubbed HTTP only — never live Admin OTP, Razorpay, SMS, or real org grants.
 * Does NOT verify BE authz / webhook / Partner checkout.
 */
test.describe('Garage commercial (hermetic)', () => {
  test('load + save commercial-config — GET/PUT wiring + success note', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await expect(page.getByTestId('garage-free-bid-lifetime-count')).toHaveValue('2');
    await expect(page.getByTestId('garage-day-pass-price')).toHaveValue('100');
    expect(capture.garageConfigGet).toBeGreaterThanOrEqual(1);

    await page.getByTestId('garage-day-pass-price').fill('150');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('status')).toContainText('Commercial configuration saved.', {
      timeout: 10_000,
    });
    expect(capture.garageConfigPut).toHaveLength(1);
    expect(capture.garageConfigPut[0]?.path).toBe('/admin/v1/garage/commercial-config');
    expect(capture.garageConfigPut[0]?.method).toBe('PUT');
    expect(capture.garageConfigPut[0]?.body).toMatchObject({
      dayPassPriceRupees: 150,
      freeBidLifetimeCount: 2,
      monthPassDurationKind: 'CALENDAR_MONTH_IST',
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('config history — GET path + limit + seeded audit row', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await expect(page.getByTestId('garage-config-history')).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByTestId(`garage-config-history-row-${HERMETIC_GARAGE_AUDIT_ID}`),
    ).toContainText('Day ₹100');
    await expect(
      page.getByTestId(`garage-config-history-row-${HERMETIC_GARAGE_AUDIT_ID}`),
    ).toContainText('Free bids 2');

    expect(capture.garageConfigHistoryGet.length).toBeGreaterThanOrEqual(1);
    expect(capture.garageConfigHistoryGet[0]?.method).toBe('GET');
    expect(capture.garageConfigHistoryGet[0]?.path).toBe(
      '/admin/v1/garage/commercial-config/history',
    );
    expect(capture.garageConfigHistoryGet[0]?.limit).toBe('50');
    expect(capture.unexpected).toEqual([]);
  });

  test('config history refresh after save — newest audit shows updated price', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await expect(page.getByTestId('garage-config-history')).toBeVisible({ timeout: 10_000 });
    const historyGetsBefore = capture.garageConfigHistoryGet.length;

    await page.getByTestId('garage-day-pass-price').fill('175');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('status')).toContainText('Commercial configuration saved.', {
      timeout: 10_000,
    });

    await expect
      .poll(() => capture.garageConfigHistoryGet.length, { timeout: 10_000 })
      .toBeGreaterThan(historyGetsBefore);
    await expect(page.getByTestId('garage-config-history')).toContainText('Day ₹175', {
      timeout: 10_000,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on config history surfaces inline alert', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      garageConfigHistoryGetStatus: 403,
    });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    // Config form still loads; history fails closed with honest API error.
    await expect(page.getByTestId('garage-day-pass-price')).toHaveValue('100', {
      timeout: 10_000,
    });
    await expect(page.getByTestId('garage-config-history-error')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('garage-config-history')).toHaveCount(0);
    expect(capture.garageConfigHistoryGet.length).toBeGreaterThanOrEqual(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('grant pass success — POST body + result panel', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await page.getByRole('button', { name: 'Grant pass' }).click();
    const dialog = page.getByRole('dialog', { name: 'Grant garage pass' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Organization').fill(HERMETIC_GARAGE_ORG_ID);
    await dialog.getByTestId('garage-grant-kind').selectOption('DAY');
    await dialog.getByLabel('Optional request key').fill(HERMETIC_GARAGE_IDEMPOTENCY_KEY);
    await dialog.getByRole('button', { name: 'Grant pass' }).click();

    await expect(page.getByRole('status')).toContainText('Garage pass granted.', {
      timeout: 10_000,
    });
    await expect(page.getByLabel('Pass granted')).toBeVisible();
    await expect(page.getByLabel('Pass granted')).toContainText(HERMETIC_GARAGE_PURCHASE_ID);
    await expect(dialog).toBeHidden();

    expect(capture.garagePassGrant).toHaveLength(1);
    expect(capture.garagePassGrant[0]?.method).toBe('POST');
    expect(capture.garagePassGrant[0]?.path).toBe(
      `/admin/v1/garage/orgs/${encodeURIComponent(HERMETIC_GARAGE_ORG_ID)}/passes/grant`,
    );
    expect(capture.garagePassGrant[0]?.body).toEqual({
      kind: 'DAY',
      idempotencyKey: HERMETIC_GARAGE_IDEMPOTENCY_KEY,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('adjust free bids success — POST body + balance panel', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await page.getByRole('button', { name: 'Adjust free bids' }).click();
    const dialog = page.getByRole('dialog', { name: 'Adjust free bids' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Organization').fill(HERMETIC_GARAGE_ORG_ID);
    await dialog.getByTestId('garage-adjust-delta').fill('1');
    await dialog.getByTestId('garage-adjust-raise-lifetime').check();
    await dialog.getByRole('button', { name: 'Adjust free bids' }).click();

    await expect(page.getByRole('status')).toContainText('Free bids adjusted.', {
      timeout: 10_000,
    });
    await expect(page.getByLabel('Free bids balance')).toBeVisible();
    await expect(page.getByLabel('Free bids balance')).toContainText('Remaining');

    expect(capture.garageFreeBidsAdjust).toHaveLength(1);
    expect(capture.garageFreeBidsAdjust[0]?.path).toBe(
      `/admin/v1/garage/orgs/${encodeURIComponent(HERMETIC_GARAGE_ORG_ID)}/free-bids/adjust`,
    );
    expect(capture.garageFreeBidsAdjust[0]?.body).toEqual({
      delta: 1,
      raiseLifetime: true,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY hides write CTAs', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await page.goto('/garage-commercial', { waitUntil: 'domcontentloaded' });

    // settings:read is SUPER_ADMIN-only; READ_ONLY sees Access denied.
    await expect(page.getByText('Access denied')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Grant pass' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Provision partner' })).toHaveCount(0);
    expect(capture.garageConfigPut).toEqual([]);
    expect(capture.garagePassGrant).toEqual([]);
    expect(capture.garageProvision).toEqual([]);
  });

  test('error — stubbed 403 on grant surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      garagePassGrantStatus: 403,
    });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await page.getByRole('button', { name: 'Grant pass' }).click();
    const dialog = page.getByRole('dialog', { name: 'Grant garage pass' });
    await dialog.getByLabel('Organization').fill(HERMETIC_GARAGE_ORG_ID);
    await dialog.getByRole('button', { name: 'Grant pass' }).click();

    const expectedMessage = 'Something went wrong. Try again.';
    await expect(dialog.locator('.admin-form-error')).toHaveText(expectedMessage, {
      timeout: 10_000,
    });
    await expect(page.getByLabel('Pass granted')).toHaveCount(0);
    expect(capture.garagePassGrant).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('provision partner success — POST body + result panel', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await page.getByRole('button', { name: 'Provision partner' }).click();
    const dialog = page.getByRole('dialog', { name: 'Provision garage partner' });
    await expect(dialog).toBeVisible();

    await dialog.getByTestId('garage-provision-account-id').fill(HERMETIC_GARAGE_ACCOUNT_ID);
    await dialog.getByTestId('garage-provision-org-name').fill('Hermetic Garage Co');
    await dialog.getByTestId('garage-provision-owner-name').fill('Hermetic Owner');
    await dialog.getByRole('button', { name: 'Provision' }).click();

    await expect(page.getByRole('status')).toContainText('Garage partner provisioned.', {
      timeout: 10_000,
    });
    await expect(page.getByLabel('Garage provisioned')).toBeVisible();
    await expect(page.getByLabel('Garage provisioned')).toContainText(HERMETIC_GARAGE_ORG_ID);
    await expect(page.getByLabel('Garage provisioned')).toContainText(HERMETIC_GARAGE_STAFF_ID);
    await expect(dialog).toBeHidden();

    expect(capture.garageProvision).toHaveLength(1);
    expect(capture.garageProvision[0]?.method).toBe('POST');
    expect(capture.garageProvision[0]?.path).toBe('/admin/v1/garage/provision');
    expect(capture.garageProvision[0]?.body).toEqual({
      accountId: HERMETIC_GARAGE_ACCOUNT_ID,
      orgName: 'Hermetic Garage Co',
      ownerName: 'Hermetic Owner',
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('error — stubbed 403 on provision surfaces form error', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      garageProvisionStatus: 403,
    });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await page.getByRole('button', { name: 'Provision partner' }).click();
    const dialog = page.getByRole('dialog', { name: 'Provision garage partner' });
    await dialog.getByTestId('garage-provision-account-id').fill(HERMETIC_GARAGE_ACCOUNT_ID);
    await dialog.getByTestId('garage-provision-org-name').fill('Hermetic Garage Co');
    await dialog.getByTestId('garage-provision-owner-name').fill('Hermetic Owner');
    await dialog.getByRole('button', { name: 'Provision' }).click();

    await expect(dialog.locator('.admin-form-error')).toHaveText(
      'Something went wrong. Try again.',
      { timeout: 10_000 },
    );
    await expect(page.getByLabel('Garage provisioned')).toHaveCount(0);
    expect(capture.garageProvision).toHaveLength(1);
    expect(capture.unexpected).toEqual([]);
  });

  test('shows product commercial copy and provision action', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await expect(
      page.getByText('Pass pricing, free bids, and partner provisioning for Garage.'),
    ).toBeVisible();
    await expect(page.getByTestId('garage-contract-gap-note')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Provision partner' })).toBeVisible();
  });
});
