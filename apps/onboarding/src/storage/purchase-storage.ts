import type {
  ConsumerAttachQrStatus,
  OrderStatus,
  QrChannel,
  QrJourney,
  QrOfferedSku,
  QrPublicVehicle,
  QrResolution,
  QrStatus,
} from '@autolokate/api-client';
import type { AlVehicleRcField } from '@autolokate/ui';

import type { PurchasePlanId, PurchaseRiderCount } from '@/features/qr-purchase/types-checkout.js';
import type { AuthLanguageId } from '@/features/shared-auth/types.js';

/**
 * Purchase QR code uses **localStorage** so it survives auth navigation and matches
 * the scanner / manual entry path (`localStorage.qr_code`).
 *
 * Other purchase blobs stay in sessionStorage (same-tab journey scope).
 */
export const PURCHASE_STORAGE_KEYS = {
  qrCode: 'qr_code',
  qrResolve: 'al-last-qr-resolve',
  vehicle: 'al-last-vehicle',
  order: 'al-last-order',
  attach: 'al-last-qr-attach',
  legalNoticeVersion: 'al-legal-notice-version',
} as const;

export type StoredQrResolve = {
  qrCode: string;
  qrStatus: QrStatus;
  channel: QrChannel;
  journey: QrJourney;
  offeredSku: QrOfferedSku | null;
  vehicle: QrPublicVehicle | null;
  resolvedAt: string;
};

export type StoredVehicle = {
  registration: string;
  fields?: AlVehicleRcField[];
  selectedPlanId?: PurchasePlanId;
  riderCount?: PurchaseRiderCount;
  ownerName?: string;
  languageId?: AuthLanguageId;
  profileId?: string;
  confirmedAt?: string;
};

export type StoredCheckout = {
  orderId: string | null;
  totalPaise: number | null;
  orderStatus: OrderStatus | null;
  paymentRef: string | null;
  updatedAt: string;
};

export type StoredAttachResult = {
  attachEventId: string;
  vehicleId: string;
  qrStatus: ConsumerAttachQrStatus;
  subscriptionId: string | null;
  attachedAt: string;
  purchaseQrCode: string;
  registration: string;
};

function session(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function local(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

function readJsonFrom(storage: Storage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeJsonTo(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or privacy mode — callers keep in-memory fallbacks where needed.
  }
}

function removeFrom(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

function readJson(key: string): unknown {
  const store = session();
  if (!store) {
    return null;
  }
  return readJsonFrom(store, key);
}

function writeJson(key: string, value: unknown): void {
  const store = session();
  if (!store) {
    return;
  }
  writeJsonTo(store, key, value);
}

function removeKey(key: string): void {
  const store = session();
  if (!store) {
    return;
  }
  removeFrom(store, key);
}

/** Read a plain or JSON-stringified QR value from a specific Web Storage bucket. */
function readPlainStringFrom(storage: Storage, key: string): string | null {
  try {
    const raw = storage.getItem(key);
    if (!raw?.trim()) {
      return null;
    }
    const trimmed = raw.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const parsed = JSON.parse(trimmed) as unknown;
      if (typeof parsed === 'string' && parsed.trim()) {
        return parsed.trim();
      }
    }
    return trimmed;
  } catch {
    return null;
  }
}

function readQrCodeFromLocal(): string | null {
  const store = local();
  if (!store) {
    return null;
  }
  return readPlainStringFrom(store, PURCHASE_STORAGE_KEYS.qrCode);
}

function removeQrCodeEverywhere(): void {
  const localStore = local();
  if (localStore) {
    removeFrom(localStore, PURCHASE_STORAGE_KEYS.qrCode);
  }
}

export function saveQrCode(code: string): void {
  const trimmed = code.trim();
  if (!trimmed) {
    return;
  }
  const localStore = local();
  if (!localStore) {
    return;
  }
  try {
    localStore.setItem(PURCHASE_STORAGE_KEYS.qrCode, trimmed);
  } catch {
    // ignore
  }
}

export function getQrCode(): string | null {
  return readQrCodeFromLocal();
}

export function saveLegalNoticeVersion(version: string): void {
  const trimmed = version.trim();
  if (!trimmed) {
    return;
  }
  const localStore = local();
  if (!localStore) {
    return;
  }
  try {
    localStore.setItem(PURCHASE_STORAGE_KEYS.legalNoticeVersion, trimmed);
  } catch {
    // ignore
  }
}

export function getLegalNoticeVersion(): string | null {
  const localStore = local();
  if (!localStore) {
    return null;
  }
  return readPlainStringFrom(localStore, PURCHASE_STORAGE_KEYS.legalNoticeVersion);
}

export function saveResolvedQr(code: string, resolution: QrResolution): StoredQrResolve {
  const payload: StoredQrResolve = {
    qrCode: code.trim(),
    qrStatus: resolution.qrStatus,
    channel: resolution.channel,
    journey: resolution.journey,
    offeredSku: resolution.offeredSku,
    vehicle: resolution.vehicle,
    resolvedAt: new Date().toISOString(),
  };
  saveQrCode(payload.qrCode);
  writeJson(PURCHASE_STORAGE_KEYS.qrResolve, payload);
  return payload;
}

export function getResolvedQr(): StoredQrResolve | null {
  const stored = readJson(PURCHASE_STORAGE_KEYS.qrResolve);
  if (!stored || typeof stored !== 'object') {
    return null;
  }
  return stored as StoredQrResolve;
}

export function saveVehicle(vehicle: StoredVehicle): StoredVehicle {
  if (!vehicle.registration.trim()) {
    return vehicle;
  }
  writeJson(PURCHASE_STORAGE_KEYS.vehicle, vehicle);
  return vehicle;
}

export function patchVehicle(patch: Partial<StoredVehicle>): StoredVehicle | null {
  const current = getVehicle();
  const registration = (patch.registration ?? current?.registration ?? '').trim();
  if (!registration) {
    return current;
  }
  const next: StoredVehicle = {
    ...current,
    ...patch,
    registration,
  };
  saveVehicle(next);
  return next;
}

export function getVehicle(): StoredVehicle | null {
  const stored = readJson(PURCHASE_STORAGE_KEYS.vehicle);
  if (!stored || typeof stored !== 'object') {
    return null;
  }
  const vehicle = stored as StoredVehicle;
  if (!vehicle.registration.trim()) {
    return null;
  }
  return vehicle;
}

export function saveCheckout(checkout: Omit<StoredCheckout, 'updatedAt'>): StoredCheckout {
  const payload: StoredCheckout = {
    ...checkout,
    updatedAt: new Date().toISOString(),
  };
  writeJson(PURCHASE_STORAGE_KEYS.order, payload);
  return payload;
}

export function patchCheckout(patch: Partial<Omit<StoredCheckout, 'updatedAt'>>): StoredCheckout | null {
  const current = getCheckout();
  const next: StoredCheckout = {
    orderId: patch.orderId ?? current?.orderId ?? null,
    totalPaise: patch.totalPaise ?? current?.totalPaise ?? null,
    orderStatus: patch.orderStatus ?? current?.orderStatus ?? null,
    paymentRef: patch.paymentRef ?? current?.paymentRef ?? null,
    updatedAt: new Date().toISOString(),
  };
  writeJson(PURCHASE_STORAGE_KEYS.order, next);
  return next;
}

export function getCheckout(): StoredCheckout | null {
  const stored = readJson(PURCHASE_STORAGE_KEYS.order);
  if (!stored || typeof stored !== 'object') {
    return null;
  }
  return stored as StoredCheckout;
}

export function clearCheckout(): void {
  removeKey(PURCHASE_STORAGE_KEYS.order);
}

export function saveAttachResult(result: Omit<StoredAttachResult, 'attachedAt'>): StoredAttachResult {
  const payload: StoredAttachResult = {
    ...result,
    attachedAt: new Date().toISOString(),
  };
  writeJson(PURCHASE_STORAGE_KEYS.attach, payload);
  return payload;
}

export function getAttachResult(): StoredAttachResult | null {
  const stored = readJson(PURCHASE_STORAGE_KEYS.attach);
  if (!stored || typeof stored !== 'object') {
    return null;
  }
  return stored as StoredAttachResult;
}

export function clearAttachResult(): void {
  removeKey(PURCHASE_STORAGE_KEYS.attach);
}

export function clearPurchaseStorage(): void {
  removeQrCodeEverywhere();
  removeKey(PURCHASE_STORAGE_KEYS.qrResolve);
  removeKey(PURCHASE_STORAGE_KEYS.vehicle);
  removeKey(PURCHASE_STORAGE_KEYS.order);
  removeKey(PURCHASE_STORAGE_KEYS.attach);
}
