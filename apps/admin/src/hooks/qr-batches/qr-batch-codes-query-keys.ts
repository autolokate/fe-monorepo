import type { QrCodeStatus } from '@autolokate/api-client';

export type QrBatchCodesQueryParams = {
  status?: QrCodeStatus;
  limit: number;
};

export const qrBatchCodesQueryKeys = {
  all: ['admin', 'qr-batch-codes'] as const,
  batch: (batchId: string) => [...qrBatchCodesQueryKeys.all, batchId] as const,
  list: (batchId: string, params: QrBatchCodesQueryParams) =>
    [...qrBatchCodesQueryKeys.batch(batchId), params] as const,
};

export const BATCH_CODES_PAGE_LIMIT = 50;
