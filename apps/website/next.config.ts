import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * `public/` assets are not fingerprinted, so a week of browser cache plus a long
 * stale-while-revalidate window keeps repeat visits instant while still picking
 * up replaced files. Bump the `?v=` query on a path to force a refresh sooner.
 */
const PUBLIC_ASSET_CACHE = 'public, max-age=604800, stale-while-revalidate=2592000';
const STATIC_FILE_CACHE = 'public, max-age=86400, stale-while-revalidate=604800';

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['@autolokate/ui', 'date-fns', 'react-day-picker'],
  },
  turbopack: {
    root: monorepoRoot,
  },
  // Workspace design-system packages import their own CSS from node_modules,
  // so Next must transpile them for those stylesheet imports to resolve.
  transpilePackages: ['@autolokate/ui', '@autolokate/design-system', '@autolokate/config'],
  redirects() {
    return Promise.resolve([
      {
        source: '/shop',
        destination: '/how-it-works',
        permanent: true,
      },
      {
        source: '/how-to-use',
        destination: '/how-it-works',
        permanent: true,
      },
      {
        source: '/how-qr-works',
        destination: '/how-it-works',
        permanent: true,
      },
      {
        source: '/safety',
        destination: '/emergency-safety',
        permanent: true,
      },
      {
        source: '/refund-policy',
        destination: '/refund-and-cancellation',
        permanent: true,
      },
      {
        source: '/shipping-policy',
        destination: '/shipping-and-delivery',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/signup',
        permanent: true,
      },
    ]);
  },
  headers() {
    return Promise.resolve([
      {
        source: '/:dir(images|videos|brand|brands|og|purchase-journey)/:path*',
        headers: [{ key: 'Cache-Control', value: PUBLIC_ASSET_CACHE }],
      },
      {
        source: '/:file(favicon.ico|brand_bg_dark.png|brand_bg_light.png)',
        headers: [{ key: 'Cache-Control', value: STATIC_FILE_CACHE }],
      },
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ]);
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Optimised variants are content-addressed by Next, so they can live in the
    // image cache for a month instead of the default 60 seconds.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920, 2560],
    // Catalogue images come from a long tail of OEM CDNs (Tata's Scene7,
    // manufacturer media kits, Wikipedia, partner CMS, etc.). The wildcard
    // lets `next/image` proxy any HTTPS source; the named hosts below are
    // kept for clarity / future audits.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'autolokate.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ugc.production.linktr.ee',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.scene7.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/**',
      },
    ],
  },
};

export default nextConfig;
