#!/usr/bin/env node
/**
 * Verifies localStorage qr_code is read on R03 and triggers GET /v1/qr/{code}/resolve.
 * Seeds journey auth state so R03 mounts without OTP.
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:5173';
const QR_CODE = process.env.VERIFY_QR_CODE ?? 'ALK-SCAN00015';

const journeyState = {
  selectedFlow: 'purchase',
  authStatus: 'AUTH_COMPLETED',
  session: {
    vehicle: { plate: '', fetchStatus: 'idle' },
    purchase: { paymentStatus: 'idle', checkoutReady: false },
  },
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[R03]') || text.includes('[resolve]') || text.includes('[storage]')) {
      consoleLogs.push(text);
    }
  });

  const resolveRequests = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/v1/qr/') && url.includes('/resolve')) {
      resolveRequests.push({ method: req.method(), url });
    }
  });

  await page.goto(`${BASE}/journey`, { waitUntil: 'domcontentloaded' });

  await page.evaluate(
    ({ journeyState, qr }) => {
      window.localStorage.setItem('qr_code', qr);
      window.localStorage.setItem('al-selected-flow', 'purchase');
      window.sessionStorage.setItem('al-journey-v1', JSON.stringify(journeyState));
    },
    { journeyState, qr: QR_CODE },
  );

  await page.goto(`${BASE}/vehicle`, { waitUntil: 'networkidle' });

  // Allow resolve effect to finish
  await page.waitForTimeout(3000);

  const storage = await page.evaluate(() => ({
    localStorage_qr_code: window.localStorage.getItem('qr_code'),
    sessionStorage_qr_code: window.sessionStorage.getItem('qr_code'),
  }));

  console.log('\n=== Storage after R03 ===');
  console.log(JSON.stringify(storage, null, 2));

  console.log('\n=== Console (R03 / resolve / storage) ===');
  for (const line of consoleLogs) {
    console.log(line);
  }

  console.log('\n=== Network: resolve requests ===');
  for (const req of resolveRequests) {
    console.log(`${req.method} ${req.url}`);
  }

  const ok =
    storage.localStorage_qr_code === QR_CODE &&
    resolveRequests.some((r) => r.url.includes(encodeURIComponent(QR_CODE)) || r.url.includes(QR_CODE));

  await browser.close();
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
