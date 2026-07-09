/**
 * Generates PWA raster icons and theme-aware favicons from approved brand SVGs.
 * - Transparent backgrounds everywhere (no baked-in canvas fill).
 * - Dark mark on transparent bg for browser favicons (always, all themes).
 * - Generous inset so the mark never touches icon edges.
 *
 * Run: node scripts/generate-pwa-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const brandAssetsDir = path.resolve(rootDir, '../../packages/brand/src/assets');
const markOnLightBg = path.resolve(brandAssetsDir, 'al-logo-light.svg');
const markOnDarkBg = path.resolve(brandAssetsDir, 'al-logo-dark.svg');
const iconsDir = path.resolve(rootDir, 'public/icons');
const publicDir = path.resolve(rootDir, 'public');
const publicBrandDir = path.resolve(publicDir, 'brand');

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** Browser tab favicon — mark uses ~68% of canvas (~16% padding per edge). */
const FAVICON_MARK_RATIO = 0.68;

/** Standard launcher icons — mark uses ~56% of canvas. */
const ANY_MARK_RATIO = 0.56;

/** Maskable launcher icons — mark uses ~48% (fits Android adaptive safe zone). */
const MASKABLE_MARK_RATIO = 0.48;

function markBoxSize(canvasSize, markRatio) {
  return Math.round(canvasSize * markRatio);
}

async function renderMarkLayer(svgPath, boxSize) {
  return sharp(svgPath)
    .ensureAlpha()
    .resize(boxSize, boxSize, {
      fit: 'contain',
      background: TRANSPARENT,
    })
    .png()
    .toBuffer();
}

async function renderTransparentIcon(canvasSize, markRatio, svgPath, outPath) {
  const boxSize = markBoxSize(canvasSize, markRatio);
  const markLayer = await renderMarkLayer(svgPath, boxSize);
  const markMeta = await sharp(markLayer).metadata();
  const markWidth = markMeta.width ?? boxSize;
  const markHeight = markMeta.height ?? boxSize;
  const left = Math.round((canvasSize - markWidth) / 2);
  const top = Math.round((canvasSize - markHeight) / 2);

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: TRANSPARENT,
    },
  })
    .composite([{ input: markLayer, left, top }])
    .png()
    .toFile(outPath);

  return {
    canvasSize,
    markRatio,
    boxSize,
    markWidth,
    markHeight,
    offsetLeft: left,
    offsetTop: top,
    svgPath,
  };
}

async function syncPublicBrandAssets() {
  fs.mkdirSync(publicBrandDir, { recursive: true });
  for (const file of fs.readdirSync(brandAssetsDir).filter((name) => name.endsWith('.svg'))) {
    await fs.promises.copyFile(path.join(brandAssetsDir, file), path.join(publicBrandDir, file));
  }
}

async function main() {
  fs.mkdirSync(iconsDir, { recursive: true });
  await syncPublicBrandAssets();

  const results = {
    markOnLightBg,
    markOnDarkBg,
    icons: [],
    favicons: [],
  };

  results.icons.push(
    await renderTransparentIcon(192, ANY_MARK_RATIO, markOnLightBg, path.join(iconsDir, 'icon-192.png')),
  );
  results.icons.push(
    await renderTransparentIcon(512, ANY_MARK_RATIO, markOnLightBg, path.join(iconsDir, 'icon-512.png')),
  );
  results.icons.push(
    await renderTransparentIcon(
      192,
      MASKABLE_MARK_RATIO,
      markOnLightBg,
      path.join(iconsDir, 'icon-192-maskable.png'),
    ),
  );
  results.icons.push(
    await renderTransparentIcon(
      512,
      MASKABLE_MARK_RATIO,
      markOnLightBg,
      path.join(iconsDir, 'icon-512-maskable.png'),
    ),
  );
  results.icons.push(
    await renderTransparentIcon(
      180,
      ANY_MARK_RATIO,
      markOnLightBg,
      path.join(publicDir, 'apple-touch-icon.png'),
    ),
  );
  await fs.promises.copyFile(
    path.join(publicDir, 'apple-touch-icon.png'),
    path.join(iconsDir, 'apple-touch-icon.png'),
  );

  for (const size of [16, 32]) {
    results.favicons.push(
      await renderTransparentIcon(
        size,
        FAVICON_MARK_RATIO,
        markOnLightBg,
        path.join(publicDir, `favicon-${size}.png`),
      ),
    );
  }

  await sharp(path.join(publicDir, 'favicon-32.png')).toFile(path.join(publicDir, 'favicon.ico'));

  console.log('PWA icons generated (transparent bg, padded mark)');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
