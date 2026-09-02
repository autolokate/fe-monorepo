import {
  completeEmergencyMediaUpload,
  completeParkMediaUpload,
  requestEmergencyMediaUpload,
  requestParkMediaUpload,
  type ScanUploadTargetDto,
} from '@autolokate/api-client';

import { getQrBootstrapClient } from '@/platform/api/qr-api-client';
import { env } from '@/config/env';

import { parseDataUrl } from './data-url';
import {
  delay,
  SCANNER_MAX_ATTEMPTS,
  SCANNER_RETRY_BASE_MS,
  withTimeout,
  SCANNER_REQUEST_TIMEOUT_MS,
} from './scanner-network';
import {
  isScannerTransientError,
  mapScannerApiError,
  type ScannerApiError,
} from './scanner-api-errors';
import { scannerLogger } from './scanner-logger';

export type ScanUploadKind = 'park' | 'emergency';

export type ScanUploadResult =
  | { ok: true; mediaId: string }
  | { ok: false; error: ScannerApiError };

async function putToPresignedUrl(target: ScanUploadTargetDto, blob: Blob): Promise<void> {
  const headers = new Headers(target.headers);
  if (!headers.has('ngrok-skip-browser-warning') && env.apiBaseUrl.includes('ngrok')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  const response = await fetch(target.url, {
    method: target.method,
    headers,
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${String(response.status)}`);
  }
}

const inflightUploads = new Map<string, Promise<ScanUploadResult>>();

function uploadInflightKey(kind: ScanUploadKind, slot: string): string {
  return `${kind}:${slot}`;
}

async function uploadWithRetry(
  kind: ScanUploadKind,
  qrCode: string,
  dataUrl: string,
  bystanderSessionToken: string | null,
): Promise<ScanUploadResult> {
  const { blob, contentType, sizeBytes } = parseDataUrl(dataUrl);
  const client = getQrBootstrapClient();

  for (let attempt = 1; attempt <= SCANNER_MAX_ATTEMPTS; attempt += 1) {
    try {
      const presign =
        kind === 'park'
          ? await withTimeout(
              requestParkMediaUpload(client, qrCode, {
                contentType,
                sizeBytes,
                bystanderSessionToken: bystanderSessionToken ?? '',
              }),
              SCANNER_REQUEST_TIMEOUT_MS,
            )
          : await withTimeout(
              requestEmergencyMediaUpload(client, qrCode, { contentType, sizeBytes }),
              SCANNER_REQUEST_TIMEOUT_MS,
            );

      await withTimeout(putToPresignedUrl(presign.upload, blob), SCANNER_REQUEST_TIMEOUT_MS);

      if (kind === 'park') {
        await withTimeout(
          completeParkMediaUpload(client, qrCode, presign.mediaId, {
            bystanderSessionToken: bystanderSessionToken ?? '',
          }),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
      } else {
        await withTimeout(
          completeEmergencyMediaUpload(client, qrCode, presign.mediaId),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
      }

      scannerLogger.info('scan_upload_complete', { kind, mediaId: presign.mediaId });
      return { ok: true, mediaId: presign.mediaId };
    } catch (error) {
      if (isScannerTransientError(error) && attempt < SCANNER_MAX_ATTEMPTS) {
        await delay(SCANNER_RETRY_BASE_MS * attempt);
        continue;
      }
      const mapped = mapScannerApiError(error);
      scannerLogger.warn('scan_upload_failed', { kind, attempt, error: mapped });
      return { ok: false, error: mapped };
    }
  }

  return {
    ok: false,
    error: { code: 'unavailable', message: 'Upload failed.', apiMessage: null },
  };
}

/** Presign → PUT → complete for a single photo — deduped per slot, never aborted on navigation. */
export async function uploadScanPhotoForSlot(input: {
  kind: ScanUploadKind;
  slot: string;
  qrCode: string;
  dataUrl: string;
  bystanderSessionToken?: string | null;
}): Promise<ScanUploadResult> {
  const key = uploadInflightKey(input.kind, input.slot);
  const inflight = inflightUploads.get(key);
  if (inflight) {
    return inflight;
  }

  const promise = uploadWithRetry(
    input.kind,
    input.qrCode,
    input.dataUrl,
    input.bystanderSessionToken ?? null,
  );
  inflightUploads.set(key, promise);

  try {
    return await promise;
  } finally {
    inflightUploads.delete(key);
  }
}

/** Presign → PUT → complete for a single park or emergency scene photo. */
export async function uploadScanPhoto(input: {
  kind: ScanUploadKind;
  qrCode: string;
  dataUrl: string;
  bystanderSessionToken?: string | null;
  slot?: string;
}): Promise<ScanUploadResult> {
  return uploadScanPhotoForSlot({
    kind: input.kind,
    slot: input.slot ?? 'default',
    qrCode: input.qrCode,
    dataUrl: input.dataUrl,
    bystanderSessionToken: input.bystanderSessionToken,
  });
}

/** Best-effort uploads for optional emergency scene photos — failures are dropped. */
export async function uploadEmergencyScenePhotosBestEffort(input: {
  qrCode: string;
  dataUrls: string[];
}): Promise<string[]> {
  const mediaIds: string[] = [];

  for (const [index, dataUrl] of input.dataUrls.entries()) {
    const result = await uploadScanPhotoForSlot({
      kind: 'emergency',
      slot: `scene-${String(index)}`,
      qrCode: input.qrCode,
      dataUrl,
    });
    if (result.ok) {
      mediaIds.push(result.mediaId);
    } else {
      scannerLogger.warn('emergency_scene_upload_skipped', { error: result.error });
    }
  }

  return mediaIds;
}

/** Upload exactly two park photos — blocking then blocked. */
export async function uploadParkPhotos(input: {
  qrCode: string;
  blockingDataUrl: string;
  blockedDataUrl: string;
  bystanderSessionToken: string;
}): Promise<{ ok: true; photoIds: [string, string] } | { ok: false; error: ScannerApiError }> {
  const blocking = await uploadScanPhotoForSlot({
    kind: 'park',
    slot: 'front',
    qrCode: input.qrCode,
    dataUrl: input.blockingDataUrl,
    bystanderSessionToken: input.bystanderSessionToken,
  });
  if (!blocking.ok) {
    return blocking;
  }

  const blocked = await uploadScanPhotoForSlot({
    kind: 'park',
    slot: 'rear',
    qrCode: input.qrCode,
    dataUrl: input.blockedDataUrl,
    bystanderSessionToken: input.bystanderSessionToken,
  });
  if (!blocked.ok) {
    return blocked;
  }

  return { ok: true, photoIds: [blocking.mediaId, blocked.mediaId] };
}
