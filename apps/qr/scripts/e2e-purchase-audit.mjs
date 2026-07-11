#!/usr/bin/env node
/**
 * Full purchase-flow E2E network audit.
 * Output: scripts/e2e-audit-report.json
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:5173';
const API_BASE =
  process.env.VERIFY_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  'https://malisa-noninclusive-davin.ngrok-free.dev';
const QR_CODE = process.env.VERIFY_QR_CODE ?? 'ALK-B2C005';
const PLATE = process.env.VERIFY_PLATE ?? 'DL7CQ1939';
const PHONE = process.env.VERIFY_PHONE ?? '9876543210';
const OTP = process.env.VERIFY_OTP ?? '123456';
const OWNER = process.env.VERIFY_OWNER_NAME ?? 'Kapil Test';
const RAZORPAY_CONTACT = process.env.VERIFY_RAZORPAY_CONTACT ?? '9898293940';
const HEADED = process.env.VERIFY_HEADED !== '0';

const timeline = [];
const consoleLogs = [];
let order = 0;

function isTrackedApi(url) {
  return url.startsWith(API_BASE) && url.includes('/v1/');
}

async function parseResponseBody(response) {
  try {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text.slice(0, 2000);
    }
  } catch {
    return null;
  }
}

async function fillOtpCells(page, otp) {
  const digits = otp.padEnd(6, '0').slice(0, 6);
  const cells = page.locator('.al-otp-input__cell');
  await cells.first().waitFor({ state: 'visible', timeout: 15000 });
  const count = await cells.count();
  for (let i = 0; i < Math.min(count, 6); i += 1) {
    await cells.nth(i).fill(digits[i]);
  }
}

async function acceptConsent(page) {
  const consent = page.locator('input[type="checkbox"]').first();
  if (await consent.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consent.check({ force: true });
  }
}

async function clickFooterCta(page, labelRe) {
  const btn = page.locator('.ob-auth-shell__cta, .ob-step-chrome__cta').filter({ hasText: labelRe });
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.waitFor({ state: 'attached', timeout: 5000 });
  await page.waitForFunction(
    (re) => {
      const buttons = document.querySelectorAll('.ob-auth-shell__cta, .ob-step-chrome__cta');
      for (const b of buttons) {
        if (new RegExp(re, 'i').test(b.textContent ?? '') && !b.disabled) {
          return true;
        }
      }
      return false;
    },
    labelRe.source,
    { timeout: 20000 },
  );
  await btn.click({ timeout: 15000 });
}

async function tryFrameNetbanking(page, frame) {
  const backdrop = frame.locator('#overlay-backdrop, [data-testid^="overlay"]');
  if (await backdrop.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => undefined);
    await backdrop.first().click({ force: true, timeout: 2000 }).catch(() => undefined);
    await page.waitForTimeout(800);
  }

  const phoneInput = frame.locator(
    'input[name="contact"], input[type="tel"], input[placeholder*="mobile" i], input[placeholder*="phone" i]',
  );
  if (await phoneInput.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await phoneInput.first().fill(RAZORPAY_CONTACT);
    await page.waitForTimeout(500);
  }

  const netbanking = frame.locator('[data-testid="Netbanking"], [data-testid="netbanking"]').first();
  if (await netbanking.isVisible({ timeout: 5000 }).catch(() => false)) {
    await netbanking.click({ force: true, timeout: 10000 });
    await page.waitForTimeout(1200);
  } else {
    for (const label of [/netbanking/i, /net banking/i]) {
      const method = frame.getByText(label).first();
      if (await method.isVisible({ timeout: 2000 }).catch(() => false)) {
        await method.click({ force: true, timeout: 8000 });
        await page.waitForTimeout(1200);
        break;
      }
    }
  }

  for (const bank of [/HDFC/i, /ICICI/i, /Axis/i, /SBI/i, /Bank of/i]) {
    const bankBtn = frame.getByText(bank).first();
    if (await bankBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bankBtn.click({ timeout: 5000 });
      await page.waitForTimeout(1500);
      break;
    }
  }

  const payBtn = frame.locator(
    'button:has-text("Pay"), button:has-text("Continue"), button#pay-now, button[type="submit"]',
  );
  if (await payBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await payBtn.first().click({ timeout: 10000 });
    await page.waitForTimeout(3000);
  }

  for (const f of page.frames()) {
    const success = f.getByText(/success/i).first();
    if (await success.isVisible({ timeout: 8000 }).catch(() => false)) {
      await success.click({ timeout: 5000 }).catch(() => undefined);
      const submit = f.locator('button:has-text("Submit"), button:has-text("Continue"), button[type="submit"]');
      if (await submit.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await submit.first().click({ timeout: 5000 });
      }
      console.log('[razorpay] clicked test bank success');
      await page.waitForTimeout(3000);
      return true;
    }
  }
  return false;
}

async function completeRazorpayNetbanking(page) {
  try {
    console.log('[razorpay] waiting for checkout (netbanking)…');
    await page.waitForTimeout(4000);
    await page
      .waitForSelector('iframe.razorpay-checkout-frame, iframe[src*="razorpay"]', { timeout: 30000 })
      .catch(() => undefined);

    const selectors = [
      'iframe.razorpay-checkout-frame',
      'iframe[name="razorpay-checkout-frame"]',
      'iframe[src*="razorpay"]',
    ];
    for (const sel of selectors) {
      if ((await page.locator(sel).count()) === 0) {
        continue;
      }
      const frame = page.frameLocator(sel).first();
      if (await tryFrameNetbanking(page, frame)) {
        return true;
      }
    }
    for (const sel of selectors) {
      if ((await page.locator(sel).count()) === 0) {
        continue;
      }
      const frame = page.frameLocator(sel).first();
      if (await tryFrameNetbanking(page, frame)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('[razorpay] netbanking automation failed:', error?.message ?? error);
    return false;
  }
}

async function completeRazorpay(page) {
  console.log('[razorpay] waiting for checkout iframe…');
  await page.waitForTimeout(3000);

  await page
    .waitForSelector('iframe.razorpay-checkout-frame, iframe[src*="razorpay"], iframe[name*="razorpay"]', {
      timeout: 25000,
    })
    .catch(() => undefined);

  const tryFrameLocator = async (frame) => {
    console.log('[razorpay] interacting with checkout frame');

    for (const label of [/card/i, /debit/i, /credit/i]) {
      const method = frame.getByText(label).first();
      if (await method.isVisible({ timeout: 1500 }).catch(() => false)) {
        await method.click({ timeout: 3000 }).catch(() => undefined);
        await page.waitForTimeout(800);
        break;
      }
    }

    const cardSelectors = [
      'input[name="card.number"]',
      'input[autocomplete="cc-number"]',
      'input[placeholder*="card" i]',
      '#card_number',
      'input[inputmode="numeric"]',
    ];

    let cardInput = null;
    for (const sel of cardSelectors) {
      const loc = frame.locator(sel).first();
      if (await loc.isVisible({ timeout: 2000 }).catch(() => false)) {
        cardInput = loc;
        break;
      }
    }

    if (!cardInput) {
      return false;
    }

    await cardInput.click({ timeout: 5000 });
    await cardInput.fill('4111111111111111');

    const expiry = frame.locator(
      'input[name="card.expiry"], input[placeholder*="MM" i], input[autocomplete="cc-exp"]',
    );
    if ((await expiry.count()) > 0) {
      await expiry.first().fill('1230');
    }

    const cvv = frame.locator('input[name="card.cvv"], input[placeholder*="CVV" i], input[autocomplete="cc-csc"]');
    if ((await cvv.count()) > 0) {
      await cvv.first().fill('123');
    }

    const name = frame.locator('input[name="card.name"], input[placeholder*="name" i]');
    if ((await name.count()) > 0) {
      await name.first().fill('Kapil Test');
    }

    const payBtn = frame.locator(
      'button:has-text("Pay"), button#pay-now, button[type="submit"], button:has-text("Continue")',
    );
    await payBtn.first().click({ timeout: 10000 });
    await page.waitForTimeout(4000);

    for (const otpSel of [
      'input[name="otp"]',
      'input[placeholder*="OTP" i]',
      'input[placeholder*="otp" i]',
      'input[type="password"]',
    ]) {
      const otpInput = frame.locator(otpSel).first();
      if (await otpInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await otpInput.fill('123456');
        const submit = frame.locator('button:has-text("Submit"), button:has-text("Pay"), button[type="submit"]');
        await submit.first().click({ timeout: 8000 }).catch(() => undefined);
        console.log('[razorpay] OTP submitted');
        await page.waitForTimeout(3000);
        return true;
      }
    }

    console.log('[razorpay] card form submitted (no OTP screen detected)');
    return true;
  };

  const iframeSelectors = [
    'iframe.razorpay-checkout-frame',
    'iframe[name="razorpay-checkout-frame"]',
    'iframe[src*="razorpay"]',
    '.razorpay-container iframe',
  ];

  for (const sel of iframeSelectors) {
    const el = page.locator(sel).first();
    if ((await el.count()) === 0) {
      continue;
    }
    const frame = page.frameLocator(sel).first();
    if (await tryFrameLocator(frame)) {
      return true;
    }
  }

  // Fallback: iterate Playwright Frame objects from page.frames().
  for (const frame of page.frames()) {
    const url = typeof frame.url === 'function' ? frame.url() : String(frame.url ?? '');
    if (!url.includes('razorpay.com') || url.includes('checkout.js')) {
      continue;
    }
    const fl = page.frameLocator(`iframe[src="${url}"]`).first();
    if (await tryFrameLocator(fl)) {
      return true;
    }
  }

  return false;
}

function validateApiOrder(timeline) {
  const short = (e) => e.url.replace(API_BASE, '').replace(/\?.*$/, '');
  const idx = (pred) => timeline.findIndex(pred);
  const issues = [];

  const resolveCalls = timeline.filter((e) => e.method === 'GET' && e.url.includes('/qr/') && e.url.includes('/resolve'));
  if (resolveCalls.length !== 1) {
    issues.push(`resolve count ${resolveCalls.length} (expected 1)`);
  }

  const legalAuto = timeline.filter(
    (e) => e.method === 'GET' && e.url.includes('/legal/documents'),
  );
  if (legalAuto.length === 0) {
    issues.push('legal documents never fetched (open Privacy/Terms before OTP)');
  }

  const attachIdx = idx((e) => e.method === 'POST' && e.url.includes('/attach'));
  const plansIdx = idx((e) => e.method === 'GET' && short(e).endsWith('/v1/plans'));
  const lookupIdx = idx((e) => e.method === 'GET' && e.url.includes('/vehicles/lookup'));
  const createIdx = idx((e) => e.method === 'POST' && short(e).endsWith('/v1/orders'));
  const cartIdx = idx((e) => e.method === 'POST' && short(e).endsWith('/v1/cart'));
  const payIdx = idx((e) => e.method === 'POST' && e.url.includes('/pay'));
  const paymentPollIdx = idx((e) => e.method === 'GET' && e.url.includes('/payment'));
  const vehicleDetailIdx = idx(
    (e) => e.method === 'GET' && /\/v1\/vehicles\/[0-9a-f-]{36}$/i.test(short(e)),
  );
  const vehiclesListIdx = idx(
    (e) => e.method === 'GET' && short(e) === '/v1/vehicles',
  );

  if (lookupIdx < 0) issues.push('missing GET /vehicles/lookup');
  if (attachIdx < 0) issues.push('missing POST /attach');
  if (plansIdx < 0) issues.push('missing GET /plans');
  if (attachIdx >= 0 && plansIdx >= 0 && attachIdx > plansIdx) {
    issues.push('attach must run before GET /plans');
  }
  if (lookupIdx >= 0 && attachIdx >= 0 && lookupIdx > attachIdx) {
    issues.push('lookup must run before attach');
  }
  if (createIdx >= 0 && payIdx >= 0 && createIdx > payIdx) {
    issues.push('POST /orders must run before POST /pay');
  }
  if (cartIdx >= 0 && createIdx >= 0 && cartIdx > createIdx) {
    issues.push('POST /cart must run before POST /orders');
  }
  if (cartIdx < 0) {
    issues.push('missing POST /v1/cart');
  }
  if (payIdx >= 0 && paymentPollIdx >= 0 && payIdx > paymentPollIdx) {
    issues.push('POST /pay must run before GET /payment poll');
  }
  if (vehicleDetailIdx >= 0 && vehiclesListIdx >= 0 && vehicleDetailIdx > vehiclesListIdx) {
    issues.push('GET /vehicles/{id} must run before GET /vehicles');
  }

  return { issues, attachIdx, plansIdx, cartIdx, vehicleDetailIdx, vehiclesListIdx };
}

const ONBOARDING = (segment) =>
  `${BASE}/onboarding/${encodeURIComponent(QR_CODE)}${segment.startsWith('/') ? segment : `/${segment}`}`;

async function main() {
  const browser = await chromium.launch({
    headless: !HEADED,
    slowMo: HEADED ? 100 : 0,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Fresh journey — avoid stale checkout cache from prior runs.
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (
      text.includes('[poll]') ||
      text.includes('[orders]') ||
      text.includes('[attach]') ||
      text.includes('[R03]') ||
      text.includes('[razorpay]') ||
      text.includes('[vehicles]') ||
      text.includes('razorpay_handler')
    ) {
      consoleLogs.push(text);
      console.log('[console]', text);
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (!isTrackedApi(url)) {
      return;
    }
    const request = response.request();
    let requestBody = null;
    try {
      requestBody = request.postDataJSON();
    } catch {
      requestBody = request.postData()?.slice(0, 2000) ?? null;
    }
    const responseBody = await parseResponseBody(response);
    const headers = {};
    for (const h of ['authorization', 'idempotency-key', 'content-type']) {
      const v = request.headers()[h];
      if (v) {
        headers[h] = h === 'authorization' ? `${v.slice(0, 20)}…` : v;
      }
    }
    order += 1;
    const entry = {
      order,
      method: request.method(),
      url,
      status: response.status(),
      headers,
      requestBody,
      responseBody,
    };
    timeline.push(entry);
    const short = url.replace(API_BASE, '');
    console.log(`[net ${order}] ${request.method()} ${response.status()} ${short}`);
  });

  // 1. Open mobile auth with qr_code (URL-first QR source; no FlowEntry resolve)
  await page.goto(`${BASE}/q/${encodeURIComponent(QR_CODE)}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.waitForTimeout(1000);

  // Legal docs only on Privacy/Terms click
  const privacyLink = page.getByRole('button', { name: /privacy policy/i }).or(page.getByText(/privacy policy/i));
  if (await privacyLink.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await privacyLink.first().click();
    await page.waitForURL(/legal\/privacy/, { timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.goBack({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  }

  await page.getByLabel('Mobile number').fill(PHONE);
  await acceptConsent(page);
  await clickFooterCta(page, /get otp/i);

  // OTP
  await page.waitForURL(/\/onboarding\/[^/]+\/otp/, { timeout: 30000 });
  await fillOtpCells(page, OTP);
  await page.waitForTimeout(2000);

  // Wait for profile (vehicle owner) or purchase vehicle step
  await page.waitForURL(/\/onboarding\/[^/]+\/(profile|vehicle)/, { timeout: 60000 });

  if (page.url().includes('/profile')) {
    await page.getByRole('textbox').first().fill(OWNER);
    await clickFooterCta(page, /add my name|continue/i);
    await page.waitForURL(/\/onboarding\/[^/]+\/vehicle/, { timeout: 30000 });
  }

  // Journey id must be in URL — not localStorage
  const journeyInUrl = await page.evaluate(() => {
    const m = window.location.pathname.match(/\/onboarding\/([^/]+)/);
    return m?.[1] ?? null;
  });
  console.log('[url] journey id in path =', journeyInUrl);
  if (!journeyInUrl) {
    throw new Error('Expected journey id in onboarding URL path');
  }

  // R03 vehicle
  if (!page.url().includes('/vehicle')) {
    await page.goto(ONBOARDING('/vehicle'), { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(2000);

  await page.getByLabel('Vehicle registration plate').fill(PLATE);
  await clickFooterCta(page, /fetch|vahan/i);
  await page.waitForURL(/vehicle-confirmation|vehicle-lookup-failed/, { timeout: 60000 });

  if (page.url().includes('r04b')) {
    throw new Error(`Vehicle lookup failed for plate ${PLATE}`);
  }

  await clickFooterCta(page, /looks right/i);
  await page.waitForURL(/r06/, { timeout: 30000 });

  // R06 plan — footer is "Choose {plan}"
  await clickFooterCta(page, /choose/i);
  await page.waitForURL(/r07|r08/, { timeout: 20000 });

  // R07 rider — skip to summary when shown
  if (page.url().includes('r07')) {
    const skip = page.locator('.ob-purchase-skip-link');
    if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) {
      await skip.click();
    } else {
      await clickFooterCta(page, /continue|add/i);
    }
    await page.waitForURL(/r08/, { timeout: 20000 });
  }

  // R08 Pay securely
  await clickFooterCta(page, /pay securely|pay ₹/i);
  await page.waitForURL(/r09/, { timeout: 30000 });

  const razorpayOk =
    (await completeRazorpayNetbanking(page)) || (await completeRazorpay(page));

  await page
    .waitForURL(/payment-success|payment-failed|payment-unconfirmed|payment-still-confirming/, {
      timeout: 180000,
    })
    .catch(() => undefined);

  if (!razorpayOk) {
    console.warn('[razorpay] automation uncertain — waiting for payment terminal screen');
  }

  const terminalDeadline = Date.now() + 120000;
  while (Date.now() < terminalDeadline) {
    const url = page.url();
    if (
      url.includes('payment-success') ||
      url.includes('payment-unconfirmed') ||
      url.includes('payment-failed')
    ) {
      break;
    }
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(3000);

  const finalUrl = page.url();
  const orderCheck = validateApiOrder(timeline);
  const report = {
    ranAt: new Date().toISOString(),
    config: { BASE, API_BASE, QR_CODE, PLATE, PHONE, HEADED },
    finalUrl,
    razorpayAutomated: razorpayOk,
    orderValidation: orderCheck,
    consoleLogs,
    timeline,
    summary: {
      resolve: timeline.filter((e) => e.url.includes('/resolve')),
      legal: timeline.filter((e) => e.url.includes('/legal/documents')),
      lookup: timeline.filter((e) => e.url.includes('/vehicles/lookup')),
      attach: timeline.filter((e) => e.method === 'POST' && e.url.includes('/attach')),
      plans: timeline.filter((e) => e.method === 'GET' && e.url.includes('/plans')),
      createOrder: timeline.filter((e) => e.method === 'POST' && /\/orders$/.test(e.url.replace(/\?.*$/, ''))),
      payOrder: timeline.filter((e) => e.method === 'POST' && e.url.includes('/pay')),
      paymentPoll: timeline.filter((e) => e.method === 'GET' && e.url.includes('/payment')),
      vehicleDetail: timeline.filter((e) => /\/v1\/vehicles\/[0-9a-f-]{36}$/i.test(e.url.replace(/\?.*$/, ''))),
      vehiclesList: timeline.filter((e) => e.method === 'GET' && e.url.replace(/\?.*$/, '').endsWith('/v1/vehicles')),
      auth: timeline.filter((e) => e.url.includes('/auth/')),
      consents: timeline.filter((e) => e.url.includes('/me/consents')),
      profile: timeline.filter((e) => e.method === 'PATCH' && e.url.includes('/profile')),
    },
  };

  const outPath = join(__dirname, 'e2e-audit-report.json');
  const screenshotPath = join(__dirname, 'e2e-network-screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log('\n========== E2E AUDIT SUMMARY ==========');
  console.log('Final URL:', finalUrl);
  console.log('resolve:', report.summary.resolve.length);
  console.log('legal:', report.summary.legal.length);
  console.log('lookup:', report.summary.lookup.length);
  console.log('attach:', report.summary.attach.length);
  console.log('plans:', report.summary.plans.length);
  console.log('POST /orders:', report.summary.createOrder.length);
  console.log('POST /pay:', report.summary.payOrder.length);
  console.log('GET /payment:', report.summary.paymentPoll.length);
  console.log('GET /vehicles/{id}:', report.summary.vehicleDetail.length);
  console.log('GET /vehicles:', report.summary.vehiclesList.length);
  if (orderCheck.issues.length) {
    console.log('ORDER ISSUES:', orderCheck.issues.join('; '));
  }
  console.log('Screenshot:', screenshotPath);

  await browser.close();

  const flowOk =
    orderCheck.issues.length === 0 &&
    report.summary.resolve.length === 1 &&
    report.summary.lookup.length > 0 &&
    report.summary.attach.length > 0 &&
    report.summary.plans.length > 0 &&
    report.summary.createOrder.length > 0 &&
    report.summary.payOrder.length > 0 &&
    report.summary.paymentPoll.length > 0 &&
    finalUrl.includes('payment-success');

  process.exit(flowOk ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
