import { INSTAGRAM_URL, LINKEDIN_URL, SUPPORT_EMAIL } from '@/layouts/Footer/constants';

export const SITE_NAME = 'Autolokate';

export const SITE_TAGLINE = 'Automatic Crash Detection & Vehicle Safety';

export const SITE_DESCRIPTION =
  'Autolokate turns your phone into a crash detector. A serious crash alerts our 24/7 Control Center, your family and nearby help — with ambulance and roadside support, cashless cover, and a Smart QR backup on every vehicle.';

const PRODUCTION_SITE_URL = 'https://autolokate.com';

/**
 * Canonical origin for metadata, sitemap and structured data. Server-side this
 * is the build-time `NEXT_PUBLIC_SITE_URL`; production falls back to the live
 * domain so canonical links never point at localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'production' ? PRODUCTION_SITE_URL : 'http://localhost:3001')
).replace(/\/$/, '');

/** Only the production domain is crawlable — staging and local builds stay out of search. */
export const IS_INDEXABLE_SITE = (() => {
  try {
    const { hostname } = new URL(SITE_URL);
    return hostname === 'autolokate.com' || hostname === 'www.autolokate.com';
  } catch {
    return false;
  }
})();

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const SITE_LOGO_PATH = '/brand/al-logo-light.svg';

/**
 * Link-preview image. A page's `openGraph` replaces the root one wholesale, so
 * every metadata config that sets `openGraph` must list this explicitly.
 */
export const DEFAULT_SHARE_IMAGE = {
  url: '/og/autolokate-og.jpg',
  width: 1200,
  height: 630,
  alt: 'Autolokate – automatic crash detection and vehicle safety',
};

export const SITE_SOCIAL_PROFILES = [INSTAGRAM_URL.split('?')[0], LINKEDIN_URL];

export const SITE_SUPPORT_EMAIL = SUPPORT_EMAIL;
