const STORAGE_KEY = 'al-park-session-v1';

export type StoredParkSession = {
  bystanderSessionToken: string | null;
  notificationId: string | null;
  parkSubmitIdempotencyKey: string | null;
  revision: number;
};

function session(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function readRaw(): StoredParkSession | null {
  const store = session();
  if (!store) {
    return null;
  }
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredParkSession;
  } catch {
    return null;
  }
}

function writeRaw(state: StoredParkSession): void {
  const store = session();
  if (!store) {
    return;
  }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function defaultState(): StoredParkSession {
  return {
    bystanderSessionToken: null,
    notificationId: null,
    parkSubmitIdempotencyKey: null,
    revision: 0,
  };
}

let memory: StoredParkSession | null = readRaw();

/** Park-Me bystander session — single source of truth for OTP token and tracker id. */
export const parkSessionRepository = {
  read(): StoredParkSession {
    return memory ?? readRaw() ?? defaultState();
  },

  write(patch: Partial<StoredParkSession>): StoredParkSession {
    const current = memory ?? readRaw() ?? defaultState();
    const next: StoredParkSession = {
      bystanderSessionToken:
        patch.bystanderSessionToken !== undefined
          ? patch.bystanderSessionToken
          : current.bystanderSessionToken,
      notificationId:
        patch.notificationId !== undefined ? patch.notificationId : current.notificationId,
      parkSubmitIdempotencyKey:
        patch.parkSubmitIdempotencyKey !== undefined
          ? patch.parkSubmitIdempotencyKey
          : current.parkSubmitIdempotencyKey,
      revision: current.revision + 1,
    };
    memory = next;
    writeRaw(next);
    return next;
  },

  readToken(): string | null {
    return this.read().bystanderSessionToken;
  },

  writeToken(token: string): void {
    this.write({ bystanderSessionToken: token });
  },

  readNotificationId(): string | null {
    return this.read().notificationId;
  },

  writeNotificationId(notificationId: string): void {
    this.write({ notificationId });
  },

  readOrCreateSubmitIdempotencyKey(): string {
    const current = this.read();
    if (current.parkSubmitIdempotencyKey) {
      return current.parkSubmitIdempotencyKey;
    }
    const key = crypto.randomUUID();
    this.write({ parkSubmitIdempotencyKey: key });
    return key;
  },

  clear(): void {
    memory = null;
    const store = session();
    if (store) {
      try {
        store.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  },
};
