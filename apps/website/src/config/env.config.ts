/**
 * Environment Configuration
 *
 * NEXT_PUBLIC_* are inlined into the bundle at BUILD time by Next.js — real staging/prod values
 * are injected as Docker build args by the deploy workflow (apps/website/Dockerfile).
 *
 * WEB-09: a production build with no API base URL now FAILS (see `assertBuildEnv`, called
 * from next.config.ts) instead of silently baking `http://localhost:8080` into a deployed
 * site. The localhost default below only ever applies to `next dev` / tests.
 */

const LOCAL_DEV_API_BASE_URL = 'http://localhost:8080';

function readApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL?.trim() ?? '';
  if (raw) return raw.replace(/\/+$/, '');
  return process.env.NODE_ENV === 'production' ? '' : LOCAL_DEV_API_BASE_URL;
}

/**
 * Validate the build-time environment. Throws when a production build is missing (or has a
 * malformed) API base URL, so a misconfigured deploy cannot ship a dead site.
 */
export function assertBuildEnv(source: NodeJS.ProcessEnv = process.env): void {
  const raw = source.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL?.trim() ?? '';
  if (!raw) {
    throw new Error(
      'NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL is not set. A production build of the website ' +
        'needs the backend base URL (e.g. https://api.example.com). Set it in the build ' +
        'environment / Docker build args.',
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL is not a valid URL: "${raw}".`);
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL must be an http(s) URL.');
  }
}

export const env = {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- NODE_ENV is typed as a required union but can be undefined at runtime (e.g. plain `node`); keep the default
  NODE_ENV: process.env.NODE_ENV || 'development',

  /** Backend base URL, no trailing slash. */
  NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL: readApiBaseUrl(),

  // Site Configuration — prefer the injected value, then the live origin on the client, then a
  // local-dev placeholder on the server.
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
};

// Environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
