import type { ActivationPreviewDto } from '@autolokate/api-client';

import type { PartnerActivationKind } from '@/platform/activation/activation-channel';

const STORAGE_KEY = 'al-partner-activation-v1';

export type StoredActivationContext = {
  qrCode: string;
  entitlementCode: string | null;
  partnerKind: PartnerActivationKind;
  previewCode: string;
  preview: ActivationPreviewDto | null;
  previewLoadedAt: string | null;
  subscriptionId: string | null;
  redeemIdempotencyKey: string | null;
};

function session(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function readContext(): StoredActivationContext | null {
  const store = session();
  if (!store) {
    return null;
  }
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredActivationContext;
  } catch {
    return null;
  }
}

function writeContext(context: StoredActivationContext): void {
  const store = session();
  if (!store) {
    return;
  }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch {
    // Quota or privacy mode — in-memory cache remains authoritative for the tab.
  }
}

let memoryContext: StoredActivationContext | null = readContext();

/** Read/write partner activation resolve + preview context. */
export const activationStorageRepository = {
  read(): StoredActivationContext | null {
    return memoryContext ?? readContext();
  },

  write(patch: Partial<StoredActivationContext>): StoredActivationContext {
    const current = memoryContext ?? readContext();
    const next: StoredActivationContext = {
      qrCode: patch.qrCode ?? current?.qrCode ?? '',
      entitlementCode: patch.entitlementCode ?? current?.entitlementCode ?? null,
      partnerKind: patch.partnerKind ?? current?.partnerKind ?? 'b2b2c',
      previewCode: patch.previewCode ?? current?.previewCode ?? '',
      preview: patch.preview ?? current?.preview ?? null,
      previewLoadedAt: patch.previewLoadedAt ?? current?.previewLoadedAt ?? null,
      subscriptionId: patch.subscriptionId ?? current?.subscriptionId ?? null,
      redeemIdempotencyKey: patch.redeemIdempotencyKey ?? current?.redeemIdempotencyKey ?? null,
    };
    memoryContext = next;
    writeContext(next);
    return next;
  },

  clear(): void {
    memoryContext = null;
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
