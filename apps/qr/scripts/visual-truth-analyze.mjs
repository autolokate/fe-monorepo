#!/usr/bin/env node
/**
 * Runtime measurement pass — compares captured UI metrics against Figma anchors.
 * Evidence-only: outputs JSON with measured values, not subjective labels.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const BASE_URL = process.env.VISUAL_TRUTH_BASE_URL ?? 'http://127.0.0.1:5199';

/** Figma anchors at 393px width (Consumer App file FtHCUnE0HH586PtG5yJyG0) */
const FIGMA_ANCHORS = {
  'r07': {
    node: '186:25',
    backX: 16,
    titleGap: 8,
    bodySize: 16,
    cardPaddingY: 15,
    cardPaddingX: 16,
    cardGap: 12,
    ctaHeight: 58,
    ctaWidth: 361,
  },
  'e10-default': {
    node: '822:1980',
    backX: 16,
    titleGap: 8,
    listGap: 12,
    addRowHeight: 48,
    ctaHeight: 58,
  },
  'pwa-sos': {
    node: '848:278',
    backX: 16,
    titleY: 110,
    sosDisc: 200,
    locationChipFillDark: '#1A1A1A',
  },
  'a1-empty': {
    node: '102:268',
    backX: 16,
    contentPaddingX: 16,
    ctaHeight: 58,
  },
};

const MEASURE_TARGETS = [
  { key: 'r07', url: `${BASE_URL}/?dev=1&capture=1&screen=r07&state=default&width=393` },
  { key: 'e10-default', url: `${BASE_URL}/?dev=1&capture=1&screen=e10&state=default&width=393` },
  { key: 'a1-empty', url: `${BASE_URL}/?dev=1&capture=1&screen=a1-empty&state=default&width=393` },
  { key: 'pwa-sos', url: `${BASE_URL}/pwa/scan/sos` },
];

async function measurePage(page, theme) {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('al-qr-theme', t);
  }, theme);
  await page.waitForTimeout(200);

  return page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        fontSize: cs.fontSize,
        textAlign: cs.textAlign,
      };
    };

    return {
      back: rect('.ob-shell__back, .ob-auth-shell__back, .pwa-scan-shell__back, [class*="back"]'),
      primaryButton: rect('.al-button--primary, .ob-shell__footer .al-button, .pwa-scan-shell__footer .al-button'),
      checkbox: rect('.al-checkbox, input[type="checkbox"]'),
      addRiderRow: rect('.ob-add-contact-row, .ob-contact-card-list button, .ob-add-contact-row button'),
      locationChip: rect('.pwa-emergency-screen__location-chip'),
      frameWidth: document.querySelector('[data-dev-frame]')?.getBoundingClientRect().width ?? window.innerWidth,
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const target of MEASURE_TARGETS) {
    for (const theme of ['dark', 'light']) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 393, height: 900 });
      await page.addInitScript(
        ({ key, value }) => {
          window.localStorage.setItem(key, value);
          document.documentElement.setAttribute('data-theme', value);
        },
        { key: 'al-qr-theme', value: theme },
      );
      const url = `${target.url}${target.url.includes('?') ? '&' : '?'}theme=${theme}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      if (target.key !== 'pwa-sos') {
        await page.waitForSelector('[data-dev-frame], .pwa-scan-shell, .ob-auth-step-shell', {
          timeout: 12000,
        });
      } else {
        await page.waitForSelector('.pwa-emergency-screen, .al-sos-hold', { timeout: 12000 });
      }

      const measured = await measurePage(page, theme);
      const anchor = FIGMA_ANCHORS[target.key];
      const drift = [];

      if (measured.back && anchor?.backX !== undefined) {
        const delta = Math.abs(measured.back.x - anchor.backX);
        if (delta > 2) drift.push({ field: 'backX', measured: measured.back.x, figma: anchor.backX, delta });
      }
      if (measured.primaryButton && anchor?.ctaHeight) {
        const delta = Math.abs(measured.primaryButton.height - anchor.ctaHeight);
        if (delta > 2) drift.push({ field: 'ctaHeight', measured: measured.primaryButton.height, figma: anchor.ctaHeight, delta });
      }
      if (target.key === 'e10-default' && theme === 'light') {
        if (!measured.addRiderRow) {
          drift.push({ field: 'addRiderRow', measured: null, figma: 'visible', delta: null, severity: 'P0' });
        }
      }
      if (target.key === 'pwa-sos' && theme === 'light' && measured.locationChip) {
        if (measured.locationChip.backgroundColor.includes('26, 26, 26') || measured.locationChip.backgroundColor.includes('rgb(26, 26, 26)')) {
          drift.push({
            field: 'locationChipBackground',
            measured: measured.locationChip.backgroundColor,
            figma: 'surface token (not #1A1A1A)',
            severity: 'P0',
          });
        }
      }

      results.push({
        target: target.key,
        theme,
        route: target.url,
        figmaNode: anchor?.node ?? null,
        measured,
        drift,
      });
      await page.close();
    }
  }

  await browser.close();
  const outPath = path.join(ROOT, 'docs/visual-truth/measurements.json');
  await writeFile(outPath, JSON.stringify(results, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
