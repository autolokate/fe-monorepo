import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { catalogQueryKeys } from '@/hooks/catalog/catalog-query-keys';
import { DISCOVERY_LIST_LIMIT, discoveryQueryKeys } from '@/hooks/discovery/discovery-query-keys';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { fetchAdminPlans } from '@/services/catalog/admin-catalog-service';
import {
  fetchDiscoveryQuestionsPage,
  fetchDiscoveryReelsPage,
} from '@/services/discovery/admin-discovery-service';
import { describeDiscoveryReadError } from '@/services/discovery/discovery-errors';

export type DiscoveryOverviewCounts = {
  total: number;
  published: number;
  /** HIDDEN questions / DRAFT reels. */
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
  const canReadCatalog = useAdminPermission('catalog:read');
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

  const plansQuery = useQuery({
    queryKey: catalogQueryKeys.plansList('ALL'),
    queryFn: ({ signal }) => fetchAdminPlans({}, signal),
    enabled: canRead && canReadCatalog,
    meta: { errorMessage: 'Unable to load plans.' },
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

  const livePlans = plansQuery.data?.filter((plan) => plan.isEffectiveNow).length ?? null;

  return {
    questions,
    reels,
    engagement,
    livePlans,
    planVersions: plansQuery.data?.length ?? null,
    questionsError: questionsQuery.isError
      ? describeDiscoveryReadError(questionsQuery.error)
      : null,
    reelsError: reelsQuery.isError ? describeDiscoveryReadError(reelsQuery.error) : null,
    plansError: plansQuery.isError,
    isLoading: questionsQuery.isLoading || reelsQuery.isLoading,
    isFetching: questionsQuery.isFetching || reelsQuery.isFetching || plansQuery.isFetching,
    refresh: () => {
      void questionsQuery.refetch();
      void reelsQuery.refetch();
      void plansQuery.refetch();
    },
  };
}
