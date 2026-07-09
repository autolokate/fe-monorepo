import type { QrResolution } from '@autolokate/api-client';

import { getResolvedQr } from '@/storage/index.js';

/** Ephemeral resolve cache — hydrated from session storage when available. */
let lastResolved: { code: string; resolution: QrResolution } | null = null;

function hydrateFromStorage(): void {
  if (lastResolved) {
    return;
  }
  const stored = getResolvedQr();
  if (!stored) {
    return;
  }
  lastResolved = {
    code: stored.qrCode,
    resolution: {
      qrStatus: stored.qrStatus,
      channel: stored.channel,
      journey: stored.journey,
      offeredSku: stored.offeredSku,
      vehicle: stored.vehicle,
    },
  };
}

export function rememberResolvedQr(code: string, resolution: QrResolution): void {
  lastResolved = { code, resolution };
}

export function peekResolvedQr(code: string): QrResolution | null {
  hydrateFromStorage();
  if (!lastResolved || lastResolved.code !== code) {
    return null;
  }
  return lastResolved.resolution;
}

/** Last resolved CONSUMER_SELF_PAY code — fallback when checkout cache was not hydrated. */
export function peekLastResolvedPurchaseCode(): string | null {
  hydrateFromStorage();
  if (!lastResolved || lastResolved.resolution.journey !== 'CONSUMER_SELF_PAY') {
    return null;
  }
  return lastResolved.code;
}

export function clearResolvedQrCache(): void {
  lastResolved = null;
}
