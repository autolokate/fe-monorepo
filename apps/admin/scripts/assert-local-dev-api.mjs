#!/usr/bin/env node
/**
 * Regression: local Admin development must resolve to the verified Dev API base URL
 * and must reject staging as an unintended default.
 *
 * Mirrors apps/admin/src/config/local-dev-api-guard.ts (keep in sync).
 * Run: node apps/admin/scripts/assert-local-dev-api.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adminRoot = join(__dirname, '..');

const CANONICAL_DEV_API_BASE_URL = 'https://d1wpatcmpyt0pw.cloudfront.net';
const FORBIDDEN_LOCAL_DEV_API_HOSTS = ['api-staging.autolokate.com', 'api.autolokate.com'];

function normalizeApiBaseUrl(url) {
  return url.trim().replace(/\/$/, '');
}

function isForbiddenLocalDevApiHost(apiBaseUrl) {
  let host;
  try {
    host = new URL(normalizeApiBaseUrl(apiBaseUrl)).hostname.toLowerCase();
  } catch {
    return true;
  }
  return FORBIDDEN_LOCAL_DEV_API_HOSTS.some(
    (forbidden) => host === forbidden || host.endsWith(`.${forbidden}`),
  );
}

function assertLocalDevelopmentApiBaseUrl(apiBaseUrl, environment) {
  const normalized = normalizeApiBaseUrl(apiBaseUrl);
  if (environment !== 'development') {
    return normalized;
  }
  if (isForbiddenLocalDevApiHost(normalized)) {
    throw new Error(
      `[admin] Local development must not use staging/production API hosts (${normalized}). ` +
        `Set VITE_API_BASE_URL=${CANONICAL_DEV_API_BASE_URL}`,
    );
  }
  return normalized;
}

function parseEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

assert.equal(isForbiddenLocalDevApiHost('https://api-staging.autolokate.com'), true);
assert.equal(isForbiddenLocalDevApiHost(CANONICAL_DEV_API_BASE_URL), false);
assert.throws(
  () => assertLocalDevelopmentApiBaseUrl('https://api-staging.autolokate.com', 'development'),
  /must not use staging/,
);
assert.throws(
  () => assertLocalDevelopmentApiBaseUrl('https://api.autolokate.com', 'development'),
  /must not use staging/,
);
assert.equal(
  assertLocalDevelopmentApiBaseUrl(CANONICAL_DEV_API_BASE_URL, 'development'),
  CANONICAL_DEV_API_BASE_URL,
);
assert.equal(
  assertLocalDevelopmentApiBaseUrl('https://api-staging.autolokate.com', 'staging'),
  'https://api-staging.autolokate.com',
);

const example = parseEnvFile(join(adminRoot, '.env.example'));
assert.equal(normalizeApiBaseUrl(example.VITE_API_BASE_URL), CANONICAL_DEV_API_BASE_URL);
assert.equal(example.VITE_ENVIRONMENT, 'development');
assert.equal(isForbiddenLocalDevApiHost(example.VITE_API_BASE_URL), false);

const local = parseEnvFile(join(adminRoot, '.env.development'));
if (Object.keys(local).length > 0) {
  assert.equal(local.VITE_ENVIRONMENT, 'development');
  assert.equal(normalizeApiBaseUrl(local.VITE_API_BASE_URL), CANONICAL_DEV_API_BASE_URL);
  assertLocalDevelopmentApiBaseUrl(local.VITE_API_BASE_URL, 'development');
} else {
  console.warn('[assert-local-dev-api] .env.development missing — copy from .env.example');
}

// Source guard must advertise the same canonical host.
const guardSrc = readFileSync(join(adminRoot, 'src/config/local-dev-api-guard.ts'), 'utf8');
assert.match(guardSrc, /d1wpatcmpyt0pw\.cloudfront\.net/);
assert.match(guardSrc, /api-staging\.autolokate\.com/);

console.log(
  JSON.stringify(
    {
      ok: true,
      canonicalDevApiBaseUrl: CANONICAL_DEV_API_BASE_URL,
      exampleBaseUrl: normalizeApiBaseUrl(example.VITE_API_BASE_URL),
      localBaseUrl: local.VITE_API_BASE_URL
        ? normalizeApiBaseUrl(local.VITE_API_BASE_URL)
        : null,
    },
    null,
    2,
  ),
);
