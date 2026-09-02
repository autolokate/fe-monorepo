#!/usr/bin/env node
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { DEV_SCREENS, PWA_SCREENS, THEMES, VIEWPORTS } from './visual-truth-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const OUT_DIR = path.join(ROOT, 'docs/visual-truth/screens');
const BASE_URL = process.env.VISUAL_TRUTH_BASE_URL ?? 'http://127.0.0.1:5199';
const THEME_KEY = 'al-qr-theme';

/** Post-ready settle time before screenshot (ms) — async data / enter animations */
const SCREEN_SETTLE_MS = {
  'prepaid-welcome': 2200,
  'b2b2c-plan-only': 2200,
  'b2b2c-plan-rider': 2200,
  completed: 300,
};

function settleMs(screenId) {
  return SCREEN_SETTLE_MS[screenId] ?? 150;
}

function slug(parts) {
  return parts.filter(Boolean).join('__');
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function captureDev(browser, screen, theme, width, filePath) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });
  const url = new URL(BASE_URL);
  url.searchParams.set('dev', '1');
  url.searchParams.set('capture', '1');
  url.searchParams.set('screen', screen.id);
  url.searchParams.set('state', screen.state);
  url.searchParams.set('theme', theme);
  url.searchParams.set('width', String(width));

  await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForFunction(
    ({ expectedScreen, expectedState, expectedTheme, expectedWidth }) =>
      document.body.dataset.devCaptureReady === 'true' &&
      document.body.dataset.devScreen === expectedScreen &&
      document.body.dataset.devState === expectedState &&
      document.body.dataset.devTheme === expectedTheme &&
      document.body.dataset.devWidth === String(expectedWidth),
    {
      expectedScreen: screen.id,
      expectedState: screen.state,
      expectedTheme: theme,
      expectedWidth: width,
    },
    { timeout: 15000 },
  );
  const delay = settleMs(screen.id);
  if (delay > 0) {
    await page.waitForTimeout(delay);
  }
  await page.locator('[data-dev-frame]').screenshot({ path: filePath, timeout: 15000 });
  await page.close();
}

async function capturePwa(browser, screen, theme, width, filePath) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
      document.documentElement.setAttribute('data-theme', value);
    },
    { key: THEME_KEY, value: theme },
  );
  await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForSelector('.pwa-scan-shell, .pwa-emergency-screen, .ob-auth-step-shell, #root', {
    timeout: 15000,
  });
  await page.waitForTimeout(250);
  const target = page.locator('.pwa-scan-shell, .pwa-emergency-screen').first();
  if (await target.count()) {
    await target.screenshot({ path: filePath, timeout: 15000 });
  } else {
    await page.locator('#root').screenshot({ path: filePath, timeout: 15000 });
  }
  await page.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = [];
  const browser = await chromium.launch({ headless: true });
  let done = 0;

  for (const theme of THEMES) {
    for (const width of VIEWPORTS) {
      for (const screen of DEV_SCREENS) {
        const fileName = `${slug(['dev', screen.flow, screen.id, screen.state, theme, width])}.png`;
        const filePath = path.join(OUT_DIR, fileName);
        if (await fileExists(filePath)) {
          manifest.push({
            kind: 'dev',
            screenId: screen.id,
            state: screen.state,
            flow: screen.flow,
            figma: screen.figma,
            theme,
            width,
            screenshot: `docs/visual-truth/screens/${fileName}`,
            captured: true,
            skipped: true,
          });
          continue;
        }
        try {
          await captureDev(browser, screen, theme, width, filePath);
          manifest.push({
            kind: 'dev',
            screenId: screen.id,
            state: screen.state,
            flow: screen.flow,
            figma: screen.figma,
            theme,
            width,
            screenshot: `docs/visual-truth/screens/${fileName}`,
            captured: true,
          });
          done += 1;
          if (done % 25 === 0) console.log(`dev ${done} new captures…`);
        } catch (error) {
          manifest.push({
            kind: 'dev',
            screenId: screen.id,
            state: screen.state,
            flow: screen.flow,
            figma: screen.figma,
            theme,
            width,
            captured: false,
            error: String(error),
          });
        }
      }

      for (const screen of PWA_SCREENS) {
        const fileName = `${slug(['pwa', screen.id, theme, width])}.png`;
        const filePath = path.join(OUT_DIR, fileName);
        if (await fileExists(filePath)) {
          manifest.push({
            kind: 'pwa',
            screenId: screen.id,
            flow: screen.flow,
            figma: screen.figma,
            theme,
            width,
            screenshot: `docs/visual-truth/screens/${fileName}`,
            captured: true,
            skipped: true,
          });
          continue;
        }
        try {
          await capturePwa(browser, screen, theme, width, filePath);
          manifest.push({
            kind: 'pwa',
            screenId: screen.id,
            flow: screen.flow,
            figma: screen.figma,
            theme,
            width,
            screenshot: `docs/visual-truth/screens/${fileName}`,
            captured: true,
          });
          done += 1;
        } catch (error) {
          manifest.push({
            kind: 'pwa',
            screenId: screen.id,
            flow: screen.flow,
            figma: screen.figma,
            theme,
            width,
            captured: false,
            error: String(error),
          });
        }
      }
      console.log(`finished ${theme}/${width}`);
    }
  }

  await browser.close();
  const manifestPath = path.join(ROOT, 'docs/visual-truth/capture-manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  const captured = manifest.filter((e) => e.captured).length;
  const failed = manifest.filter((e) => !e.captured).length;
  console.log(`Done: ${captured} captured, ${failed} failed, ${done} new this run`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
