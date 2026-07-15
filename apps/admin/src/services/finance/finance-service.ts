import type {
  ClawbackBody,
  ClawbackResultDto,
  SettlementBatchResultDto,
} from '@autolokate/api-client';
import { createClawback, runSettlementBatch } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function submitClawback(
  body: ClawbackBody,
  signal?: AbortSignal,
): Promise<ClawbackResultDto> {
  return createClawback(getAdminApiClient(), body, { signal });
}

export async function submitSettlementBatch(
  signal?: AbortSignal,
): Promise<SettlementBatchResultDto> {
  return runSettlementBatch(getAdminApiClient(), { signal });
}
