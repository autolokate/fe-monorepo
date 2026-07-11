#!/usr/bin/env node
/**
 * Payment-flow evidence collector — full headers, payloads, orderId trace, every poll.
 * Output: scripts/e2e-payment-evidence.json
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
const QR_CODE = process.env.VERIFY_QR_CODE ?? 'ALK-B2C002';
const PLATE = process.env.VERIFY_PLATE ?? 'DL7CQ1939';
const PHONE = process.env.VERIFY_PHONE ?? '9876543210';
const OTP = process.env.VERIFY_OTP ?? '123456';
const RAZORPAY_CONTACT = process.env.VERIFY_RAZORPAY_PHONE ?? '9898293940';
const OWNER = process.env.VERIFY_OWNER_NAME ?? 'Kapil Test';
const HEADED = process.env.VERIFY_HEADED !== '0';

const timeline = [];
const consoleLogs = [];
const pollResponses = [];
const orderIdTrace = { created: null, payUrl: null, pollUrls: [] };
let netOrder = 0;

function isTrackedApi(url) {
  return url.startsWith(API_BASE) && url.includes('/v1/');
}

function extractOrderIdFromUrl(url) {
  const m = url.match(/\/v1\/orders\/([0-9a-f-]{36})(?:\/|$)/i);
  return m ? m[1] : null;
}

async function parseResponseBody(response) {
  try {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  } catch {
    return null;
  }
}

function collectHeaders(requestOrResponse, isRequest) {
  const raw = isRequest ? requestOrResponse.headers() : requestOrResponse.headers();
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k.toLowerCase()] = k === 'authorization' ? `${String(v).slice(0, 30)}…` : v;
  }
  return out;
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
  await page.waitForFunction(
    (re) => {
      const buttons = document.querySelectorAll('.ob-auth-shell__cta, .ob-step-chrome__cta');
      for (const b of buttons) {
        if (new RegExp(re, 'i').test(b.textContent ?? '') && !b.disabled) return true;
      }
      return false;
    },
    labelRe.source,
    { timeout: 20000 },
  );
  await btn.click({ timeout: 15000 });
}

async function tryFrameNetbanking(page, frame) {
  // Dismiss Razorpay intro / offer overlays if present
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

  // Pick first listed test bank
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

  // Razorpay test bank success page (may be nested frame)
  for (const f of page.frames()) {
    const success = f.getByText(/success/i).first();
    if (await success.isVisible({ timeout: 5000 }).catch(() => false)) {
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
    if ((await page.locator(sel).count()) === 0) continue;
    const frame = page.frameLocator(sel).first();
    if (await tryFrameNetbanking(page, frame)) return true;
  }
  for (const sel of selectors) {
    if ((await page.locator(sel).count()) === 0) continue;
    const frame = page.frameLocator(sel).first();
    await tryFrameNetbanking(page, frame);
  }
  return false;
}

async function readFrontendState(page) {
  return page.evaluate(() => {
    const keys = Object.keys(sessionStorage);
    const ss = {};
    for (const k of keys) {
      if (k.includes('journey') || k.includes('purchase') || k.includes('checkout') || k.includes('order')) {
        try {
          ss[k] = JSON.parse(sessionStorage.getItem(k) ?? 'null');
        } catch {
          ss[k] = sessionStorage.getItem(k);
        }
      }
    }
    return {
      url: window.location.href,
      localStorage_qr_code: localStorage.getItem('qr_code'),
      sessionStorage: ss,
      rzpEvidence: window.__rzpHandlerEvidence ?? null,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 80 : 0 });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (text.includes('[EVIDENCE]') || text.includes('[poll]') || text.includes('[razorpay]') || text.includes('[orders]')) {
      console.log('[browser]', text);
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (!isTrackedApi(url)) return;

    const request = response.request();
    const method = request.method();
    let requestBody = null;
    try {
      requestBody = request.postDataJSON();
    } catch {
      requestBody = request.postData() ?? null;
    }
    const responseBody = await parseResponseBody(response);
    const reqHeaders = collectHeaders(request, true);
    const resHeaders = collectHeaders(response, false);

    netOrder += 1;
    const entry = {
      order: netOrder,
      method,
      url,
      status: response.status(),
      requestHeaders: reqHeaders,
      responseHeaders: resHeaders,
      requestBody,
      responseBody,
    };
    timeline.push(entry);

    if (method === 'POST' && /\/v1\/orders$/.test(url.replace(/\?.*$/, ''))) {
      const oid = responseBody?.data?.orderId ?? null;
      orderIdTrace.created = oid;
      console.log(`[EVIDENCE] POST /orders → orderId=${oid}`);
    }
    if (method === 'POST' && url.includes('/pay')) {
      orderIdTrace.payUrl = extractOrderIdFromUrl(url);
      console.log(`[EVIDENCE] POST /pay → orderId from URL=${orderIdTrace.payUrl}`);
      console.log('[EVIDENCE] pay full response:', JSON.stringify(responseBody, null, 2));
    }
    if (method === 'GET' && url.includes('/payment')) {
      const pollOid = extractOrderIdFromUrl(url);
      pollResponses.push({
        pollNumber: pollResponses.length + 1,
        orderIdFromUrl: pollOid,
        status: response.status(),
        responseBody,
      });
      console.log(`[EVIDENCE] Poll #${pollResponses.length} orderId=${pollOid}`, JSON.stringify(responseBody));
    }

    console.log(`[net ${netOrder}] ${method} ${response.status()} ${url.replace(API_BASE, '')}`);
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto(`${BASE}/journey?code=${encodeURIComponent(QR_CODE)}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.waitForTimeout(2000);

  if (!page.url().includes('/auth/mobile')) {
    await page.goto(`${BASE}/scan`, { waitUntil: 'networkidle' });
  }
  await page.getByLabel('Mobile number').fill(PHONE);
  await acceptConsent(page);
  await clickFooterCta(page, /get otp/i);
  await page.waitForURL(/auth\/otp/, { timeout: 30000 });
  await fillOtpCells(page, OTP);
  await page.waitForTimeout(2000);
  await page.waitForURL(/vehicle-owner|purchase/, { timeout: 60000 });

  if (page.url().includes('vehicle-owner')) {
    await page.getByRole('textbox').first().fill(OWNER);
    await clickFooterCta(page, /add my name|continue/i);
    await page.waitForURL(/purchase/, { timeout: 30000 });
  }

  if (!page.url().includes('r03-vehicle')) {
    await page.goto(`${BASE}/vehicle`, { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(1500);
  await page.getByLabel('Vehicle registration plate').fill(PLATE);
  await clickFooterCta(page, /fetch|vahan/i);
  await page.waitForURL(/vehicle-confirmation|vehicle-lookup-failed/, { timeout: 60000 });
  if (page.url().includes('r04b')) throw new Error(`Vehicle lookup failed for ${PLATE}`);

  await clickFooterCta(page, /looks right/i);
  await page.waitForURL(/r06/, { timeout: 20000 });
  await clickFooterCta(page, /choose/i);
  await page.waitForURL(/r07/, { timeout: 20000 });
  await page.locator('.ob-purchase-skip-link').click({ timeout: 10000 });
  await page.waitForURL(/r08/, { timeout: 20000 });

  const stateBeforePay = await readFrontendState(page);
  await clickFooterCta(page, /pay securely|pay ₹/i);
  await page.waitForURL(/r09/, { timeout: 30000 });

  const razorpayOk = await completeRazorpayNetbanking(page).catch((err) => {
    console.warn('[razorpay] automation error:', String(err).slice(0, 200));
    return false;
  });
  if (!razorpayOk && HEADED) {
    console.warn('[razorpay] automation incomplete — waiting 150s for manual netbanking');
    await page.waitForTimeout(150000);
  }

  // Wait through R09 → R09b → R10c/success (poll loop up to ~2 min)
  const deadline = Date.now() + 150000;
  while (Date.now() < deadline) {
    const url = page.url();
    if (
      url.includes('payment-success') ||
      url.includes('payment-unconfirmed') ||
      url.includes('payment-failed')
    ) {
      break;
    }
    await page.waitForTimeout(3000);
  }
  await page.waitForTimeout(5000);

  const stateAfter = await readFrontendState(page);
  const rzpFromWindow = await page.evaluate(() => window.__rzpHandlerEvidence ?? null);

  const createOrderEntries = timeline.filter(
    (e) => e.method === 'POST' && /\/v1\/orders$/.test(e.url.replace(/\?.*$/, '')),
  );
  const payEntries = timeline.filter((e) => e.method === 'POST' && e.url.includes('/pay'));
  const pollOrderIds = [...new Set(pollResponses.map((p) => p.orderIdFromUrl))];

  const orderIdConsistency = {
    created: orderIdTrace.created,
    payUrlOrderId: orderIdTrace.payUrl,
    pollOrderIds,
    allMatch:
      orderIdTrace.created &&
      orderIdTrace.created === orderIdTrace.payUrl &&
      pollOrderIds.every((id) => id === orderIdTrace.created),
    duplicateCreateOrders: createOrderEntries.length,
    duplicatePayCalls: payEntries.length,
  };

  const report = {
    ranAt: new Date().toISOString(),
    config: { BASE, API_BASE, QR_CODE, PLATE, PHONE, RAZORPAY_CONTACT, HEADED },
    finalUrl: page.url(),
    razorpayAutomated: razorpayOk,
    orderIdConsistency,
    rzpHandlerEvidence: rzpFromWindow,
    stateBeforePay,
    stateAfter,
    consoleLogs: consoleLogs.map((c) => c.text),
    timeline,
    createOrder: createOrderEntries,
    payOrder: payEntries,
    pollResponses,
    frontendChecks: {
      pollingEndpoint: pollResponses[0]
        ? pollResponses[0].orderIdFromUrl
          ? `/v1/orders/${pollResponses[0].orderIdFromUrl}/payment`
          : null
        : null,
      pollCount: pollResponses.length,
      allPollsPending: pollResponses.every((p) => p.responseBody?.data?.outcome === 'PENDING'),
      paymentStatusAfter: stateAfter.sessionStorage,
    },
  };

  const outPath = join(__dirname, 'e2e-payment-evidence.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log('\n========== PAYMENT EVIDENCE SUMMARY ==========');
  console.log('Order created:', orderIdConsistency.created);
  console.log('Pay URL orderId:', orderIdConsistency.payUrlOrderId);
  console.log('Poll orderIds:', orderIdConsistency.pollOrderIds);
  console.log('All orderIds match:', orderIdConsistency.allMatch);
  console.log('POST /orders count:', orderIdConsistency.duplicateCreateOrders);
  console.log('POST /pay count:', orderIdConsistency.duplicatePayCalls);
  console.log('Poll count:', pollResponses.length);
  console.log('Razorpay handler:', JSON.stringify(rzpFromWindow));
  console.log('Final URL:', page.url());
  console.log('Report:', outPath);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
