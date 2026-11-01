import { exportQrBatchCodesCsv, type QrCodeStatus } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/**
 * GET /admin/v1/qr-batches/{id}/codes/export[?status=] — print-house CSV (`code,status,createdAt`).
 * Fetched with the operator's bearer token (a plain link would be unauthenticated), then handed to
 * the browser as a Blob download.
 */
export async function downloadQrBatchCodesCsv(
  batchId: string,
  status?: QrCodeStatus,
  signal?: AbortSignal,
): Promise<{ filename: string }> {
  const { blob, filename } = await exportQrBatchCodesCsv(getAdminApiClient(), batchId, {
    ...(status ? { status } : {}),
    ...(signal ? { signal } : {}),
  });
  saveBlob(blob, filename);
  return { filename };
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Defer the revoke so the browser has started reading the blob.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  }
}
