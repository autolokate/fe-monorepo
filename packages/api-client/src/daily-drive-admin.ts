import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/**
 * Admin Daily Drive catalogue — Nest `/admin/v1/daily-drive/videos*`, OPERATOR plane.
 * Nest verifies every YouTube id against the allow-listed IDG channel (oEmbed) on create;
 * the consumer app reads PUBLISHED rows only (free, `GET /v1/daily-drive/videos`).
 */

export const DAILY_DRIVE_CATEGORIES = [
  'driving',
  'safety',
  'rules',
  'cars',
  'highway',
  'tips',
  'ev',
  'care',
] as const;
export type DailyDriveCategory = (typeof DAILY_DRIVE_CATEGORIES)[number];

export type AdminDailyDriveStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AdminDailyDriveTransition = 'publish' | 'unpublish' | 'archive';

export type AdminDailyDriveVideoDto = {
  videoId: string;
  youtubeVideoId: string;
  channelUrl: string;
  title: string;
  description: string;
  category: DailyDriveCategory;
  durationMinutes: number | null;
  featured: boolean;
  sortOrder: number;
  thumbnailUrl: string;
  watchUrl: string;
  publishedAt: string | null;
  status: AdminDailyDriveStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminDailyDriveVideoBody = {
  /** YouTube URL (watch, youtu.be, shorts, embed) or bare 11-char id. */
  youtube: string;
  category: DailyDriveCategory;
  /** Defaults to the YouTube title. */
  title?: string;
  description?: string;
  durationMinutes?: number;
  featured?: boolean;
  sortOrder?: number;
  /** Create as PUBLISHED instead of DRAFT. */
  publish?: boolean;
};

export type UpdateAdminDailyDriveVideoBody = {
  title?: string;
  description?: string;
  category?: DailyDriveCategory;
  /** `null` clears the duration. */
  durationMinutes?: number | null;
  featured?: boolean;
  sortOrder?: number;
};

type RequestOptions = { signal?: AbortSignal };

function signalOption(options: RequestOptions): RequestOptions {
  return options.signal ? { signal: options.signal } : {};
}

/** GET /admin/v1/daily-drive/videos */
export async function listAdminDailyDriveVideos(
  client: ApiClient,
  query: { status?: AdminDailyDriveStatus; limit?: number } = {},
  options: RequestOptions = {},
): Promise<AdminDailyDriveVideoDto[]> {
  const search = new URLSearchParams();
  if (query.status) search.set('status', query.status);
  if (query.limit) search.set('limit', String(query.limit));
  const qs = search.toString();
  const response = await client.get<unknown>(
    `${endpoints.admin.dailyDriveVideos}${qs ? `?${qs}` : ''}`,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDailyDriveVideoDto[];
}

/** POST /admin/v1/daily-drive/videos — 409 daily_drive_video_exists, 422 youtube_channel_not_allowed. */
export async function createAdminDailyDriveVideo(
  client: ApiClient,
  body: CreateAdminDailyDriveVideoBody,
  options: RequestOptions = {},
): Promise<AdminDailyDriveVideoDto> {
  const response = await client.post<unknown>(
    endpoints.admin.dailyDriveVideos,
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDailyDriveVideoDto;
}

/** PATCH /admin/v1/daily-drive/videos/{id} */
export async function updateAdminDailyDriveVideo(
  client: ApiClient,
  videoId: string,
  body: UpdateAdminDailyDriveVideoBody,
  options: RequestOptions = {},
): Promise<AdminDailyDriveVideoDto> {
  const response = await client.patch<unknown>(
    endpoints.admin.dailyDriveVideo(videoId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDailyDriveVideoDto;
}

/** POST /admin/v1/daily-drive/videos/{id}/publish|unpublish|archive */
export async function transitionAdminDailyDriveVideo(
  client: ApiClient,
  videoId: string,
  transition: AdminDailyDriveTransition,
  options: RequestOptions = {},
): Promise<AdminDailyDriveVideoDto> {
  const response = await client.post<unknown>(
    endpoints.admin.dailyDriveVideoTransition(videoId, transition),
    undefined,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDailyDriveVideoDto;
}
