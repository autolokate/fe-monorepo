import { expect, test } from '@playwright/test';

import { installHermeticApiRoutes, seedHermeticSession } from './helpers/hermetic';
import {
  installHermeticSosRoutes,
  SOS_CALLING_ID,
  SOS_SAFE_ID,
  SOS_URGENT_ID,
} from './helpers/hermetic-sos';

test.describe('SOS console (hermetic)', () => {
  test('live list: urgent first, filters, polling picks up a new incident', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const sos = await installHermeticSosRoutes(page);
    await seedHermeticSession(page);

    await page.goto('/sos');
    await expect(page.getByRole('heading', { name: 'SOS console' })).toBeVisible({
      timeout: 30_000,
    });

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('Hermetic Urgent Rider');
    await expect(rows.nth(0)).toContainText('Auto-activated');
    await expect(rows.nth(0).getByTestId('sos-urgent')).toBeVisible();
    await expect(rows.nth(1)).toContainText('Safe — awaiting admin');
    await expect(rows.nth(2)).toContainText('Calling user (1/2)');
    await expect(rows.nth(0).getByRole('link', { name: '+910000000101' })).toHaveAttribute(
      'href',
      'tel:+910000000101',
    );

    await page.getByTestId('filter-chip-CRASH').click();
    await expect(page).toHaveURL(/trigger=CRASH/);
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Hermetic Crash Driver');
    await page.getByTestId('filter-chip-ANY').click();

    await page.getByTestId('sos-search').fill('safe rider');
    await expect(rows).toHaveCount(1);
    await page.getByTestId('sos-search').fill('');

    // A new emergency arrives → the next poll (incremental, updatedSince) surfaces it with a cue.
    sos.addNewIncident();
    await expect(page.getByTestId('sos-new-banner')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('sos-new-flag')).toHaveCount(1);
    await expect(page.getByText('Hermetic Newest Rider')).toBeVisible();
    expect(sos.listQueries.some((q) => q.has('updatedSince'))).toBe(true);

    await page.getByRole('button', { name: 'Acknowledge' }).click();
    await expect(page.getByTestId('sos-new-banner')).toHaveCount(0);
    expect(base.unexpected).toEqual([]);
  });

  test('detail: user, live location, contacts; safe user → admin actions', async ({ page }) => {
    const base = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const sos = await installHermeticSosRoutes(page);
    await seedHermeticSession(page);

    await page.goto(`/sos/${SOS_SAFE_ID}`);
    await expect(page.getByRole('heading', { name: 'SOS · Hermetic Safe Rider' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('sos-user-phone')).toHaveAttribute('href', 'tel:+910000000102');
    await expect(page.getByTestId('sos-latest-coords')).toHaveText('19.072100, 72.873200');
    await expect(page.getByTestId('sos-map-link')).toHaveAttribute('href', /google\.com\/maps/);
    await expect(page.getByTestId('sos-trail')).toBeVisible();
    await expect(page.getByTestId('sos-contacts')).toContainText('Hermetic Sister');
    await expect(page.getByTestId('sos-contacts')).toContainText('WhatsApp: sent');
    await expect(page.getByTestId('sos-contacts')).toContainText('Call: no answer');
    await expect(page.getByTestId('sos-calls')).toContainText('pressed 1 (safe)');
    await expect(page.getByTestId('sos-vehicles')).toContainText('MH01HE0001');

    // Safe-awaiting-admin: every action is open to the operator.
    await expect(page.getByTestId('sos-action-call-user')).toBeEnabled();

    await page.getByTestId('sos-action-notify-family').click();
    await expect(page.getByRole('dialog')).toContainText('Notify family now?');
    await page.getByTestId('sos-dialog-confirm').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect.poll(() => sos.actions.at(-1)?.path).toBe('actions/notify-family');

    await page.getByTestId('sos-action-note').click();
    await expect(page.getByTestId('sos-dialog-confirm')).toBeDisabled();
    await page.getByTestId('sos-note-text').fill('Spoke to the rider; all fine.');
    await page.getByTestId('sos-dialog-confirm').click();
    await expect(page.getByTestId('sos-timeline-note')).toContainText('Spoke to the rider');
    await expect
      .poll(() => sos.actions.at(-1))
      .toEqual({
        path: 'notes',
        body: { text: 'Spoke to the rider; all fine.' },
      });

    await page.getByTestId('sos-action-resolve').click();
    await page.getByTestId('sos-outcome-FALSE_ALARM').check();
    await page.getByTestId('sos-dialog-confirm').click();
    await expect
      .poll(() => sos.actions.at(-1))
      .toEqual({
        path: 'actions/resolve',
        body: { outcome: 'FALSE_ALARM' },
      });
    await expect(page.getByTestId('sos-hero')).toContainText('False alarm');
    await expect(page.getByTestId('sos-action-resolve')).toBeDisabled();
    await expect(page.getByTestId('sos-action-notify-family')).toBeDisabled();
    await expect(page.getByTestId('sos-action-note')).toBeEnabled();
    expect(base.unexpected).toEqual([]);
  });

  test('state gates: calling disables "call again"; activated shows ambulance released', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page);
    await seedHermeticSession(page);

    await page.goto(`/sos/${SOS_CALLING_ID}`);
    await expect(page.getByTestId('sos-hero')).toContainText('Calling user (1/2)', {
      timeout: 30_000,
    });
    await expect(page.getByTestId('sos-countdown')).toBeVisible();
    await expect(page.getByTestId('sos-action-call-user')).toBeDisabled();
    await expect(page.getByTestId('sos-action-request-ambulance')).toBeEnabled();

    await page.goto(`/sos/${SOS_URGENT_ID}`);
    await expect(page.getByTestId('sos-hero')).toContainText('No answer to both calls', {
      timeout: 30_000,
    });
    await expect(page.getByTestId('sos-action-request-ambulance')).toBeDisabled();
    await expect(page.getByTestId('sos-action-request-ambulance')).toHaveText(/Ambulance released/);
  });

  test('409 explains the new state of the incident', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page, {
      actionError: {
        status: 409,
        code: 'sos_action_not_allowed',
        message: 'not allowed',
        details: { action: 'CALL_USER', state: 'CALLING_USER_2' },
      },
    });
    await seedHermeticSession(page);
    await page.goto(`/sos/${SOS_SAFE_ID}`);
    await page.getByTestId('sos-action-call-user').click({ timeout: 30_000 });
    await page.getByTestId('sos-dialog-confirm').click();
    await expect(page.getByTestId('sos-action-error')).toContainText('Calling user (2/2)');
  });

  test('expired step-up on an action opens the verification gate', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page, {
      actionError: {
        status: 403,
        code: 'forbidden',
        message: 'Step-up (2FA) required for the admin plane.',
      },
    });
    await seedHermeticSession(page);
    await page.goto(`/sos/${SOS_SAFE_ID}`);
    await page.getByTestId('sos-action-notify-family').click({ timeout: 30_000 });
    await page.getByTestId('sos-dialog-confirm').click();
    await expect(page.getByTestId('admin-step-up')).toBeVisible();
  });

  test('dashboard tile counts open + urgent and links to the console', async ({ page }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await installHermeticSosRoutes(page);
    await seedHermeticSession(page);
    await page.goto('/dashboard');
    const tile = page.getByTestId('dashboard-sos-tile');
    await expect(page.getByTestId('dashboard-sos-open')).toHaveText('3', { timeout: 30_000 });
    await expect(page.getByTestId('dashboard-sos-urgent')).toHaveText('1');
    await tile.click();
    await expect(page).toHaveURL(/\/sos$/);
  });
});
