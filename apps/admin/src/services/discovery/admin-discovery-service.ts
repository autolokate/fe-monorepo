import {
  createAdminCommunityQuestion,
  createAdminReel,
  getAdminCommunityQuestion,
  getAdminReel,
  listAdminCommunityQuestionsPage,
  listAdminReelsPage,
  transitionAdminReel,
  updateAdminCommunityQuestion,
  updateAdminReel,
  uploadMediaFile,
  type AdminCommunityQuestionDto,
  type AdminDiscoveryPageResult,
  type AdminDiscoveryReelDto,
  type AdminReelTransition,
  type CreateAdminCommunityQuestionBody,
  type CreateAdminReelBody,
  type ListAdminCommunityQuestionsQuery,
  type ListAdminReelsQuery,
  type MediaCompletedDto,
  type UpdateAdminCommunityQuestionBody,
  type UpdateAdminReelBody,
  type UploadMediaStage,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/community/questions */
export async function fetchDiscoveryQuestionsPage(
  query: ListAdminCommunityQuestionsQuery = {},
  signal?: AbortSignal,
): Promise<AdminDiscoveryPageResult<AdminCommunityQuestionDto>> {
  return listAdminCommunityQuestionsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/community/questions/{id} */
export async function fetchDiscoveryQuestion(
  questionId: string,
  signal?: AbortSignal,
): Promise<AdminCommunityQuestionDto> {
  return getAdminCommunityQuestion(getAdminApiClient(), questionId, { signal });
}

/** POST /admin/v1/community/questions */
export async function createDiscoveryQuestion(
  body: CreateAdminCommunityQuestionBody,
  signal?: AbortSignal,
): Promise<AdminCommunityQuestionDto> {
  return createAdminCommunityQuestion(getAdminApiClient(), body, { signal });
}

/** PATCH /admin/v1/community/questions/{id} — edit, publish (VISIBLE) or hide (HIDDEN). */
export async function updateDiscoveryQuestion(
  questionId: string,
  body: UpdateAdminCommunityQuestionBody,
  signal?: AbortSignal,
): Promise<AdminCommunityQuestionDto> {
  return updateAdminCommunityQuestion(getAdminApiClient(), questionId, body, { signal });
}

/** GET /admin/v1/community/reels */
export async function fetchDiscoveryReelsPage(
  query: ListAdminReelsQuery = {},
  signal?: AbortSignal,
): Promise<AdminDiscoveryPageResult<AdminDiscoveryReelDto>> {
  return listAdminReelsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/community/reels/{id} — signed playback + poster URLs. */
export async function fetchDiscoveryReel(
  reelId: string,
  signal?: AbortSignal,
): Promise<AdminDiscoveryReelDto> {
  return getAdminReel(getAdminApiClient(), reelId, { signal });
}

/** POST /admin/v1/community/reels */
export async function createDiscoveryReel(
  body: CreateAdminReelBody,
  signal?: AbortSignal,
): Promise<AdminDiscoveryReelDto> {
  return createAdminReel(getAdminApiClient(), body, { signal });
}

/** PATCH /admin/v1/community/reels/{id} */
export async function updateDiscoveryReel(
  reelId: string,
  body: UpdateAdminReelBody,
  signal?: AbortSignal,
): Promise<AdminDiscoveryReelDto> {
  return updateAdminReel(getAdminApiClient(), reelId, body, { signal });
}

/** POST /admin/v1/community/reels/{id}/publish|unpublish|archive */
export async function transitionDiscoveryReel(
  reelId: string,
  transition: AdminReelTransition,
  signal?: AbortSignal,
): Promise<AdminDiscoveryReelDto> {
  return transitionAdminReel(getAdminApiClient(), reelId, transition, { signal });
}

/** POST /v1/media (kind DISCOVERY_REEL) → PUT bytes → POST /v1/media/{id}/complete. */
export async function uploadDiscoveryReelMedia(
  file: File,
  options: { signal?: AbortSignal; onStage?: (stage: UploadMediaStage) => void } = {},
): Promise<MediaCompletedDto> {
  return uploadMediaFile(getAdminApiClient(), 'DISCOVERY_REEL', file, options);
}
