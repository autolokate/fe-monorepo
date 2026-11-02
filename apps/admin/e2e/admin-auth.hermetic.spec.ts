import { expect, test, type Route } from '@playwright/test';

import {
  HERMETIC_TOKENS,
  hermeticJwt,
  installHermeticApiRoutes,
  seedHermeticSession,
} from './helpers/hermetic';

async function json(route: Route, status: number, body: unknown) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

/**
 * ADM-01/02/03 — the three admin gates (role → step-up) and server sign-out.
 * Synthetic tokens only; the server remains the authority on step_up.
 */
test.describe('Admin auth gates (hermetic)', () => {
  test('ADM-03 — non-OPERATOR session gets the access-denied screen and no admin calls', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'CONSUMER' });
    await seedHermeticSession(page);
    await page.goto('/orders');
    await expect(page.getByTestId('admin-access-denied')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('admin-access-denied')).toContainText('CONSUMER');
    await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toHaveCount(0);
    expect(capture.ordersGet).toBe(0);
    expect(capture.unexpected).toEqual([]);
  });

  test('ADM-01 — OPERATOR token without step_up must verify an OTP; stepped-up token is stored', async ({
    page,
  }) => {
    const capture = await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    const stepUpCalls: Array<{ path: string; body: unknown }> = [];
    const steppedUp = hermeticJwt({ role: 'OPERATOR', step_up: true });
    await page.route('**/v1/auth/step-up/otp/**', async (route) => {
      const url = new URL(route.request().url());
      stepUpCalls.push({ path: url.pathname, body: route.request().postDataJSON() as unknown });
      if (url.pathname.endsWith('/request')) {
        await json(route, 202, { data: { channel: 'sms' } });
        return;
      }
      await json(route, 200, { data: { accessToken: steppedUp, expiresIn: 900 } });
    });
    await seedHermeticSession(page, {
      ...HERMETIC_TOKENS,
      accessToken: hermeticJwt({ role: 'OPERATOR', step_up: false }),
    });

    await page.goto('/orders');
    await expect(page.getByTestId('admin-step-up')).toBeVisible({ timeout: 15_000 });
    // No admin-plane call is attempted before step-up.
    expect(capture.ordersGet).toBe(0);

    await page.getByTestId('admin-step-up-send').click();
    await page.locator('.admin-login-otp input').first().click();
    await page.keyboard.type('123456');
    await page.getByTestId('admin-step-up-verify').click();

    await expect(page.getByRole('heading', { name: 'Orders', exact: true })).toBeVisible({
      timeout: 15_000,
    });
    expect(stepUpCalls.map((call) => call.path)).toEqual([
      '/v1/auth/step-up/otp/request',
      '/v1/auth/step-up/otp/verify',
    ]);
    expect(stepUpCalls[1]?.body).toEqual({ token: '123456' });
    const stored = await page.evaluate(() => sessionStorage.getItem('al-admin-auth-tokens-v1'));
    expect(JSON.parse(stored ?? '{}')).toMatchObject({ accessToken: steppedUp });
    expect(capture.unexpected).toEqual([]);
  });

  test('ADM-01 — step-up send right after sign-in (SMS resend window) explains the wait', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await page.route('**/v1/auth/step-up/otp/request', async (route) => {
      await json(route, 429, {
        error: { code: 'rate_limited', message: 'Too many OTP attempts. Try again shortly.' },
      });
    });
    await seedHermeticSession(page, {
      ...HERMETIC_TOKENS,
      accessToken: hermeticJwt({ role: 'OPERATOR', step_up: false }),
    });
    await page.goto('/orders');
    await page.getByTestId('admin-step-up-send').click({ timeout: 15_000 });
    await expect(page.getByRole('alert')).toContainText('Wait about a minute');
    await expect(page.getByTestId('admin-step-up-send')).toBeEnabled();
  });

  test('ADM-01 — a 403 step_up_required from any admin call re-opens the step-up prompt', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    await page.route('**/admin/v1/orders**', async (route) => {
      await json(route, 403, {
        error: { code: 'step_up_required', message: 'Step-up (2FA) required for the admin plane.' },
      });
    });
    await seedHermeticSession(page);
    await page.goto('/orders');
    await expect(page.getByTestId('admin-step-up')).toBeVisible({ timeout: 15_000 });
  });

  test('ADM-02 — sign out calls POST /v1/auth/logout, then clears the session', async ({
    page,
  }) => {
    await installHermeticApiRoutes(page, { sessionRole: 'OPERATOR' });
    let logoutCalls = 0;
    await page.route('**/v1/auth/logout', async (route) => {
      logoutCalls += 1;
      await route.fulfill({ status: 204, body: '' });
    });
    await seedHermeticSession(page);
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('button', { name: 'Send code' })).toBeVisible({ timeout: 15_000 });
    expect(logoutCalls).toBe(1);
    const stored = await page.evaluate(() => sessionStorage.getItem('al-admin-auth-tokens-v1'));
    expect(stored).toBeNull();
  });
});
