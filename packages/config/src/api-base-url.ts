/** Staging backend — default for local apps and any build that omits a public API URL. */
export const STAGING_API_BASE_URL = 'https://api-staging.autolokate.com';

/** Production backend. */
export const PRODUCTION_API_BASE_URL = 'https://api.autolokate.com';

function hostnameOf(url: string): string | null {
  try {
    const match = /^(?:https?:)?\/\/([^/:?#]+)/i.exec(url);
    return match && match[1] ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

/** True when the URL targets a loopback host (never a deployed API). */
export function isLoopbackApiUrl(url: string): boolean {
  const host = hostnameOf(url.trim());
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]'
  );
}

/**
 * Single resolver for every Autolokate app.
 * Loopback values are ignored so a leftover `.env` cannot silently point APIs at localhost.
 */
export function resolveApiBaseUrl(raw: string | undefined | null): string {
  const value = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
  if (!value) {
    return STAGING_API_BASE_URL;
  }
  if (isLoopbackApiUrl(value)) {
    return STAGING_API_BASE_URL;
  }
  return value;
}
