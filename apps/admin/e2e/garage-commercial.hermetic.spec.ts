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

    await expect(page.getByTestId('garage-free-bids-per-week')).toHaveValue('2');
    await expect(page.getByTestId('garage-day-pass-price')).toHaveValue('100');
    // Flow v3: the lifetime grant is history only — no editable lifetime input.
    await expect(page.getByTestId('garage-free-bid-lifetime-count')).toHaveCount(0);
    await expect(page.getByTestId('garage-free-bids-next-reset')).toContainText('IST');
    await expect(page.getByTestId('garage-kpi-free-bids-per-week')).toContainText('2');
    // Calendar month → no day-count input.
    await expect(page.getByTestId('garage-month-pass-duration-kind')).toHaveValue(
      'CALENDAR_MONTH_IST',
    );
    await expect(page.getByTestId('garage-month-pass-duration-days')).toHaveCount(0);
    expect(capture.garageConfigGet).toBeGreaterThanOrEqual(1);

    await page.getByTestId('garage-day-pass-price').fill('150');
    await page.getByTestId('garage-free-bids-per-week').fill('5');
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
      freeBidsPerWeek: 5,
      monthPassDurationKind: 'CALENDAR_MONTH_IST',
      monthPassDurationDays: 30,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('flow v3 — rolling-days month pass + validation blocks bad values', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'ADMIN' });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await expect(page.getByTestId('garage-free-bids-per-week')).toHaveValue('2', {
      timeout: 10_000,
    });
    await page.getByTestId('garage-month-pass-duration-kind').selectOption('ROLLING_DAYS');
    const days = page.getByTestId('garage-month-pass-duration-days');
    await expect(days).toBeVisible();
    await expect(days).toHaveValue('30');

    await days.fill('0');
    await page.getByTestId('garage-free-bids-per-week').fill('101');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByTestId('garage-month-pass-duration-days-error')).toContainText(
      '1 to 366',
    );
    await expect(page.getByTestId('garage-free-bids-per-week-error')).toContainText('0 to 100');
    expect(capture.garageConfigPut).toHaveLength(0);

    await days.fill('45');
    await expect(page.getByTestId('garage-month-pass-duration-days-error')).toHaveCount(0);
    await page.getByTestId('garage-free-bids-per-week').fill('0');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('status')).toContainText('Commercial configuration saved.', {
      timeout: 10_000,
    });
    expect(capture.garageConfigPut).toHaveLength(1);
    expect(capture.garageConfigPut[0]?.body).toMatchObject({
      freeBidsPerWeek: 0,
      monthPassDurationKind: 'ROLLING_DAYS',
      monthPassDurationDays: 45,
    });
    await expect(page.getByTestId('garage-kpi-month-pass')).toContainText('45 days from purchase');
    await expect(page.getByTestId('garage-config-history')).toContainText('0/week', {
      timeout: 10_000,
    });
    expect(capture.unexpected).toEqual([]);
  });

  test('pre-v3 API — legacy lifetime control, no weekly fields sent', async ({ page }) => {
    const capture = await installHermeticApiRoutes(page, {
      sessionRole: 'ADMIN',
      garageConfigLegacy: true,
    });
    await seedHermeticSession(page);
    await openGarageCommercialPage(page);

    await expect(page.getByTestId('garage-free-bid-lifetime-count')).toHaveValue('2', {
      timeout: 10_000,
    });
    await expect(page.getByTestId('garage-free-bids-per-week')).toHaveCount(0);
    await expect(page.getByTestId('garage-weekly-free-bids-unavailable')).toBeVisible();
    await expect(page.getByTestId('garage-month-pass-duration-kind')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Adjust free bids' })).toBeVisible();

    await page.getByTestId('garage-day-pass-price').fill('120');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('status')).toContainText('Commercial configuration saved.', {
      timeout: 10_000,
    });
    const body = capture.garageConfigPut[0]?.body as Record<string, unknown>;
    expect(body).toMatchObject({
      dayPassPriceRupees: 120,
      freeBidLifetimeCount: 2,
      monthPassDurationKind: 'CALENDAR_MONTH_IST',
    });
    expect(body).not.toHaveProperty('freeBidsPerWeek');
    expect(body).not.toHaveProperty('monthPassDurationDays');
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

    await page.getByRole('button', { name: 'Weekly free-bid bonus' }).click();
    const dialog = page.getByRole('dialog', { name: 'Weekly free-bid bonus' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('this IST week only');
    // Flow v3 servers ignore raiseLifetime — the legacy checkbox is gone.
    await expect(dialog.getByTestId('garage-adjust-raise-lifetime')).toHaveCount(0);

    await dialog.getByLabel('Organization').fill(HERMETIC_GARAGE_ORG_ID);
    await dialog.getByLabel('Bonus / penalty for this IST week').fill('1');
    await dialog.getByRole('button', { name: 'Apply to this week' }).click();

    await expect(page.getByRole('status')).toContainText('Free bids adjusted.', {
      timeout: 10_000,
    });
    const balance = page.getByLabel('Free bids balance');
    await expect(balance).toBeVisible();
    // Stub week: allowance 2 + bonus 1, 1 used → 2 remaining.
    await expect(balance).toContainText('Remaining this week');
    await expect(balance).toContainText('Used this week');
    await expect(balance).toContainText('Week allowance incl. bonus');
    await expect(balance).toContainText('IST');

    expect(capture.garageFreeBidsAdjust).toHaveLength(1);
    expect(capture.garageFreeBidsAdjust[0]?.path).toBe(
      `/admin/v1/garage/orgs/${encodeURIComponent(HERMETIC_GARAGE_ORG_ID)}/free-bids/adjust`,
    );
    expect(capture.garageFreeBidsAdjust[0]?.body).toEqual({ delta: 1 });
    expect(capture.unexpected).toEqual([]);
  });

  test('permission — READ_ONLY (not OPERATOR) gets the access-denied gate, no admin calls', async ({
    page,
  }) => {
    // ADM-03: the server has a single admin role (OPERATOR); any other session never sees the shell.
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'READ_ONLY' });
    await seedHermeticSession(page);
    await page.goto('/garage-commercial');
    await expect(page.getByTestId('admin-access-denied')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toHaveCount(0);
    expect(capture.unexpected).toEqual([]);
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

    const expectedMessage = 'The server refused this action for your operator session.';
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
      'The server refused this action for your operator session.',
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
      page.getByText('Weekly free bids, pass pricing, and partner provisioning for Garage.'),
    ).toBeVisible();
    await expect(page.getByTestId('garage-contract-gap-note')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Provision partner' })).toBeVisible();
  });
});
