/**
 * Hermetic browser test of the FID registration bridge (apps/qr firebase-messaging.ts + device-service.ts).
 *
 * Self-contained: it boots its own Vite dev server (vite.fid.config.mjs, which swaps `firebase/*` for a
 * controllable fake) and needs NO api server and NO database. A fake token pair is seeded into
 * sessionStorage so `getTokenManager().hasSession()` is true, and `POST/DELETE /v1/devices/token` are
 * intercepted with Playwright `page.route()` — the intercepted request bodies are the assertions.
 *
 *   A  fast FID  -> uploaded once; register() called once despite StrictMode; onRegistered subscribed once
 *   B  late FID  -> arrives AFTER the 10s bounded wait: provider returns null and nothing uploads at the
 *                   timeout, yet the late FID STILL uploads (logged fcm_fid_late).            <- the regression
 *   C  rotation  -> a new FID uploads
 *   D  never     -> no upload; no hang
 *   E  retired   -> onUnregistered fires a DELETE carrying the retired FID
 *
 * Pre-fix, the onRegistered callback resolved the waiter and then branched
 * `if (isRotation) ... else log fcm_fid_ready`, so a late FID was only cached and never uploaded —
 * case B fails on that code and passes on the current bridge.
 */
/* global window, document */
import { chromium } from 'playwright';
import { createServer } from 'vite';

const CONFIG = new URL('./vite.fid.config.mjs', import.meta.url).pathname;
const TIMEOUT_MS = 10_000; // FID_WAIT_TIMEOUT_MS in firebase-messaging.ts

// Injected as VITE_-prefixed process.env so the config's loadEnv exposes them; Firebase is faked so
// the values are irrelevant, only their presence (readFirebaseWebConfig requires all six).
// The API base points at a dead port: `page.route()` matches by path regardless of host, so the
// device-token calls are fulfilled in-browser and the harness never depends on a live backend.
Object.assign(process.env, {
  VITE_API_BASE_URL: 'http://127.0.0.1:3971',
  VITE_ENVIRONMENT: 'development',
  VITE_ENABLE_LOGS: 'true',
  VITE_FIREBASE_API_KEY: 'fid-test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'fid-test.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'fid-test',
  VITE_FIREBASE_STORAGE_BUCKET: 'fid-test.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
  VITE_FIREBASE_APP_ID: '1:000000000000:web:fidtest',
  VITE_FIREBASE_VAPID_KEY: 'FID-TEST-VAPID-KEY',
});

// Opaque, non-PII stand-ins — enough for hasSession() (accessToken + refreshToken present, unexpired).
const SEED_TOKENS = {
  accessToken: 'fid-test-access',
  refreshToken: 'fid-test-refresh',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  userId: 'fid-test-user',
};

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'} ${name}${detail ? `  — ${detail}` : ''}`);
};

const fidsOf = (posts) => [...new Set(posts.map((p) => p.body.fcmToken))];

async function boot(browser, appUrl, tokens, fcmConfig) {
  const context = await browser.newContext();
  await context.grantPermissions(['notifications'], { origin: new URL(appUrl).origin });
  await context.addInitScript(
    ([key, value, cfg]) => {
      sessionStorage.setItem(key, JSON.stringify(value));
      window.__fcmConfig = cfg;
    },
    ['al-auth-tokens-v1', tokens, fcmConfig],
  );
  const page = await context.newPage();
  const posts = [];
  const deletes = [];
  const logs = [];
  const t0 = { v: 0 };

  page.on('console', (m) => {
    const t = m.text();
    if (/fcm_|register_|device_/.test(t)) {
      // Strip whatever namespace deviceLogger is configured with, so renaming it can't
      // silently break every assertion below.
      logs.push({ atMs: Date.now() - t0.v, t: t.replace(/^\[[^\]]+\]\s*/, '') });
    }
  });

  // No backend is running: fulfil the device-token endpoint ourselves and record the request bodies.
  await page.route('**/v1/devices/token', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      posts.push({ atMs: Date.now() - t0.v, body: JSON.parse(req.postData() ?? '{}') });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { deviceId: 'fid-test-device' },
          meta: { requestId: 'fid-test-req', correlationId: 'fid-test-corr' },
        }),
      });
      return;
    }
    if (req.method() === 'DELETE') {
      deletes.push({ atMs: Date.now() - t0.v, body: JSON.parse(req.postData() ?? '{}') });
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.continue();
  });

  t0.v = Date.now();
  await page.goto(appUrl, { waitUntil: 'load', timeout: 60_000 }); // the app boots and registers the device itself
  const close = async () => {
    try {
      await context.close();
    } catch {
      /* teardown races are not the thing under test */
    }
  };
  return { context, page, posts, deletes, logs, close };
}

const run = async (browser, appUrl) => {
  console.log('\n[A] FID arrives before the bounded wait');
  {
    const { page, posts, logs, close } = await boot(browser, appUrl, SEED_TOKENS, { fidDelayMs: 50, fid: 'FAKE-FID-A1' });
    await page.waitForTimeout(3000);
    const snap = await page.evaluate(() => window.__fcm.snapshot());
    check('device registered with the FID', posts.length >= 1 && fidsOf(posts).join() === 'FAKE-FID-A1', `${posts.length} post(s), fids=${fidsOf(posts)}`);
    check('register() called once despite repeated registerDevice()', snap.registerCalls === 1, JSON.stringify(snap));
    check('onRegistered subscribed exactly once', snap.onRegisteredSubscriptions === 1, JSON.stringify(snap));
    check('logged fcm_fid_ready', logs.some((l) => l.t.startsWith('fcm_fid_ready')));
    await close();
  }

  console.log(`\n[B] FID arrives at ${TIMEOUT_MS + 3000}ms — after the ${TIMEOUT_MS}ms bounded wait   <<< the regression`);
  {
    const { page, posts, logs, close } = await boot(browser, appUrl, SEED_TOKENS, { fidDelayMs: TIMEOUT_MS + 3000, fid: 'FAKE-FID-B1' });

    await page.waitForTimeout(TIMEOUT_MS + 1500); // just past the timeout, before the FID lands
    const postsAtTimeout = posts.length;
    const sawTimeout = logs.some((l) => l.t.startsWith('fcm_fid_timeout'));
    check('bounded wait fired (no hang)', sawTimeout, logs.map((l) => l.t.split(' ')[0]).join(' | '));
    check('nothing uploaded at the timeout', postsAtTimeout === 0, `${postsAtTimeout} post(s)`);

    await page.waitForTimeout(5000); // let the late FID arrive and recover
    check(
      'LATE FID STILL REACHES THE SERVER',
      posts.length >= 1 && fidsOf(posts).join() === 'FAKE-FID-B1',
      `${posts.length} post(s) at ${posts.map((p) => `${p.atMs}ms`).join(',')} fids=${fidsOf(posts)}`,
    );
    check('recovery logged as fcm_fid_late', logs.some((l) => l.t.startsWith('fcm_fid_late')), logs.map((l) => `${l.atMs}ms:${l.t.split(' ')[0]}`).join(' | '));
    check('upload happened after the timeout', posts[0]?.atMs > TIMEOUT_MS, `first post at ${posts[0]?.atMs}ms`);
    await close();
  }

  console.log('\n[C] FID rotation');
  {
    const { page, posts, logs, close } = await boot(browser, appUrl, SEED_TOKENS, { fidDelayMs: 50, fid: 'FAKE-FID-C1' });
    await page.waitForTimeout(2500);
    const before = posts.length;
    await page.evaluate(() => window.__fcm.emit('FAKE-FID-C2'));
    await page.waitForTimeout(2500);
    check('rotation uploads the new FID', posts.length > before && posts.at(-1).body.fcmToken === 'FAKE-FID-C2', `${before} -> ${posts.length} post(s), last=${posts.at(-1)?.body?.fcmToken}`);
    check('rotation logged', logs.some((l) => l.t.startsWith('fcm_fid_rotated')));
    const snap = await page.evaluate(() => window.__fcm.snapshot());
    check('no duplicate onRegistered subscription', snap.onRegisteredSubscriptions === 1, JSON.stringify(snap));
    await close();
  }

  console.log('\n[D] FID never arrives');
  {
    const { page, posts, logs, close } = await boot(browser, appUrl, SEED_TOKENS, { fidDelayMs: -1 });
    await page.waitForTimeout(TIMEOUT_MS + 3000);
    check('no upload', posts.length === 0, `${posts.length} post(s)`);
    check('timeout logged, app still alive', logs.some((l) => l.t.startsWith('fcm_fid_timeout')));
    check('page did not hang', await page.evaluate(() => document.readyState === 'complete'));
    await close();
  }

  console.log('\n[E] FID retired -> onUnregistered issues a DELETE');
  {
    const { page, posts, deletes, logs, close } = await boot(browser, appUrl, SEED_TOKENS, { fidDelayMs: 50, fid: 'FAKE-FID-E1' });
    await page.waitForTimeout(2500);
    check('device first registered with the FID', posts.length >= 1 && fidsOf(posts).join() === 'FAKE-FID-E1', `${posts.length} post(s), fids=${fidsOf(posts)}`);
    await page.evaluate(() => window.__fcm.emitUnregister('FAKE-FID-E1'));
    await page.waitForTimeout(2000);
    check('DELETE fired with the retired FID', deletes.length >= 1 && deletes.at(-1).body.fcmToken === 'FAKE-FID-E1', `${deletes.length} delete(s), body=${JSON.stringify(deletes.at(-1)?.body)}`);
    check('retirement logged as fcm_fid_unregistered', logs.some((l) => l.t.startsWith('fcm_fid_unregistered')));
    check('device_unregistered logged after the DELETE', logs.some((l) => l.t.startsWith('device_unregistered')));
    const snap = await page.evaluate(() => window.__fcm.snapshot());
    check('onUnregistered subscribed exactly once', snap.onUnregisteredSubscriptions === 1, JSON.stringify(snap));
    await close();
  }
};

const main = async () => {
  const server = await createServer({ configFile: CONFIG });
  await server.listen();
  const appUrl = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5200/';
  console.log(`FID registration harness — app served at ${appUrl}`);

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
