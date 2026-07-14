import type { ActivationPreviewDto } from '@autolokate/api-client';

import type { ActivationKind } from '@/platform/activation/activation-channel';

const STORAGE_KEY = 'al-partner-activation-v1';

export type StoredActivationContext = {
  qrCode: string;
  entitlementCode: string | null;
  /** Partner redeem kind or `b2c` for consumer prepaid preview. */
  activationKind: ActivationKind;
  previewCode: string;
  preview: ActivationPreviewDto | null;
  previewLoadedAt: string | null;
  subscriptionId: string | null;
  redeemIdempotencyKey: string | null;
};

type LegacyStoredActivationContext = Partial<StoredActivationContext> & {
  /** @deprecated Prefer `activationKind`. */
  partnerKind?: ActivationKind;
};

function session(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function normalizeContext(raw: LegacyStoredActivationContext): StoredActivationContext {
  const legacyKind = (raw as { partnerKind?: ActivationKind }).partnerKind;
  return {
    qrCode: raw.qrCode?.trim() ?? '',
    entitlementCode: raw.entitlementCode?.trim() ?? null,
    activationKind: raw.activationKind ?? legacyKind ?? 'b2b2c',
    previewCode: raw.previewCode?.trim() ?? '',
    preview: raw.preview ?? null,
    previewLoadedAt: raw.previewLoadedAt ?? null,
    subscriptionId: raw.subscriptionId ?? null,
    redeemIdempotencyKey: raw.redeemIdempotencyKey ?? null,
  };
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
    return normalizeContext(JSON.parse(raw) as LegacyStoredActivationContext);
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

/** Read/write activation resolve + preview context (partner + B2C prepaid). */
export const activationStorageRepository = {
  read(): StoredActivationContext | null {
    return memoryContext ?? readContext();
  },

  write(patch: Partial<StoredActivationContext> & { partnerKind?: ActivationKind }): StoredActivationContext {
    const current = memoryContext ?? readContext();
    const next: StoredActivationContext = {
      qrCode: patch.qrCode ?? current?.qrCode ?? '',
      entitlementCode: patch.entitlementCode ?? current?.entitlementCode ?? null,
      activationKind:
        patch.activationKind ??
        patch.partnerKind ??
        current?.activationKind ??
        'b2b2c',
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
    if (!store) {
      return;
    }
    try {
      store.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
