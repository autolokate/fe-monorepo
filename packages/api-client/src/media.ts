import { ApiError, type ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** Nest `schema.mediaKind` values the Admin Discovery console uploads. */
export type MediaKind = 'DISCOVERY_REEL';

/** Maps to OpenAPI `RequestUploadDto` — POST /v1/media. */
export type RequestMediaUploadBody = {
  kind: MediaKind;
  contentType: string;
  sizeBytes: number;
};

/** Maps to OpenAPI `UploadTargetDto`. */
export type MediaUploadTargetDto = {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresInSeconds: number;
};

/** Maps to OpenAPI `RequestUploadResponseDto`. */
export type RequestMediaUploadResponseDto = {
  mediaId: string;
  upload: MediaUploadTargetDto;
};

/** Maps to OpenAPI `MediaCompletedDto`. */
export type MediaCompletedDto = {
  mediaId: string;
  status: 'UPLOADED';
};

/** Maps to OpenAPI `MediaDownloadDto`. */
export type MediaDownloadDto = {
  url: string;
  expiresInSeconds: number;
};

/** POST /v1/media — presigned upload target (Admin uses the same endpoint with its OPERATOR token). */
export async function requestMediaUpload(
  client: ApiClient,
  body: RequestMediaUploadBody,
  options: { signal?: AbortSignal } = {},
): Promise<RequestMediaUploadResponseDto> {
  const response = await client.post<unknown>(endpoints.media.request, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as RequestMediaUploadResponseDto;
}

/** POST /v1/media/{id}/complete — server re-verifies the stored object (size + type). */
export async function completeMediaUpload(
  client: ApiClient,
  mediaId: string,
  options: { signal?: AbortSignal } = {},
): Promise<MediaCompletedDto> {
  const response = await client.post<unknown>(endpoints.media.complete(mediaId), undefined, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as MediaCompletedDto;
}

/** GET /v1/media/{id} — short-lived signed download URL (never cache or log). */
export async function getMediaDownloadUrl(
  client: ApiClient,
  mediaId: string,
  options: { signal?: AbortSignal } = {},
): Promise<MediaDownloadDto> {
  const response = await client.get<unknown>(endpoints.media.download(mediaId), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as MediaDownloadDto;
}

export type UploadMediaStage = 'requesting' | 'uploading' | 'completing';

export type UploadMediaOptions = {
  signal?: AbortSignal;
  onStage?: (stage: UploadMediaStage) => void;
  /** Override for tests; defaults to the global `fetch`. */
  fetchImpl?: typeof fetch;
};

/**
 * Full presign → PUT bytes → complete pipeline for one file. Returns the media id only after the server
 * has confirmed `UPLOADED` — a failed PUT or complete throws and never yields an id to attach.
 */
export async function uploadMediaFile(
  client: ApiClient,
  kind: MediaKind,
  file: Blob & { type: string },
  options: UploadMediaOptions = {},
): Promise<MediaCompletedDto> {
  const { signal, onStage, fetchImpl } = options;
  const doFetch = fetchImpl ?? globalThis.fetch.bind(globalThis);
  const signalOption = signal ? { signal } : {};

  onStage?.('requesting');
  const target = await requestMediaUpload(
    client,
    { kind, contentType: file.type, sizeBytes: file.size },
    signalOption,
  );

  onStage?.('uploading');
  const put = await doFetch(target.upload.url, {
    method: target.upload.method,
    headers: target.upload.headers,
    body: file,
    ...signalOption,
  });
  if (!put.ok) {
    throw new ApiError(
      `Media upload to storage failed (HTTP ${String(put.status)}).`,
      502,
      'media_upload_failed',
    );
  }

  onStage?.('completing');
  return completeMediaUpload(client, target.mediaId, signalOption);
}
