import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const nextConfig: NextConfig = {
  output: 'standalone',
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
  images: {
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
