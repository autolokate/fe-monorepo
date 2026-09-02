import type { EmergencyContact } from '@/features/emergency/types';

const STORAGE_KEY = 'al-emergency-contacts-v1';

export type StoredEmergencyContactState = {
  contacts: EmergencyContact[];
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

function readRaw(): StoredEmergencyContactState | null {
  const store = session();
  if (!store) {
    return null;
  }
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredEmergencyContactState;
  } catch {
    return null;
  }
}

function writeRaw(state: StoredEmergencyContactState): void {
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

let memory: StoredEmergencyContactState | null = readRaw();

function defaultState(): StoredEmergencyContactState {
  return {
    contacts: [],
    verificationToken: null,
    verificationPhone: null,
    loadedAt: null,
    revision: 0,
  };
}

/** Account-level emergency contacts — single source of truth. */
export const emergencyContactStorageRepository = {
  read(): StoredEmergencyContactState {
    return memory ?? readRaw() ?? defaultState();
  },

  write(patch: Partial<StoredEmergencyContactState>): StoredEmergencyContactState {
    const current = memory ?? readRaw() ?? defaultState();
    const next: StoredEmergencyContactState = {
      contacts: patch.contacts ?? current.contacts,
      verificationToken:
        patch.verificationToken !== undefined ? patch.verificationToken : current.verificationToken,
      verificationPhone:
        patch.verificationPhone !== undefined ? patch.verificationPhone : current.verificationPhone,
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
