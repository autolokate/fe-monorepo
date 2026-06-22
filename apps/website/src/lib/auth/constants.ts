/** localStorage / cookie keys for tokens. Kept in lock-step with the backend's expectations. */
export const ACCESS_TOKEN_STORAGE_KEY = "autolokate_access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "autolokate_refresh_token";

export const ACCESS_TOKEN_COOKIE_KEY = "autolokate_access_token";
export const REFRESH_TOKEN_COOKIE_KEY = "autolokate_refresh_token";

/** 30 days. Tokens persist in cookies so SSR / middleware can read them too. */
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Consent version sent with verify-otp — bump when policy text changes. */
export const CONSENT_VERSION = "v1.0";
