"use client";

import {
  ACCESS_TOKEN_COOKIE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "./constants";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/** Custom DOM event name dispatched whenever auth tokens are written or cleared. */
export const AUTH_CHANGE_EVENT = "autolokate:auth-change";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

/**
 * Notify any in-tab listeners that auth tokens changed. The native `storage`
 * event ONLY fires in other tabs — without this, the tab that performed the
 * write/clear wouldn't see its own change.
 */
function notifyAuthChange(): void {
  if (!canUseStorage()) return;
  try {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
  } catch {
    // Some environments (older Safari, embedded webviews) lack CustomEvent.
  }
}

/**
 * Subscribe to auth-state changes from any source:
 *  - same tab: writeAuthTokens / clearAuthTokens dispatch a custom event
 *  - other tabs: localStorage `storage` event
 *
 * Returns an unsubscribe function for cleanup.
 */
export function subscribeAuthChange(handler: () => void): () => void {
  if (!canUseStorage()) return () => {};

  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith("autolokate_")) handler();
  };
  const onCustom = () => handler();

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_CHANGE_EVENT, onCustom);
  };
}

export function readAuthTokens(): AuthTokens | null {
  if (!canUseStorage()) return null;
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}

export function writeAuthTokens(tokens: AuthTokens): void {
  if (!canUseStorage()) return;
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);

  const maxAge = AUTH_COOKIE_MAX_AGE_SECONDS;
  document.cookie = `${ACCESS_TOKEN_COOKIE_KEY}=${encodeURIComponent(tokens.accessToken)}; path=/; max-age=${maxAge}; samesite=lax`;
  document.cookie = `${REFRESH_TOKEN_COOKIE_KEY}=${encodeURIComponent(tokens.refreshToken)}; path=/; max-age=${maxAge}; samesite=lax`;
  notifyAuthChange();
}

export function clearAuthTokens(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  document.cookie = `${ACCESS_TOKEN_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${REFRESH_TOKEN_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
  notifyAuthChange();
}

export function hasAuthTokens(): boolean {
  const tokens = readAuthTokens();
  return Boolean(tokens?.accessToken && tokens?.refreshToken);
}
