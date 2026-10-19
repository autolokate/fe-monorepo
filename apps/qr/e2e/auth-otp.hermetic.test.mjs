/**
 * Hermetic browser regression for QR unauth entry + OTP request/verify + refresh.
 *
 * Extends FID / purchase-hermetic pattern:
 *   - boots Vite via vite.fid.config.mjs (fake Firebase; envDir = e2e; no app .env*)
 *   - dead VITE_API_BASE_URL; Playwright page.route stubs
 *   - no live SMS, OTP, Razorpay, or prod credentials
 *
 * Cases:
 *   A  unauth QR entry → mobile form (GET /v1/qr/{code}/resolve)
 *   B  OTP request success → /otp + POST /v1/auth/otp/request body
 *   C  OTP verify success (existing user) → tokens saved + leaves OTP
 *   D  OTP verify fail → error surface, no tokens
 *   E  expired session refresh success → POST /v1/auth/refresh, stays signed-in path
 *   F  API error on OTP request → stays on mobile with recoverable state
 *
 * Garage pass money paths are Partner/Admin — not exercised here (shared auth only).
 */
/* global window */
import { chromium } from 'playwright';
import { createServer } from 'vite';

const CONFIG = new URL('./vite.fid.config.mjs', import.meta.url).pathname;
const QR_CODE = 'ALK-HERM-OTP';
const MOBILE = '9876543210';
const E164 = '+919876543210';
const VALID_OTP = '123456';
const BAD_OTP = '000000';

Object.assign(process.env, {
  VITE_API_BASE_URL: 'http://127.0.0.1:3971',
  VITE_ENVIRONMENT: 'development',
  VITE_ENABLE_LOGS: 'true',
  VITE_FIREBASE_API_KEY: 'otp-hermetic-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'otp-hermetic.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'otp-hermetic',
  VITE_FIREBASE_STORAGE_BUCKET: 'otp-hermetic.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000002',
  VITE_FIREBASE_APP_ID: '1:000000000002:web:otphermetic',
  VITE_FIREBASE_VAPID_KEY: 'OTP-HERMETIC-VAPID-KEY',
});

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'} ${name}${detail ? `  — ${detail}` : ''}`);
};

function envelope(data) {
  return {
    data,
    meta: { requestId: 'hermetic-req', correlationId: 'hermetic-corr' },
  };
}

function errorEnvelope(message, code = 'otp_invalid') {
  return {
    error: {
      code,
      message,
      requestId: 'hermetic-req',
      correlationId: 'hermetic-corr',
    },
  };
}

async function fulfillJson(route, status, body) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function authJourneySeed() {
  return {
    selectedFlow: 'purchase',
    authStatus: 'AUTH_REQUIRED',
    session: {
      auth: {},
      purchase: {},
    },
    lastRoutePath: `/onboarding/${QR_CODE}/welcome`,
  };
}

function qrResolveSeed() {
  return {
    qrCode: QR_CODE,
    qrStatus: 'DISTRIBUTED',
    channel: 'B2C',
    journey: 'CONSUMER_PREPAID',
    vehicle: null,
    resolvedAt: new Date().toISOString(),
  };
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} appUrl
 * @param {{
 *   tokens?: object | null,
 *   otpVerifyStatus?: number,
 *   otpRequestStatus?: number,
 *   refreshStatus?: number,
 *   journeySeed?: object | null,
 *   resolveSeed?: object | null,
 *   path?: string,
 * }} options
 */
async function boot(browser, appUrl, options = {}) {
  const otpVerifyStatus = options.otpVerifyStatus ?? 200;
  const otpRequestStatus = options.otpRequestStatus ?? 200;
  const refreshStatus = options.refreshStatus ?? 200;

  const captured = {
    resolve: [],
    otpRequest: [],
    otpVerify: [],
    refresh: [],
    preview: [],
    unexpected: [],
  };

  const context = await browser.newContext();
  await context.grantPermissions(['notifications'], { origin: new URL(appUrl).origin });

  await context.addInitScript(
    ([tokens, journey, resolve, fcmCfg]) => {
      if (tokens) {
        sessionStorage.setItem('al-auth-tokens-v1', JSON.stringify(tokens));
      } else {
        sessionStorage.removeItem('al-auth-tokens-v1');
      }
      if (journey) {
        sessionStorage.setItem('al-journey-v1', JSON.stringify(journey));
      } else {
        sessionStorage.removeItem('al-journey-v1');
      }
      if (resolve) {
        sessionStorage.setItem('al-last-qr-resolve', JSON.stringify(resolve));
        sessionStorage.setItem('qr_code', resolve.qrCode);
      } else {
        sessionStorage.removeItem('al-last-qr-resolve');
        sessionStorage.removeItem('qr_code');
      }
      window.__fcmConfig = fcmCfg;
    },
    [
      options.tokens === undefined ? null : options.tokens,
      options.journeySeed === undefined ? authJourneySeed() : options.journeySeed,
      options.resolveSeed === undefined ? qrResolveSeed() : options.resolveSeed,
      { fidDelayMs: -1 },
    ],
  );

  const page = await context.newPage();

  await page.route('**/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (method === 'GET' && path.startsWith('/v1/qr/') && path.endsWith('/resolve')) {
      captured.resolve.push(path);
      await fulfillJson(
        route,
        200,
        envelope({
          qrStatus: 'DISTRIBUTED',
          channel: 'B2C',
          journey: 'CONSUMER_PREPAID',
          vehicle: null,
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/v1/activation/preview') {
      captured.preview.push(path);
      await fulfillJson(
        route,
        200,
        envelope({
          planId: 'plan-hermetic-preview',
          tier: 'SAFE',
          name: 'Safe',
          pricePaise: 0,
          payablePaise: 0,
          riderCount: 0,
          fundedBy: 'MARKETPLACE',
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/v1/auth/otp/request') {
      const body = JSON.parse(req.postData() ?? '{}');
      captured.otpRequest.push(body);
      if (otpRequestStatus >= 400) {
        await fulfillJson(
          route,
          otpRequestStatus,
          errorEnvelope('Too many requests', 'rate_limited'),
        );
        return;
      }
      await fulfillJson(route, 200, envelope({ channel: 'sms' }));
      return;
    }

    if (method === 'POST' && path === '/v1/auth/otp/verify') {
      const body = JSON.parse(req.postData() ?? '{}');
      captured.otpVerify.push(body);
      if (otpVerifyStatus >= 400) {
        await fulfillJson(route, otpVerifyStatus, errorEnvelope('Incorrect OTP', 'otp_invalid'));
        return;
      }
      await fulfillJson(
        route,
        200,
        envelope({
          accessToken: 'otp-hermetic-access',
          refreshToken: 'otp-hermetic-refresh',
          expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
          userId: 'otp-hermetic-user',
          isNewUser: false,
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/v1/auth/refresh') {
      const body = JSON.parse(req.postData() ?? '{}');
      captured.refresh.push(body);
      if (refreshStatus >= 400) {
        await fulfillJson(route, refreshStatus, errorEnvelope('Refresh failed', 'unauthorized'));
        return;
      }
      await fulfillJson(
        route,
        200,
        envelope({
          accessToken: 'otp-hermetic-access-refreshed',
          refreshToken: 'otp-hermetic-refresh-rotated',
          expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
          userId: 'otp-hermetic-user',
        }),
      );
      return;
    }

    if (path === '/v1/devices/token') {
      if (method === 'POST') {
        await fulfillJson(route, 200, envelope({ deviceId: 'otp-hermetic-device' }));
        return;
      }
      if (method === 'DELETE') {
        await route.fulfill({ status: 204, body: '' });
        return;
      }
    }

    if (method === 'GET' && path === '/v1/activation/plans') {
      await fulfillJson(
        route,
        200,
        envelope({
          funded: null,
          options: [],
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/v1/profile') {
      await fulfillJson(
        route,
        200,
        envelope({ name: 'Hermetic', locale: 'en', photoMediaId: null }),
      );
      return;
    }

    if (method === 'GET' && path === '/v1/legal/documents') {
      await fulfillJson(route, 200, envelope({ noticeVersion: '1', documents: [] }));
      return;
    }

    if (method === 'POST' && path === '/v1/me/consents') {
      await fulfillJson(route, 200, envelope({ ok: true }));
      return;
    }

    captured.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled hermetic route: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  // Default: in-flow unauth auth (`?auth=continue`) — skips QR re-resolve that navigates to welcome.
  const target =
    options.path ??
    `${appUrl.replace(/\/$/, '')}/onboarding/${encodeURIComponent(QR_CODE)}/auth?auth=continue`;
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  return { page, context, captured };
}

async function fillMobileAndConsent(page) {
  await page.getByLabel('Mobile number').fill(MOBILE);
  const consent = page.getByRole('checkbox', {
    name: /Consent to Privacy Policy and Terms/i,
  });
  if (await consent.count()) {
    // Custom checkbox: visual box intercepts the native input — force the check.
    await consent.check({ force: true });
  }
}

async function enterOtp(page, code) {
  const first = page.getByLabel('Digit 1 of 6');
  await first.click();
  await page.keyboard.type(code);
}

async function main() {
  const server = await createServer({
    configFile: CONFIG,
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') {
    throw new Error('Vite server has no TCP address');
  }
  const appUrl = `http://127.0.0.1:${address.port}`;
  console.log(`QR auth OTP hermetic harness — app served at ${appUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // A1 — unauth QR resolve entry lands purchase welcome (preview-before-login)
    {
      const { page, context, captured } = await boot(browser, appUrl, {
        tokens: null,
        journeySeed: null,
        resolveSeed: null,
        path: `${appUrl.replace(/\/$/, '')}/onboarding/${encodeURIComponent(QR_CODE)}/auth?q=${encodeURIComponent(QR_CODE)}`,
      });
      await page.waitForURL(/\/welcome/, { timeout: 30_000 });
      check(
        'A1 unauth QR resolve hits GET /resolve',
        captured.resolve.some((p) => p.includes(QR_CODE)),
        captured.resolve.join(','),
      );
      check(
        'A1 navigates to purchase welcome (not OTP)',
        page.url().includes('/welcome'),
        page.url(),
      );
      await context.close();
    }

    // A2 — unauth auth continue shows mobile form (shared OTP entry)
    {
      const { page, context, captured } = await boot(browser, appUrl, { tokens: null });
      await expectHeading(page, "What's your number?");
      check(
        'A2 unauth auth-continue shows mobile form',
        (await page.getByLabel('Mobile number').count()) === 1,
      );
      check(
        'A2 no resolve on auth-continue',
        captured.resolve.length === 0,
        captured.resolve.join(','),
      );
      await context.close();
    }

    // B — OTP request success
    {
      const { page, context, captured } = await boot(browser, appUrl, { tokens: null });
      await expectHeading(page, "What's your number?");
      await fillMobileAndConsent(page);
      await page.getByRole('button', { name: 'Get OTP' }).click();
      await expectHeading(page, 'Enter the 6-digit code');
      check(
        'B OTP request POSTs E.164 phone',
        captured.otpRequest.length === 1 && captured.otpRequest[0]?.phone === E164,
        JSON.stringify(captured.otpRequest[0]),
      );
      check('B navigates to OTP screen', page.url().includes('/otp'));
      await context.close();
    }

    // C — OTP verify success
    {
      const { page, context, captured } = await boot(browser, appUrl, { tokens: null });
      await expectHeading(page, "What's your number?");
      await fillMobileAndConsent(page);
      await page.getByRole('button', { name: 'Get OTP' }).click();
      await expectHeading(page, 'Enter the 6-digit code');
      await enterOtp(page, VALID_OTP);
      await page.waitForTimeout(500);
      const tokens = await page.evaluate(() => sessionStorage.getItem('al-auth-tokens-v1'));
      const parsed = tokens ? JSON.parse(tokens) : null;
      check(
        'C OTP verify POSTs phone+code',
        captured.otpVerify.length >= 1 &&
          captured.otpVerify[0]?.phone === E164 &&
          captured.otpVerify[0]?.code === VALID_OTP,
        JSON.stringify(captured.otpVerify[0]),
      );
      check(
        'C tokens persisted after verify',
        Boolean(parsed?.accessToken && parsed?.refreshToken),
        tokens ?? 'null',
      );
      check(
        'C leaves OTP screen after success',
        !page.url().includes('/otp') ||
          (await page.getByText('Enter the 6-digit code').count()) === 0,
        page.url(),
      );
      await context.close();
    }

    // D — OTP verify fail
    {
      const { page, context, captured } = await boot(browser, appUrl, {
        tokens: null,
        otpVerifyStatus: 401,
      });
      await expectHeading(page, "What's your number?");
      await fillMobileAndConsent(page);
      await page.getByRole('button', { name: 'Get OTP' }).click();
      await expectHeading(page, 'Enter the 6-digit code');
      await enterOtp(page, BAD_OTP);
      await expect(page, /Incorrect code|Incorrect OTP|try again/i);
      const tokens = await page.evaluate(() => sessionStorage.getItem('al-auth-tokens-v1'));
      check('D verify failure keeps OTP screen', page.url().includes('/otp'));
      check('D no auth tokens after failed verify', tokens === null, tokens ?? 'null');
      check('D verify was attempted', captured.otpVerify.length >= 1);
      await context.close();
    }

    // E — expired session refresh
    {
      const expired = {
        accessToken: 'otp-hermetic-access-expired',
        refreshToken: 'otp-hermetic-refresh-old',
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
        userId: 'otp-hermetic-user',
      };
      const { page, context, captured } = await boot(browser, appUrl, { tokens: expired });
      await page.waitForTimeout(1500);
      check(
        'E refresh called for expired session',
        captured.refresh.length >= 1 &&
          captured.refresh[0]?.refreshToken === 'otp-hermetic-refresh-old',
        JSON.stringify(captured.refresh),
      );
      const tokens = await page.evaluate(() => sessionStorage.getItem('al-auth-tokens-v1'));
      const parsed = tokens ? JSON.parse(tokens) : null;
      check(
        'E rotated access token after refresh',
        parsed?.accessToken === 'otp-hermetic-access-refreshed',
        tokens ?? 'null',
      );
      // Signed-in + QR → leaves auth mobile form for activation.
      check(
        'E does not stay on unauth mobile form',
        (await page.getByLabel('Mobile number').count()) === 0,
        page.url(),
      );
      await context.close();
    }

    // F — OTP request API error
    {
      const { page, context, captured } = await boot(browser, appUrl, {
        tokens: null,
        otpRequestStatus: 429,
      });
      await expectHeading(page, "What's your number?");
      await fillMobileAndConsent(page);
      await page.getByRole('button', { name: 'Get OTP' }).click();
      await page.waitForTimeout(500);
      check('F OTP request attempted', captured.otpRequest.length === 1);
      check(
        'F stays on mobile after request failure',
        page.url().includes('/auth') && !page.url().includes('/otp'),
        page.url(),
      );
      check(
        'F no tokens after request failure',
        (await page.evaluate(() => sessionStorage.getItem('al-auth-tokens-v1'))) === null,
      );
      await context.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\nQR auth OTP hermetic: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    for (const f of failed) {
      console.log(`  FAIL ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
    }
    process.exit(1);
  }
}

async function expectHeading(page, text) {
  await page.getByRole('heading', { name: text }).waitFor({ timeout: 30_000 });
}

async function expect(page, pattern) {
  await page.getByText(pattern).first().waitFor({ timeout: 10_000 });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
