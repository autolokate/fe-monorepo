#!/usr/bin/env node
/** Re-capture Completed screen only — 12 screenshots (2 themes × 6 widths). */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const OUT_DIR = path.join(ROOT, 'docs/visual-truth/screens');
const BASE_URL = process.env.VISUAL_TRUTH_BASE_URL ?? 'http://127.0.0.1:5199';
const THEMES = ['dark', 'light'];
const VIEWPORTS = [320, 360, 375, 390, 393, 414];
const SETTLE_MS = 300;

function slug(parts) {
  return parts.filter(Boolean).join('__');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifestPath = path.join(ROOT, 'docs/visual-truth/capture-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  let captured = 0;

  for (const theme of THEMES) {
    for (const width of VIEWPORTS) {
      const fileName = slug(['dev', 'Completed', 'completed', 'default', theme, width]) + '.png';
      const filePath = path.join(OUT_DIR, fileName);
      const rel = `docs/visual-truth/screens/${fileName}`;

      const page = await browser.newPage();
      await page.setViewportSize({ width, height: 900 });
      const url = new URL(BASE_URL);
      url.searchParams.set('dev', '1');
      url.searchParams.set('capture', '1');
      url.searchParams.set('screen', 'completed');
      url.searchParams.set('state', 'default');
      url.searchParams.set('theme', theme);
      url.searchParams.set('width', String(width));

      await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForFunction(
        ({ expectedTheme, expectedWidth }) =>
          document.body.dataset.devCaptureReady === 'true' &&
          document.body.dataset.devScreen === 'completed' &&
          document.body.dataset.devTheme === expectedTheme &&
          document.body.dataset.devWidth === String(expectedWidth) &&
          document.body.innerText.includes('Secure is active'),
        { expectedTheme: theme, expectedWidth: width },
        { timeout: 20000 },
      );
      await page.waitForTimeout(SETTLE_MS);
      await page.locator('[data-dev-frame]').screenshot({ path: filePath, timeout: 15000 });
      await page.close();

      const entry = manifest.find(
        (e) => e.screenId === 'completed' && e.theme === theme && e.width === width,
      );
      if (entry) {
        entry.captured = true;
        entry.screenshot = rel;
        delete entry.error;
      }
      captured += 1;
      console.log('captured', rel);
    }
  }

  await browser.close();
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Done: ${captured}/12 completed captures`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
