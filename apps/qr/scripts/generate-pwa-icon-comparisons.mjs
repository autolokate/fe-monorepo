/**
 * Generates visual comparison screenshots for PWA icon audit.
 * Run: node scripts/generate-pwa-icon-comparisons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const brandMark = path.resolve(rootDir, '../../packages/brand/src/assets/al-logo-dark.svg');
const iconsDir = path.resolve(rootDir, 'public/icons');
const publicDir = path.resolve(rootDir, 'public');
const outDir = path.resolve(rootDir, '../../docs/assets/pwa-icon-audit');

const BRAND_BG = { r: 10, g: 10, b: 10, alpha: 1 };

async function loadDarkVariantMark() {
  return sharp(brandMark).ensureAlpha().png();
}

async function renderInAppReference(width = 120) {
  const height = width;
  const mark = await loadDarkVariantMark();
  const layer = await mark
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const canvas = 320;
  const left = Math.round((canvas - width) / 2);
  const top = Math.round((canvas - height) / 2);

  return sharp({
    create: { width: canvas, height: canvas, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: layer, left, top }])
    .extend({
      top: 40,
      bottom: 80,
      left: 40,
      right: 40,
      background: BRAND_BG,
    })
    .png()
    .toFile(path.join(outDir, '01-source-in-app-dark-variant.png'));
}

async function copyGeneratedPreview() {
  await sharp(path.join(iconsDir, 'icon-192.png'))
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background: BRAND_BG })
    .png()
    .toFile(path.join(outDir, '02-generated-icon-192.png'));

  await sharp(path.join(iconsDir, 'icon-512.png'))
    .resize(192, 192)
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background: BRAND_BG })
    .png()
    .toFile(path.join(outDir, '03-generated-icon-512-scaled.png'));
}

function circleMaskSvg(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`,
  );
}

async function renderAndroidLauncherPreview() {
  const iconSize = 192;
  const icon = await sharp(path.join(iconsDir, 'icon-192-maskable.png'))
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();

  const masked = await sharp(icon)
    .composite([{ input: circleMaskSvg(iconSize), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const canvas = 420;
  const grid = await sharp({
    create: { width: canvas, height: canvas, channels: 3, background: { r: 30, g: 30, b: 35 } },
  })
    .png()
    .toBuffer();

  const left = Math.round((canvas - iconSize) / 2);
  const top = Math.round((canvas - iconSize) / 2) - 20;

  await sharp(grid)
    .composite([
      {
        input: masked,
        left,
        top,
      },
    ])
    .extend({ top: 30, bottom: 50, left: 30, right: 30, background: { r: 24, g: 24, b: 28 } })
    .png()
    .toFile(path.join(outDir, '04-android-launcher-preview.png'));
}

function iosRoundedRectMask(size, radius) {
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`,
  );
}

async function renderIosHomescreenPreview() {
  const iconSize = 180;
  const icon = await sharp(path.join(publicDir, 'apple-touch-icon.png'))
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();
  const radius = Math.round(iconSize * 0.225);
  const masked = await sharp(icon)
    .composite([{ input: iosRoundedRectMask(iconSize, radius), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const canvas = 420;
  const wallpaper = await sharp({
    create: { width: canvas, height: canvas, channels: 3, background: { r: 18, g: 22, b: 32 } },
  })
    .linear(1.05, -8)
    .png()
    .toBuffer();

  const left = Math.round((canvas - iconSize) / 2);
  const top = 120;

  await sharp(wallpaper)
    .composite([{ input: masked, left, top }])
    .png()
    .toFile(path.join(outDir, '05-ios-homescreen-preview.png'));
}

async function renderSideBySide() {
  const ref = await sharp(path.join(outDir, '01-source-in-app-dark-variant.png'))
    .resize(272, 272)
    .png()
    .toBuffer();
  const gen = await sharp(path.join(outDir, '02-generated-icon-192.png'))
    .resize(272, 272)
    .png()
    .toBuffer();

  await sharp({
    create: { width: 584, height: 312, channels: 3, background: { r: 245, g: 245, b: 247 } },
  })
    .composite([
      { input: ref, left: 20, top: 20 },
      { input: gen, left: 292, top: 20 },
    ])
    .png()
    .toFile(path.join(outDir, '06-side-by-side-comparison.png'));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  await renderInAppReference();
  await copyGeneratedPreview();
  await renderAndroidLauncherPreview();
  await renderIosHomescreenPreview();
  await renderSideBySide();
  console.log('Comparison screenshots written to docs/assets/pwa-icon-audit/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
