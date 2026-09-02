import type { QrResolution } from '@autolokate/api-client';

import {
  getQrCode,
  getResolvedQr,
  saveQrCode,
  saveResolvedQr,
  type StoredQrResolve,
} from '@/storage/index';

/** Read/write QR code and resolve snapshots. */
export const qrStorageRepository = {
  readCode(): string | null {
    return getQrCode();
  },

  writeCode(code: string): void {
    saveQrCode(code);
  },

  readResolved(): StoredQrResolve | null {
    return getResolvedQr();
  },

  writeResolved(code: string, resolution: QrResolution): StoredQrResolve {
    return saveResolvedQr(code, resolution);
  },
};
