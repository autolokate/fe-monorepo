import type { MetadataRoute } from 'next';
import { IS_INDEXABLE_SITE, SITE_URL } from '@/lib/seo';

/** Account, checkout and auth flows carry no public content — keep crawlers out of them. */
const PRIVATE_PATHS = [
  '/api/',
  '/auth/',
  '/profile',
  '/addresses',
  '/checkout/',
  '/orders',
  '/my-orders',
  '/purchase',
  '/buy',
  '/offline',
];

export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE_SITE) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
