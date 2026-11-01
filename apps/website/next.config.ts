import path from 'node:path';
import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

import { assertBuildEnv } from './src/config/env.config';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Lint is enforced by the dedicated CI `lint` step (turbo → the root flat config) and the
  // pre-commit gate, not by `next build`. Decoupling avoids double-linting and keeps the build
  // resolving the same single config every other app uses.
  eslint: { ignoreDuringBuilds: true },
  // Pin the standalone tracing root to the monorepo root (this file lives at apps/website/). Without
  // this, Next auto-detects the root by walking up for a lockfile and can land on the PARENT of the
  // repo (sibling repos share that dir), nesting the output under an extra path segment and diverging
  // between local and Docker builds. Pinning it keeps server.js at a deterministic apps/website/server.js.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  // Workspace design-system packages import their own CSS from node_modules,
  // so Next must transpile them for those stylesheet imports to resolve.
  transpilePackages: ['@autolokate/ui', '@autolokate/design-system'],
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
      // WEB-07: the legacy `(purchase)` stepper was retired — the `/buy` journey is the one
      // QR purchase flow. Temporary (307) so the target can still change.
      {
        source: '/purchase',
        destination: '/buy',
        permanent: false,
      },
      {
        source: '/my-orders',
        destination: '/orders',
        permanent: false,
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

/**
 * WEB-09: refuse to produce a production build without a backend base URL — otherwise the
 * bundle silently ships pointing at nowhere. `next dev` keeps its localhost default.
 */
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    assertBuildEnv();
  }
  return nextConfig;
}
