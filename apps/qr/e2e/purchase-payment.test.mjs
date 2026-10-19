/**
 * Hermetic browser regression for the QR purchase payment critical path
 * (R09 processing → order create/pay/poll → R10 / R10b / R10c / cancel).
 *
 * Extends the FID harness pattern:
 *   - boots Vite via vite.fid.config.mjs (fake Firebase; envDir = e2e; no app .env*)
 *   - seeds auth + journey sessionStorage (no OTP)
 *   - mocks product APIs with Playwright page.route (dead VITE_API_BASE_URL)
 *   - skips real Razorpay by omitting providerOrderId (production branch in payAndPoll),
 *     or injects window.Razorpay for the dismiss/cancel case (no checkout.js download)
 *
 *   A  success   → cart + order + pay (+ Idempotency-Key/Authorization) + poll PAID → R10
 *   B  failed    → poll FAILED → R10b
 *   C  unconfirmed → poll UNCONFIRMED → R10c
 *   D  prepare fail → cart 503 → back to order-summary (no order create)
 *   E  cancel    → fake Razorpay ondismiss → order-summary
 *
 * Does not click R10 Continue (attach / vehicle mutation). Does not dial ngrok/staging/prod.
 */
/* global window */
import { chromium } from 'playwright';
import { createServer } from 'vite';

const CONFIG = new URL('./vite.fid.config.mjs', import.meta.url).pathname;
const QR_CODE = 'ALK-HERMETIC-PAY';
const PLAN_VERSION_ID = 'plan-ver-secure-hermetic';
const CART_ID = 'cart-hermetic-1';
const ORDER_ID = 'order-hermetic-1';
const ACCESS_TOKEN = 'purchase-hermetic-access';

Object.assign(process.env, {
  VITE_API_BASE_URL: 'http://127.0.0.1:3971',
  VITE_ENVIRONMENT: 'development',
  VITE_ENABLE_LOGS: 'true',
  VITE_FIREBASE_API_KEY: 'purchase-test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'purchase-test.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'purchase-test',
  VITE_FIREBASE_STORAGE_BUCKET: 'purchase-test.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000001',
  VITE_FIREBASE_APP_ID: '1:000000000001:web:purchasetest',
  VITE_FIREBASE_VAPID_KEY: 'PURCHASE-TEST-VAPID-KEY',
});

const SEED_TOKENS = {
  accessToken: ACCESS_TOKEN,
  refreshToken: 'purchase-hermetic-refresh',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  userId: 'purchase-hermetic-user',
};

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'} ${name}${detail ? `  — ${detail}` : ''}`);
};

const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function envelope(data) {
  return {
    data,
    meta: { requestId: 'hermetic-req', correlationId: 'hermetic-corr' },
  };
}

function activationPlansPayload() {
  return envelope({
    funded: {
      planId: 'plan-ver-safe-funded',
      tier: 'SAFE',
      name: 'Safe',
      pricePaise: 99900,
      fundedBy: 'MARKETPLACE',
      payablePaise: 0,
      riderCount: 0,
      riderEligible: false,
      features: ['Included'],
    },
    options: [
      {
        planId: PLAN_VERSION_ID,
        tier: 'SECURE',
        name: 'Secure',
        pricePaise: 194800,
        payablePaise: 194800,
        period: 'YEAR',
        version: 1,
        riderCount: 1,
        riderEligible: true,
        riderOptions: [{ riderCount: 1, payablePaise: 0, discountPercent: 0 }],
        features: ['Upgrade'],
      },
    ],
  });
}

function cartPayload() {
  return envelope({
    cartId: CART_ID,
    planPricePaise: 194800,
    riderCoverPaise: 0,
    subtotalPaise: 194800,
    gstPaise: 0,
    discountPaise: 0,
    totalPaise: 194800,
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  });
}

function orderPayload(orderId = ORDER_ID) {
  return envelope({
    orderId,
    subtotalPaise: 194800,
    gstPaise: 0,
    discountPaise: 0,
    totalPaise: 194800,
    status: 'PENDING_PAYMENT',
  });
}

function journeySeed(overrides = {}) {
  return {
    selectedFlow: 'purchase',
    authStatus: 'AUTH_COMPLETED',
    session: {
      purchase: {
        selectedPlanId: 'secure',
        riderCount: 1,
        upgradeCheckout: true,
        checkoutReady: true,
        paymentStatus: 'processing',
        paidAmountInr: 1948,
        promoApplied: false,
        promoInvalid: false,
        promoCode: null,
        ...(overrides.purchase ?? {}),
      },
      vehicle: {
        plate: 'DL7CQ1939',
        confirmed: true,
        ...(overrides.vehicle ?? {}),
      },
      auth: {
        ownerName: 'Hermetic Tester',
        languageId: 'en',
      },
    },
    lastRoutePath: `/onboarding/${QR_CODE}/processing-payment`,
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

async function fulfillJson(route, status, body) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} appUrl
 * @param {{
 *   paymentOutcome?: string,
 *   cartStatus?: number,
 *   payWithGateway?: boolean,
 *   razorpayMode?: 'dismiss' | 'none',
 *   journeyOverrides?: object,
 * }} options
 */
async function boot(browser, appUrl, options = {}) {
  const paymentOutcome = options.paymentOutcome ?? 'PAID';
  const cartStatus = options.cartStatus ?? 200;
  const payWithGateway = Boolean(options.payWithGateway);
  const razorpayMode = options.razorpayMode ?? 'none';

  const captured = {
    cart: [],
    orders: [],
    pays: [],
    payments: [],
    activationPlans: 0,
    unexpected: [],
  };

  const context = await browser.newContext();
  await context.grantPermissions(['notifications'], { origin: new URL(appUrl).origin });

  await context.addInitScript(
    ([tokens, journey, resolve, fcmCfg, rzpMode]) => {
      sessionStorage.setItem('al-auth-tokens-v1', JSON.stringify(tokens));
      sessionStorage.setItem('al-journey-v1', JSON.stringify(journey));
      sessionStorage.setItem('al-last-qr-resolve', JSON.stringify(resolve));
      sessionStorage.setItem('qr_code', resolve.qrCode);
      window.__fcmConfig = fcmCfg;

      if (rzpMode === 'dismiss') {
        window.Razorpay = function Razorpay(opts) {
          this._opts = opts;
          this.open = () => {
            queueMicrotask(() => {
              opts?.modal?.ondismiss?.();
            });
          };
          this.on = () => undefined;
        };
      }
    },
    [
      SEED_TOKENS,
      journeySeed(options.journeyOverrides ?? {}),
      qrResolveSeed(),
      { fidDelayMs: -1 },
      razorpayMode,
    ],
  );

  const page = await context.newPage();

  // Never load live Razorpay checkout.js.
  await page.route('**/checkout.razorpay.com/**', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.route('**/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (path === '/v1/devices/token') {
      if (method === 'POST') {
        await fulfillJson(route, 200, envelope({ deviceId: 'hermetic-device' }));
        return;
      }
      if (method === 'DELETE') {
        await route.fulfill({ status: 204, body: '' });
        return;
      }
    }

    if (method === 'GET' && path === '/v1/activation/plans') {
      captured.activationPlans += 1;
      await fulfillJson(route, 200, activationPlansPayload());
      return;
    }

    if (method === 'GET' && path.startsWith('/v1/qr/') && path.endsWith('/resolve')) {
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

    if (method === 'POST' && path === '/v1/cart') {
      const body = JSON.parse(req.postData() ?? '{}');
      captured.cart.push({
        body,
        authorization: req.headers().authorization ?? '',
      });
      if (cartStatus !== 200) {
        await fulfillJson(route, cartStatus, {
          error: {
            code: 'CART_UNAVAILABLE',
            message: 'Cart temporarily unavailable.',
            requestId: 'hermetic-req',
            correlationId: 'hermetic-corr',
          },
        });
        return;
      }
      await fulfillJson(route, 200, cartPayload());
      return;
    }

    if (method === 'POST' && path === '/v1/orders') {
      const body = JSON.parse(req.postData() ?? '{}');
      captured.orders.push({
        body,
        authorization: req.headers().authorization ?? '',
        idempotencyKey: req.headers()['idempotency-key'] ?? '',
      });
      await fulfillJson(route, 200, orderPayload());
      return;
    }

    if (method === 'POST' && /^\/v1\/orders\/[^/]+\/pay$/.test(path)) {
      const body = JSON.parse(req.postData() ?? '{}');
      captured.pays.push({
        path,
        body,
        authorization: req.headers().authorization ?? '',
        idempotencyKey: req.headers()['idempotency-key'] ?? '',
      });
      const payment = {
        paymentRef: 'payref-hermetic-1',
      };
      if (payWithGateway) {
        payment.providerOrderId = 'rzp_order_hermetic_1';
        payment.razorpayKeyId = 'rzp_test_hermetic_key';
      }
      await fulfillJson(route, 200, envelope(payment));
      return;
    }

    if (method === 'GET' && /^\/v1\/orders\/[^/]+\/payment$/.test(path)) {
      captured.payments.push({ path, authorization: req.headers().authorization ?? '' });
      await fulfillJson(route, 200, envelope({ outcome: paymentOutcome }));
      return;
    }

    if (method === 'GET' && /^\/v1\/orders\/[^/]+\/invoice$/.test(path)) {
      await fulfillJson(
        route,
        200,
        envelope({ invoiceUrl: 'https://127.0.0.1:9/hermetic-invoice.pdf' }),
      );
      return;
    }

    if (method === 'GET' && path === '/v1/vehicles') {
      await fulfillJson(route, 200, envelope([]));
      return;
    }

    captured.unexpected.push(`${method} ${path}`);
    await fulfillJson(route, 404, {
      error: {
        code: 'NOT_MOCKED',
        message: `Unhandled hermetic route: ${method} ${path}`,
        requestId: 'hermetic-req',
        correlationId: 'hermetic-corr',
      },
    });
  });

  const target = `${appUrl.replace(/\/$/, '')}/onboarding/${encodeURIComponent(QR_CODE)}/processing-payment`;
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const close = async () => {
    try {
      await context.close();
    } catch {
      /* teardown races are not under test */
    }
  };

  return { page, captured, close };
}

async function run(browser, appUrl) {
  console.log('\n[A] Critical path — poll-only success (no Razorpay gateway)');
  {
    const { page, captured, close } = await boot(browser, appUrl, { paymentOutcome: 'PAID' });
    await page.waitForURL(/\/payment-success(?:\?|$)/, { timeout: 30_000 });
    const titleVisible = await page.getByText('Payment successful').isVisible();

    check(
      'A: POST /v1/cart with QR code + plan version + riders',
      captured.cart.length >= 1 &&
        captured.cart[0].body.code === QR_CODE &&
        captured.cart[0].body.planId === PLAN_VERSION_ID &&
        captured.cart[0].body.riderCount === 1,
      JSON.stringify(captured.cart[0]?.body),
    );
    check(
      'A: cart Authorization bearer',
      captured.cart[0]?.authorization === `Bearer ${ACCESS_TOKEN}`,
      captured.cart[0]?.authorization,
    );
    check(
      'A: POST /v1/orders { cartId } + Idempotency-Key UUID',
      captured.orders.length >= 1 &&
        captured.orders[0].body.cartId === CART_ID &&
        isUuid(captured.orders[0].idempotencyKey),
      JSON.stringify({
        body: captured.orders[0]?.body,
        key: captured.orders[0]?.idempotencyKey,
      }),
    );
    check(
      'A: order Authorization bearer',
      captured.orders[0]?.authorization === `Bearer ${ACCESS_TOKEN}`,
    );
    check(
      'A: POST …/pay with Idempotency-Key UUID (empty ONLINE body)',
      captured.pays.length >= 1 &&
        captured.pays[0].path.endsWith(`/${ORDER_ID}/pay`) &&
        isUuid(captured.pays[0].idempotencyKey) &&
        Object.keys(captured.pays[0].body).length === 0,
      JSON.stringify(captured.pays[0]),
    );
    check(
      'A: GET …/payment polled to PAID',
      captured.payments.length >= 1 && captured.payments[0].path.endsWith(`/${ORDER_ID}/payment`),
      `${captured.payments.length} poll(s)`,
    );
    check('A: landed on payment-success', /\/payment-success/.test(page.url()), page.url());
    check('A: success UI title', titleVisible);
    check(
      'A: no unexpected /v1 traffic',
      captured.unexpected.length === 0,
      captured.unexpected.join(' | '),
    );
    await close();
  }

  console.log('\n[B] Terminal FAILED → R10b');
  {
    const { page, captured, close } = await boot(browser, appUrl, { paymentOutcome: 'FAILED' });
    await page.waitForURL(/\/payment-failed(?:\?|$)/, { timeout: 30_000 });
    const titleVisible = await page.getByText("Payment didn't go through").isVisible();
    check('B: landed on payment-failed', /\/payment-failed/.test(page.url()), page.url());
    check('B: failed UI title', titleVisible);
    check('B: order + pay still issued', captured.orders.length >= 1 && captured.pays.length >= 1);
    await close();
  }

  console.log('\n[C] Terminal UNCONFIRMED → R10c');
  {
    const { page, captured, close } = await boot(browser, appUrl, {
      paymentOutcome: 'UNCONFIRMED',
    });
    await page.waitForURL(/\/payment-unconfirmed(?:\?|$)/, { timeout: 30_000 });
    const titleVisible = await page.getByText("We couldn't confirm your payment").isVisible();
    check('C: landed on payment-unconfirmed', /\/payment-unconfirmed/.test(page.url()), page.url());
    check('C: unconfirmed UI title', titleVisible);
    check('C: payment polled', captured.payments.length >= 1);
    await close();
  }

  console.log('\n[D] Prepare failure — cart 503 → order-summary (no order)');
  {
    const { page, captured, close } = await boot(browser, appUrl, { cartStatus: 503 });
    await page.waitForURL(/\/order-summary(?:\?|$)/, { timeout: 30_000 });
    check('D: returned to order-summary', /\/order-summary/.test(page.url()), page.url());
    check('D: cart attempted', captured.cart.length >= 1);
    check('D: no order create', captured.orders.length === 0, `${captured.orders.length} order(s)`);
    check('D: no pay', captured.pays.length === 0);
    await close();
  }

  console.log('\n[E] Gateway dismiss/cancel via injected window.Razorpay');
  {
    const { page, captured, close } = await boot(browser, appUrl, {
      payWithGateway: true,
      razorpayMode: 'dismiss',
      paymentOutcome: 'PAID', // must not be reached on cancel
    });
    await page.waitForURL(/\/order-summary(?:\?|$)/, { timeout: 30_000 });
    check('E: cancel returns to order-summary', /\/order-summary/.test(page.url()), page.url());
    check('E: pay opened (gateway path)', captured.pays.length >= 1);
    check(
      'E: payment poll skipped after dismiss',
      captured.payments.length === 0,
      `${captured.payments.length} poll(s)`,
    );
    await close();
  }
}

const main = async () => {
  const server = await createServer({ configFile: CONFIG });
  await server.listen();
  const appUrl = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5200/';
  console.log(`QR purchase payment hermetic harness — app served at ${appUrl}`);

  const browser = await chromium.launch({ headless: true });
  try {
    await run(browser, appUrl);
  } finally {
    await browser.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
  if (failed.length) {
    process.exit(1);
  }
};

main().catch((e) => {
  console.error('HARNESS FAILED:', e?.stack ?? e);
  process.exit(2);
});
