import {
  ApiError,
  createAdminDailyDriveVideo,
  listAdminDailyDriveVideos,
  transitionAdminDailyDriveVideo,
  updateAdminDailyDriveVideo,
  type AdminDailyDriveStatus,
  type AdminDailyDriveTransition,
  type AdminDailyDriveVideoDto,
  type CreateAdminDailyDriveVideoBody,
  type UpdateAdminDailyDriveVideoBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import {
  describeDiscoveryReadError,
  describeDiscoverySubmitError,
} from '@/services/discovery/discovery-errors';

const NOT_PROVISIONED_MESSAGE =
  'The Daily Drive catalogue is not provisioned on this environment yet (database migration 0087 pending).';

function isNotProvisioned(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'feature_not_provisioned';
}

export function describeDailyDriveReadError(error: unknown): string {
  return isNotProvisioned(error) ? NOT_PROVISIONED_MESSAGE : describeDiscoveryReadError(error);
}

export function describeDailyDriveSubmitError(error: unknown): string {
  if (isNotProvisioned(error)) {
    return NOT_PROVISIONED_MESSAGE;
  }
  if (error instanceof ApiError && error.code === 'youtube_channel_not_allowed') {
    return 'That video is not from an approved channel. Daily Drive only accepts Indian Drive Guide uploads.';
  }
  if (error instanceof ApiError && error.code === 'daily_drive_video_exists') {
    return 'That video is already in the Daily Drive catalogue.';
  }
  return describeDiscoverySubmitError(error);
}

/** GET /admin/v1/daily-drive/videos */
export async function fetchDailyDriveVideos(
  status: AdminDailyDriveStatus | undefined,
  signal?: AbortSignal,
): Promise<AdminDailyDriveVideoDto[]> {
  return listAdminDailyDriveVideos(getAdminApiClient(), { status, limit: 200 }, { signal });
}

/** POST /admin/v1/daily-drive/videos — Nest verifies the IDG channel before saving. */
export async function createDailyDriveVideo(
  body: CreateAdminDailyDriveVideoBody,
): Promise<AdminDailyDriveVideoDto> {
  return createAdminDailyDriveVideo(getAdminApiClient(), body);
}

/** PATCH /admin/v1/daily-drive/videos/{id} */
export async function updateDailyDriveVideo(
  videoId: string,
  body: UpdateAdminDailyDriveVideoBody,
): Promise<AdminDailyDriveVideoDto> {
  return updateAdminDailyDriveVideo(getAdminApiClient(), videoId, body);
}

/** POST /admin/v1/daily-drive/videos/{id}/publish|unpublish|archive */
export async function transitionDailyDriveVideo(
  videoId: string,
  transition: AdminDailyDriveTransition,
): Promise<AdminDailyDriveVideoDto> {
  return transitionAdminDailyDriveVideo(getAdminApiClient(), videoId, transition);
}
