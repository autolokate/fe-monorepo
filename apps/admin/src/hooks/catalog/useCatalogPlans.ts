import type { ApiPlanTier } from '@autolokate/api-client';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { catalogQueryKeys } from '@/hooks/catalog/catalog-query-keys';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchAdminPlans, fetchPlanFeatures } from '@/services/catalog/admin-catalog-service';

export type PlanTierFilter = ApiPlanTier | 'ALL';

/**
 * Every plan version (the history is the point — a retired version still prices live Subscriptions).
 *
 * The fetch is deliberately UNFILTERED even though the API takes `?tier=`: the SKU tab's shelf and
 * default-plan pickers read this same list, and narrowing it server-side would silently shrink the tiers a
 * SKU may offer. The tier filter is therefore applied client-side, over a bounded list (four tiers × a few
 * versions), leaving `plans` authoritative for the coupling and `filteredPlans` for the table.
 *
 * Feature counts come from one `GET /plans/{id}/features` per version, each cached under its own key — a
 * cheap fan-out that is what lets the table flag the blank-card case (zero features) at a glance.
 */
export function useCatalogPlans(initialTierFilter: PlanTierFilter = 'ALL') {
  const [tierFilter, setTierFilter] = useState<PlanTierFilter>(initialTierFilter);

  const query = useQuery({
    queryKey: catalogQueryKeys.plansList('ALL'),
    queryFn: ({ signal }) => fetchAdminPlans({}, signal),
    meta: { errorMessage: 'Unable to load plans.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'catalog:plans', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const plans = useMemo(() => query.data ?? [], [query.data]);

  const filteredPlans = useMemo(
    () => (tierFilter === 'ALL' ? plans : plans.filter((plan) => plan.tier === tierFilter)),
    [plans, tierFilter],
  );

  const featureQueries = useQueries({
    queries: plans.map((plan) => ({
      queryKey: catalogQueryKeys.planFeatures(plan.id),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchPlanFeatures(plan.id, signal),
      staleTime: 60_000,
      meta: { errorMessage: 'Unable to load plan features.' },
    })),
  });

  const featureCountByPlanId = useMemo(() => {
    const counts = new Map<string, number | null>();
    plans.forEach((plan, index) => {
      const result = featureQueries[index];
      counts.set(plan.id, result?.data ? result.data.features.length : null);
    });
    return counts;
  }, [featureQueries, plans]);

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    /** Every version, unfiltered — the source of truth for the SKU shelf/default-plan coupling. */
    plans,
    /** The tier-filtered view, for the plans table only. */
    filteredPlans,
    featureCountByPlanId,
    tierFilter,
    setTierFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
