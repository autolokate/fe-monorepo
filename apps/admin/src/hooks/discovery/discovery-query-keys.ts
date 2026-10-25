import type {
  AdminQaSort,
  AdminQaStatus,
  AdminReelSort,
  AdminReelStatus,
  CommunityQuestionCategory,
} from '@autolokate/api-client';

export type DiscoveryQuestionListParams = {
  status: AdminQaStatus | 'ALL';
  category: CommunityQuestionCategory | 'ALL';
  sort: AdminQaSort;
  q: string;
};

export type DiscoveryReelListParams = {
  status: AdminReelStatus | 'ALL';
  sort: AdminReelSort;
  q: string;
};

export const discoveryQueryKeys = {
  all: ['admin', 'discovery'] as const,
  questions: () => [...discoveryQueryKeys.all, 'questions'] as const,
  questionsList: (params: DiscoveryQuestionListParams) =>
    [...discoveryQueryKeys.questions(), 'list', params] as const,
  reels: () => [...discoveryQueryKeys.all, 'reels'] as const,
  reelsList: (params: DiscoveryReelListParams) =>
    [...discoveryQueryKeys.reels(), 'list', params] as const,
  reelDetail: (reelId: string) => [...discoveryQueryKeys.reels(), 'detail', reelId] as const,
  overview: () => [...discoveryQueryKeys.all, 'overview'] as const,
};

/** Admin list page size — the BE maximum, because the list handler does not (yet) return `nextCursor`. */
export const DISCOVERY_LIST_LIMIT = 100;
