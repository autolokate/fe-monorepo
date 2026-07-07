import type {
  BatchSummaryDto,
  CreateBatchBody,
  QrAutoDetachResultDto,
  ReorderFulfilResultDto,
  ReplacedDto,
  RetiredDto,
} from '@autolokate/api-client';
import {
  createQrBatch,
  fulfilPartnerReorder,
  generateQrBatchCodes,
  provisionQrBatch,
  qrAutoDetachSweep,
  replaceQrCode,
  retireQrCode,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client.js';

export async function createBatch(
  body: CreateBatchBody,
  signal?: AbortSignal,
): Promise<BatchSummaryDto> {
  return createQrBatch(getAdminApiClient(), body, { signal });
}

export async function generateBatchCodes(
  batchId: string,
  signal?: AbortSignal,
): Promise<BatchSummaryDto> {
  return generateQrBatchCodes(getAdminApiClient(), batchId, { signal });
}

export async function provisionBatch(
  batchId: string,
  signal?: AbortSignal,
): Promise<BatchSummaryDto> {
  return provisionQrBatch(getAdminApiClient(), batchId, { signal });
}

export async function runAutoDetachSweep(signal?: AbortSignal): Promise<QrAutoDetachResultDto> {
  return qrAutoDetachSweep(getAdminApiClient(), { signal });
}

export async function replaceCode(code: string, signal?: AbortSignal): Promise<ReplacedDto> {
  return replaceQrCode(getAdminApiClient(), code, { signal });
}

export async function retireCode(code: string, signal?: AbortSignal): Promise<RetiredDto> {
  return retireQrCode(getAdminApiClient(), code, { signal });
}

export async function fulfilPartnerReorderById(
  reorderId: string,
  signal?: AbortSignal,
): Promise<ReorderFulfilResultDto> {
  return fulfilPartnerReorder(getAdminApiClient(), reorderId, { signal });
}
