import type { EmergencyRider } from '@/features/emergency/types.js';

const STORAGE_KEY = 'al-subscription-riders-v1';

export type StoredRiderState = {
  subscriptionId: string | null;
  riders: EmergencyRider[];
  verificationToken: string | null;
  verificationPhone: string | null;
  loadedAt: string | null;
  revision: number;
};

function session(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function readRaw(): StoredRiderState | null {
  const store = session();
  if (!store) {
    return null;
  }
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredRiderState;
  } catch {
    return null;
  }
}

function writeRaw(state: StoredRiderState): void {
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

let memory: StoredRiderState | null = readRaw();

function defaultState(): StoredRiderState {
  return {
    subscriptionId: null,
    riders: [],
    verificationToken: null,
    verificationPhone: null,
    loadedAt: null,
    revision: 0,
  };
}

/** Subscription-scoped riders — single source of truth. */
export const riderStorageRepository = {
  read(): StoredRiderState {
    return memory ?? readRaw() ?? defaultState();
  },

  write(patch: Partial<StoredRiderState>): StoredRiderState {
    const current = memory ?? readRaw() ?? defaultState();
    const next: StoredRiderState = {
      subscriptionId:
        patch.subscriptionId !== undefined ? patch.subscriptionId : current.subscriptionId,
      riders: patch.riders ?? current.riders,
      verificationToken:
        patch.verificationToken !== undefined ? patch.verificationToken : current.verificationToken,
      verificationPhone:
        patch.verificationPhone !== undefined
          ? patch.verificationPhone
          : current.verificationPhone,
      loadedAt: patch.loadedAt ?? current.loadedAt,
      revision: current.revision + 1,
    };
    memory = next;
    writeRaw(next);
    return next;
  },

  clearVerification(): void {
    this.write({ verificationToken: null, verificationPhone: null });
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
