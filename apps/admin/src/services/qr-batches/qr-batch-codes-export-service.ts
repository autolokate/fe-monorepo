import { exportQrBatchCodesCsv } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function downloadQrBatchCodesCsv(
  batchId: string,
  signal?: AbortSignal,
): Promise<{ blob: Blob; filename: string }> {
  return exportQrBatchCodesCsv(getAdminApiClient(), batchId, { signal });
}
