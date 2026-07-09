import type { StoredTokenPair, TokenStorage } from './types';

/** Shared storage key — do not change without a migration plan. */
export const TOKEN_STORAGE_KEY = 'al-auth-tokens-v1';

function readSessionStorage(key: string): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, value: string): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore quota / private mode failures
  }
}

function removeSessionStorage(key: string): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Browser sessionStorage-backed token storage (onboarding PWA default). */
export function createSessionTokenStorage(
  key: string = TOKEN_STORAGE_KEY,
): TokenStorage {
  return {
    read(): StoredTokenPair | null {
      const raw = readSessionStorage(key);
      if (!raw) {
        return null;
      }
      try {
        return JSON.parse(raw) as StoredTokenPair;
      } catch {
        return null;
      }
    },
    write(tokens: StoredTokenPair): void {
      writeSessionStorage(key, JSON.stringify(tokens));
    },
    remove(): void {
      removeSessionStorage(key);
    },
  };
}
