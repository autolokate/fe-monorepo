import { qrStorageRepository } from './qr-storage-repository';
import { parkSessionRepository } from './park-session-repository';

const STORAGE_KEY = 'al-scanner-emergency-v1';

export type StoredScannerEmergency = {
  alertId: string | null;
  emergencyNonce: string | null;
  emergencySubmitIdempotencyKey: string | null;
  revision: number;
};

function session(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function readRaw(): StoredScannerEmergency | null {
  const store = session();
  if (!store) {
    return null;
  }
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredScannerEmergency;
  } catch {
    return null;
  }
}

function writeRaw(state: StoredScannerEmergency): void {
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

function defaultState(): StoredScannerEmergency {
  return {
    alertId: null,
    emergencyNonce: null,
    emergencySubmitIdempotencyKey: null,
    revision: 0,
  };
}

let memory: StoredScannerEmergency | null = readRaw();

/** Anonymous scanner context — QR code from resolve + emergency tracker ids. */
export const anonymousScannerRepository = {
  readQrCode(): string | null {
    return qrStorageRepository.readCode()?.trim() || null;
  },

  readEmergency(): StoredScannerEmergency {
    return memory ?? readRaw() ?? defaultState();
  },

  writeEmergency(patch: Partial<StoredScannerEmergency>): StoredScannerEmergency {
    const current = memory ?? readRaw() ?? defaultState();
    const next: StoredScannerEmergency = {
      alertId: patch.alertId !== undefined ? patch.alertId : current.alertId,
      emergencyNonce:
        patch.emergencyNonce !== undefined ? patch.emergencyNonce : current.emergencyNonce,
      emergencySubmitIdempotencyKey:
        patch.emergencySubmitIdempotencyKey !== undefined
          ? patch.emergencySubmitIdempotencyKey
          : current.emergencySubmitIdempotencyKey,
      revision: current.revision + 1,
    };
    memory = next;
    writeRaw(next);
    return next;
  },

  readAlertId(): string | null {
    return this.readEmergency().alertId;
  },

  writeAlertId(alertId: string): void {
    this.writeEmergency({ alertId });
  },

  readOrCreateEmergencyNonce(): string {
    const current = this.readEmergency();
    if (current.emergencyNonce) {
      return current.emergencyNonce;
    }
    const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    this.writeEmergency({ emergencyNonce: nonce });
    return nonce;
  },

  readOrCreateEmergencySubmitIdempotencyKey(): string {
    const current = this.readEmergency();
    if (current.emergencySubmitIdempotencyKey) {
      return current.emergencySubmitIdempotencyKey;
    }
    const key = crypto.randomUUID();
    this.writeEmergency({ emergencySubmitIdempotencyKey: key });
    return key;
  },

  clear(): void {
    memory = null;
    parkSessionRepository.clear();
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
