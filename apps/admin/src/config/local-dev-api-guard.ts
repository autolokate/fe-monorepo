/**
 * Local Admin development must target the verified Dev API — never silently fall back to staging.
 *
 * Canonical source: FE repo Actions var `AWS_DEV_API_BASE_URL` =
 * `https://d1wpatcmpyt0pw.cloudfront.net` (CloudFront → Dev ALB), confirmed in
 * garage-mvp Dev RO / infrastructure readiness reports.
 */
export const CANONICAL_DEV_API_BASE_URL = 'https://d1wpatcmpyt0pw.cloudfront.net';

/** Hostnames that must not be used when VITE_ENVIRONMENT=development. */
export const FORBIDDEN_LOCAL_DEV_API_HOSTS = [
  'api-staging.autolokate.com',
  'api.autolokate.com',
] as const;

export type LocalDevApiEnvironment = 'development' | 'production' | 'staging';

export function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '');
}

export function isForbiddenLocalDevApiHost(apiBaseUrl: string): boolean {
  let host: string;
  try {
    host = new URL(normalizeApiBaseUrl(apiBaseUrl)).hostname.toLowerCase();
  } catch {
    return true;
  }
  return FORBIDDEN_LOCAL_DEV_API_HOSTS.some(
    (forbidden) => host === forbidden || host.endsWith(`.${forbidden}`),
  );
}

/**
 * Fail closed for local Vite development: refuse staging/prod API hosts so Admin cannot
 * accidentally hit the wrong environment.
 */
export function assertLocalDevelopmentApiBaseUrl(
  apiBaseUrl: string,
  environment: LocalDevApiEnvironment,
): string {
  const normalized = normalizeApiBaseUrl(apiBaseUrl);
  if (environment !== 'development') {
    return normalized;
  }
  if (isForbiddenLocalDevApiHost(normalized)) {
    throw new Error(
      `[admin] Local development must not use staging/production API hosts (${normalized}). ` +
        `Set VITE_API_BASE_URL=${CANONICAL_DEV_API_BASE_URL} in apps/admin/.env.development ` +
        `(canonical Dev CF / AWS_DEV_API_BASE_URL). Staging builds inject STAGING_API_BASE_URL separately.`,
    );
  }
  return normalized;
}

/** True when the resolved base matches the verified Dev CF front (path-insensitive). */
export function isCanonicalDevApiBaseUrl(apiBaseUrl: string): boolean {
  return normalizeApiBaseUrl(apiBaseUrl) === CANONICAL_DEV_API_BASE_URL;
}
