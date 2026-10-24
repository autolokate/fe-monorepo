import { throwAdminProductBlocked } from '@/platform/api/product-blocked';

/** GET …/codes/export — G0-4 Absent. Fail closed (no CSV fetch). */
export function downloadQrBatchCodesCsv(
  _batchId: string,
  _signal?: AbortSignal,
): Promise<{ blob: Blob; filename: string }> {
  throwAdminProductBlocked('GET /admin/v1/qr-batches/{id}/codes/export');
}
