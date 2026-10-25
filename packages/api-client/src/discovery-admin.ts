import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { readEnvelopeMeta, unwrapEnvelope } from './envelope';

/**
 * Admin Discovery (Community Q&A + Reels) — Nest `/admin/v1/community/*`, OPERATOR plane.
 * DTOs map to the BE `AdminCommunityQuestionDto` / `DiscoveryReelDto` / admin request DTOs.
 */

export const COMMUNITY_QUESTION_KINDS = ['general', 'problem', 'customMods'] as const;
export type CommunityQuestionKind = (typeof COMMUNITY_QUESTION_KINDS)[number];

export const COMMUNITY_QUESTION_CATEGORIES = [
  'problems',
  'maintenance',
  'buying',
  'mods',
  'ev',
  'safety',
  'tyres',
  'insurance',
  'roadTrips',
] as const;
export type CommunityQuestionCategory = (typeof COMMUNITY_QUESTION_CATEGORIES)[number];

/** `VISIBLE` = published to the consumer feed; `HIDDEN` = draft / unpublished. */
export type AdminQaStatus = 'VISIBLE' | 'HIDDEN';
export type AdminQaSort = 'latest' | 'most_answered' | 'updated';

export type AdminCommunityQuestionDto = {
  questionId: string;
  authorAccountId: string;
  authorUsername: string;
  kind: CommunityQuestionKind;
  category: CommunityQuestionCategory;
  title: string;
  body: string;
  vehicleLabel: string | null;
  answerCount: number;
  status: AdminQaStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListAdminCommunityQuestionsQuery = {
  status?: AdminQaStatus;
  category?: CommunityQuestionCategory;
  /** Server-side title/body search (max 120 chars). */
  q?: string;
  sort?: AdminQaSort;
  /** 1–100, server default 20. */
  limit?: number;
  cursor?: string;
};

export type CreateAdminCommunityQuestionBody = {
  kind: CommunityQuestionKind;
  category: CommunityQuestionCategory;
  title: string;
  body?: string;
  vehicleLabel?: string;
  /** Server default `HIDDEN` (draft). */
  status?: AdminQaStatus;
};

export type UpdateAdminCommunityQuestionBody = {
  title?: string;
  body?: string;
  category?: CommunityQuestionCategory;
  kind?: CommunityQuestionKind;
  status?: AdminQaStatus;
  /** `null` clears the label. */
  vehicleLabel?: string | null;
};

export type AdminReelStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AdminReelSort = 'updated' | 'sort_order' | 'published' | 'likes';

/**
 * `DiscoveryReelDto` as returned by the admin plane. `playbackUrl` / `thumbUrl` are short-lived signed
 * URLs and are only populated on the DETAIL read (`GET /reels/{id}`); list rows carry `null`.
 */
export type AdminDiscoveryReelDto = {
  reelId: string;
  stableKey: string;
  title: string;
  caption: string;
  status: AdminReelStatus;
  videoMediaId: string;
  thumbMediaId: string | null;
  playbackUrl: string | null;
  thumbUrl: string | null;
  sortOrder: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Garage/Store partner org attribution (0086). Null when unlinked. */
  partnerOrgId?: string | null;
};

export type ListAdminReelsQuery = {
  status?: AdminReelStatus;
  /** Server-side title / stableKey / caption search (max 120 chars). */
  q?: string;
  sort?: AdminReelSort;
  limit?: number;
  cursor?: string;
};

export type CreateAdminReelBody = {
  stableKey: string;
  title: string;
  caption?: string;
  /** UPLOADED `DISCOVERY_REEL` media, `video/mp4`. */
  videoMediaId: string;
  /** UPLOADED `DISCOVERY_REEL` media, image. */
  thumbMediaId?: string;
  sortOrder?: number;
  /** Create as PUBLISHED instead of DRAFT. */
  publish?: boolean;
  /** Garage/Store partner org to attribute (0086). */
  partnerOrgId?: string;
};

export type UpdateAdminReelBody = {
  title?: string;
  caption?: string;
  videoMediaId?: string;
  /** `null` removes the poster. */
  thumbMediaId?: string | null;
  sortOrder?: number;
  /** Partner org attribution; `null` clears (0086). */
  partnerOrgId?: string | null;
};

/** OpenAPI `PaginationDto` (`meta.pagination`). The BE only emits it when the list handler wires a cursor. */
export type AdminDiscoveryPagination = {
  limit: number;
  cursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
};

export type AdminDiscoveryPageResult<T> = {
  items: T[];
  pagination: AdminDiscoveryPagination | null;
  requestId: string | null;
  correlationId: string | null;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

function readPage<T>(response: unknown): AdminDiscoveryPageResult<T> {
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  return {
    items: unwrapEnvelope(response) as T[],
    pagination:
      pagination &&
      typeof pagination === 'object' &&
      'hasMore' in pagination &&
      'limit' in pagination
        ? (pagination as AdminDiscoveryPagination)
        : null,
    requestId: meta?.requestId ?? null,
    correlationId: meta?.correlationId ?? null,
  };
}

type RequestOptions = { signal?: AbortSignal };

function signalOption(options: RequestOptions): RequestOptions {
  return options.signal ? { signal: options.signal } : {};
}

/** GET /admin/v1/community/questions */
export async function listAdminCommunityQuestionsPage(
  client: ApiClient,
  query: ListAdminCommunityQuestionsQuery = {},
  options: RequestOptions = {},
): Promise<AdminDiscoveryPageResult<AdminCommunityQuestionDto>> {
  const path = `${endpoints.admin.communityQuestions}${buildQuery({
    status: query.status,
    category: query.category,
    q: query.q?.trim(),
    sort: query.sort,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, signalOption(options));
  return readPage<AdminCommunityQuestionDto>(response);
}

/** GET /admin/v1/community/questions/{id} */
export async function getAdminCommunityQuestion(
  client: ApiClient,
  questionId: string,
  options: RequestOptions = {},
): Promise<AdminCommunityQuestionDto> {
  const response = await client.get<unknown>(
    endpoints.admin.communityQuestion(questionId),
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminCommunityQuestionDto;
}

/** POST /admin/v1/community/questions */
export async function createAdminCommunityQuestion(
  client: ApiClient,
  body: CreateAdminCommunityQuestionBody,
  options: RequestOptions = {},
): Promise<AdminCommunityQuestionDto> {
  const response = await client.post<unknown>(
    endpoints.admin.communityQuestions,
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminCommunityQuestionDto;
}

/** PATCH /admin/v1/community/questions/{id} — edit, publish (`VISIBLE`) or hide (`HIDDEN`). */
export async function updateAdminCommunityQuestion(
  client: ApiClient,
  questionId: string,
  body: UpdateAdminCommunityQuestionBody,
  options: RequestOptions = {},
): Promise<AdminCommunityQuestionDto> {
  const response = await client.patch<unknown>(
    endpoints.admin.communityQuestion(questionId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminCommunityQuestionDto;
}

/** GET /admin/v1/community/reels */
export async function listAdminReelsPage(
  client: ApiClient,
  query: ListAdminReelsQuery = {},
  options: RequestOptions = {},
): Promise<AdminDiscoveryPageResult<AdminDiscoveryReelDto>> {
  const path = `${endpoints.admin.communityReels}${buildQuery({
    status: query.status,
    q: query.q?.trim(),
    sort: query.sort,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, signalOption(options));
  return readPage<AdminDiscoveryReelDto>(response);
}

/** GET /admin/v1/community/reels/{id} — the only read that carries signed `playbackUrl` / `thumbUrl`. */
export async function getAdminReel(
  client: ApiClient,
  reelId: string,
  options: RequestOptions = {},
): Promise<AdminDiscoveryReelDto> {
  const response = await client.get<unknown>(
    endpoints.admin.communityReel(reelId),
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDiscoveryReelDto;
}

/** POST /admin/v1/community/reels */
export async function createAdminReel(
  client: ApiClient,
  body: CreateAdminReelBody,
  options: RequestOptions = {},
): Promise<AdminDiscoveryReelDto> {
  const response = await client.post<unknown>(
    endpoints.admin.communityReels,
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDiscoveryReelDto;
}

/** PATCH /admin/v1/community/reels/{id} */
export async function updateAdminReel(
  client: ApiClient,
  reelId: string,
  body: UpdateAdminReelBody,
  options: RequestOptions = {},
): Promise<AdminDiscoveryReelDto> {
  const response = await client.patch<unknown>(
    endpoints.admin.communityReel(reelId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDiscoveryReelDto;
}

export type AdminReelTransition = 'publish' | 'unpublish' | 'archive';

/** POST /admin/v1/community/reels/{id}/publish|unpublish|archive */
export async function transitionAdminReel(
  client: ApiClient,
  reelId: string,
  transition: AdminReelTransition,
  options: RequestOptions = {},
): Promise<AdminDiscoveryReelDto> {
  const path =
    transition === 'publish'
      ? endpoints.admin.publishCommunityReel(reelId)
      : transition === 'unpublish'
        ? endpoints.admin.unpublishCommunityReel(reelId)
        : endpoints.admin.archiveCommunityReel(reelId);
  const response = await client.post<unknown>(path, undefined, signalOption(options));
  return unwrapEnvelope(response) as AdminDiscoveryReelDto;
}
