import type { StoredTokenPair, TokenRefreshHandler, TokenStorage } from './types';
import { createSessionTokenStorage } from './token-storage';

const EXPIRY_BUFFER_MS = 30_000;

export class TokenManager {
  private refreshHandler: TokenRefreshHandler | null = null;
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(private readonly storage: TokenStorage = createSessionTokenStorage()) {}

  /** Wire the API refresh call (injected by api-client bootstrap). */
  setRefreshHandler(handler: TokenRefreshHandler): void {
    this.refreshHandler = handler;
  }

  getAccessToken(): string | null {
    return this.storage.read()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.storage.read()?.refreshToken ?? null;
  }

  getUserId(): string | null {
    return this.storage.read()?.userId ?? null;
  }

  read(): StoredTokenPair | null {
    return this.storage.read();
  }

  save(tokens: StoredTokenPair): void {
    this.storage.write(tokens);
  }

  clear(): void {
    this.storage.remove();
  }

  hasSession(): boolean {
    const tokens = this.storage.read();
    return Boolean(tokens?.accessToken && tokens.refreshToken);
  }

  isExpired(referenceMs: number = Date.now()): boolean {
    const tokens = this.storage.read();
    if (!tokens?.expiresAt) {
      return true;
    }
    const expiresMs = Date.parse(tokens.expiresAt);
    if (Number.isNaN(expiresMs)) {
      return true;
    }
    return expiresMs - EXPIRY_BUFFER_MS <= referenceMs;
  }

  /**
   * Rotate refresh token via injected handler.
   * Single in-flight queue — concurrent callers share one refresh.
   */
  async refresh(): Promise<boolean> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken || !this.refreshHandler) {
      return false;
    }

    this.refreshInFlight = (async () => {
      try {
        const handler = this.refreshHandler;
        if (!handler) {
          return false;
        }
        const next = await handler(refreshToken);
        this.save(next);
        return true;
      } catch {
        this.clear();
        return false;
      } finally {
        this.refreshInFlight = null;
      }
    })();

    return this.refreshInFlight;
  }
}

let defaultManager: TokenManager | null = null;

/** Process-wide token manager (one per browser tab session). */
export function getTokenManager(): TokenManager {
  if (!defaultManager) {
    defaultManager = new TokenManager();
  }
  return defaultManager;
}

export function createTokenManager(storage?: TokenStorage): TokenManager {
  return new TokenManager(storage);
}
