import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DISCOVERY_LIST_LIMIT, discoveryQueryKeys } from '@/hooks/discovery/discovery-query-keys';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  describeAcademyReadError,
  fetchAcademyCourses,
} from '@/services/discovery/admin-academy-service';
import {
  describeDailyDriveReadError,
  fetchDailyDriveVideos,
} from '@/services/discovery/admin-daily-drive-service';
import {
  fetchDiscoveryQuestionsPage,
  fetchDiscoveryReelsPage,
} from '@/services/discovery/admin-discovery-service';
import { describeDiscoveryReadError } from '@/services/discovery/discovery-errors';

export type DiscoveryOverviewCounts = {
  total: number;
  published: number;
  /** HIDDEN questions / DRAFT reels / unpublished daily-drive. */
  unpublished: number;
  archived: number;
  /** True when the list hit the page cap, so the counts are a lower bound. */
  capped: boolean;
};

/**
 * Counts come from the real list endpoints (first page at the BE max). There is no dedicated Discovery
 * count endpoint, so a full page is reported as a lower bound rather than an exact total.
 */
export function useDiscoveryOverview() {
  const canRead = useAdminPermission('discovery:read');

  const questionsQuery = useQuery({
    queryKey: [...discoveryQueryKeys.overview(), 'questions'],
    queryFn: ({ signal }) => fetchDiscoveryQuestionsPage({ limit: DISCOVERY_LIST_LIMIT }, signal),
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load Q&A.' },
  });

  const reelsQuery = useQuery({
    queryKey: [...discoveryQueryKeys.overview(), 'reels'],
    queryFn: ({ signal }) => fetchDiscoveryReelsPage({ limit: DISCOVERY_LIST_LIMIT }, signal),
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load reels.' },
  });

  const dailyDriveQuery = useQuery({
    queryKey: [...discoveryQueryKeys.overview(), 'daily-drive'],
    queryFn: ({ signal }) => fetchDailyDriveVideos(undefined, signal),
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load Daily Drive.' },
  });

  const academyQuery = useQuery({
    queryKey: [...discoveryQueryKeys.overview(), 'academy'],
    queryFn: ({ signal }) => fetchAcademyCourses(undefined, signal),
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load Academy.' },
  });

  const questions = useMemo<DiscoveryOverviewCounts | null>(() => {
    const page = questionsQuery.data;
    if (!page) {
      return null;
    }
    const published = page.items.filter((item) => item.status === 'VISIBLE').length;
    return {
      total: page.items.length,
      published,
      unpublished: page.items.length - published,
      archived: 0,
      capped: page.pagination?.hasMore === true || page.items.length >= DISCOVERY_LIST_LIMIT,
    };
  }, [questionsQuery.data]);

  const reels = useMemo<DiscoveryOverviewCounts | null>(() => {
    const page = reelsQuery.data;
    if (!page) {
      return null;
    }
    const count = (status: string) => page.items.filter((item) => item.status === status).length;
    return {
      total: page.items.length,
      published: count('PUBLISHED'),
      unpublished: count('DRAFT'),
      archived: count('ARCHIVED'),
      capped: page.pagination?.hasMore === true || page.items.length >= DISCOVERY_LIST_LIMIT,
    };
  }, [reelsQuery.data]);

  const dailyDrive = useMemo<DiscoveryOverviewCounts | null>(() => {
    const items = dailyDriveQuery.data;
    if (!items) {
      return null;
    }
    const count = (status: string) => items.filter((item) => item.status === status).length;
    return {
      total: items.length,
      published: count('PUBLISHED'),
      unpublished: count('DRAFT'),
      archived: count('ARCHIVED'),
      capped: false,
    };
  }, [dailyDriveQuery.data]);

  const academy = useMemo<DiscoveryOverviewCounts | null>(() => {
    const items = academyQuery.data;
    if (!items) {
      return null;
    }
    const count = (status: string) => items.filter((item) => item.status === status).length;
    return {
      total: items.length,
      published: count('PUBLISHED'),
      unpublished: count('DRAFT'),
      archived: count('ARCHIVED'),
      capped: false,
    };
  }, [academyQuery.data]);

  const engagement = useMemo(() => {
    const items = reelsQuery.data?.items;
    if (!items) {
      return null;
    }
    return items.reduce(
      (sum, reel) => ({
        views: sum.views + reel.viewCount,
        likes: sum.likes + reel.likeCount,
        comments: sum.comments + reel.commentCount,
        saves: sum.saves + reel.bookmarkCount,
      }),
      { views: 0, likes: 0, comments: 0, saves: 0 },
    );
  }, [reelsQuery.data]);

  return {
    questions,
    reels,
    dailyDrive,
    academy,
    engagement,
    questionsError: questionsQuery.isError
      ? describeDiscoveryReadError(questionsQuery.error)
      : null,
    reelsError: reelsQuery.isError ? describeDiscoveryReadError(reelsQuery.error) : null,
    dailyDriveError: dailyDriveQuery.isError
      ? describeDailyDriveReadError(dailyDriveQuery.error)
      : null,
    academyError: academyQuery.isError ? describeAcademyReadError(academyQuery.error) : null,
    isLoading: questionsQuery.isLoading || reelsQuery.isLoading,
    isFetching:
      questionsQuery.isFetching ||
      reelsQuery.isFetching ||
      dailyDriveQuery.isFetching ||
      academyQuery.isFetching,
    refresh: () => {
      void questionsQuery.refetch();
      void reelsQuery.refetch();
      void dailyDriveQuery.refetch();
      void academyQuery.refetch();
    },
  };
}
