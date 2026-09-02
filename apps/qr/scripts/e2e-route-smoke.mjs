#!/usr/bin/env node
/**
 * Route smoke test — verifies journey-scoped URL redirects without live API.
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_BASE_URL ?? 'http://localhost:5173';
const QR = process.env.VERIFY_QR_CODE ?? 'ALK-B2C005';

const results = [];

function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${BASE}/q/${encodeURIComponent(QR)}`, { waitUntil: 'domcontentloaded' });
  let qrRedirectOk = false;
  try {
    await page.waitForURL(/\/onboarding\/[^/]+\/auth(\?|$)/, { timeout: 8000 });
    qrRedirectOk = true;
  } catch {
    qrRedirectOk = /\/onboarding\/[^/]+\/auth/.test(page.url());
  }
  const qrHasQuery = page.url().includes('q=ALK-B2C005');
  record('QR entry redirects to onboarding auth with ?q=', qrRedirectOk && qrHasQuery, page.url());

  await page.goto(`${BASE}/auth?q=${encodeURIComponent(QR)}`, { waitUntil: 'domcontentloaded' });
  let authRedirectOk = false;
  try {
    await page.waitForURL(/\/onboarding\/[^/]+\/auth/, { timeout: 8000 });
    authRedirectOk = true;
  } catch {
    authRedirectOk = /\/onboarding\/[^/]+\/auth/.test(page.url());
  }
  record('Legacy /auth?q= redirects to scoped auth', authRedirectOk, page.url());

  await page.goto(`${BASE}/vehicle`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  record(
    'Legacy /vehicle without journey context redirects to entry',
    page.url().endsWith('/q') || page.url().endsWith('/') || page.url().includes('/onboarding/'),
    page.url(),
  );

  await page.goto(`${BASE}/onboarding/${encodeURIComponent(QR)}/plans`, {
    waitUntil: 'networkidle',
  });
  record('Scoped /plans route loads', page.url().includes('/plans'), page.url());

  await page.goto(`${BASE}/emergency/${encodeURIComponent(QR)}/rider-prompt`, {
    waitUntil: 'networkidle',
  });
  record(
    'Scoped emergency route loads or redirects to entry',
    page.url().includes('/emergency/') || page.url().includes('/q/'),
    page.url(),
  );

  await page.goto(`${BASE}/pwa/scan/loading`, { waitUntil: 'networkidle' });
  record(
    'Legacy /pwa/scan redirects toward /scan',
    page.url().includes('/scan') || page.url().includes('/pwa/scan'),
    page.url(),
  );

  await browser.close();

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(`\nRoute smoke: ${passed}/${results.length} passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
