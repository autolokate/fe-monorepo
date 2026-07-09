import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin the standalone tracing root to the monorepo root (this file lives at apps/website/). Without
  // this, Next auto-detects the root by walking up for a lockfile and can land on the PARENT of the
  // repo (sibling repos share that dir), nesting the output under an extra path segment and diverging
  // between local and Docker builds. Pinning it keeps server.js at a deterministic apps/website/server.js.
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  // Workspace design-system packages import their own CSS from node_modules,
  // so Next must transpile them for those stylesheet imports to resolve.
  transpilePackages: ["@autolokate/ui", "@autolokate/design-system"],
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/how-it-works",
        permanent: true,
      },
      {
        source: "/how-to-use",
        destination: "/how-it-works",
        permanent: true,
      },
      {
        source: "/how-qr-works",
        destination: "/how-it-works",
        permanent: true,
      },
    ];
  },
  images: {
    // Catalogue images come from a long tail of OEM CDNs (Tata's Scene7,
    // manufacturer media kits, Wikipedia, partner CMS, etc.). The wildcard
    // lets `next/image` proxy any HTTPS source; the named hosts below are
    // kept for clarity / future audits.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "autolokate.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.production.linktr.ee",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.scene7.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
    ],
  },
};

export default nextConfig;
