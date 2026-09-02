import type { AdminPlanDto } from '@autolokate/api-client';
import { AlStatusBadge, AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';
import {
  formatEffectiveWindow,
  getPlanLifecycle,
  planTierLabel,
  type PlanLifecycle,
} from '@/services/catalog/catalog-model';

function lifecycleTone(lifecycle: PlanLifecycle): 'active' | 'pending' | 'inactive' {
  switch (lifecycle) {
    case 'LIVE':
      return 'active';
    case 'SCHEDULED':
    case 'DRAFT':
      return 'pending';
    case 'RETIRED':
      return 'inactive';
  }
}

function lifecycleLabel(lifecycle: PlanLifecycle): string {
  return lifecycle === 'LIVE' ? 'Live' : lifecycle.charAt(0) + lifecycle.slice(1).toLowerCase();
}

export function usePlanColumns(
  featureCountByPlanId: ReadonlyMap<string, number | null>,
): ColumnDef<AdminPlanDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'tier',
        header: 'Tier',
        cell: ({ row }) => planTierLabel(row.original.tier),
      },
      {
        accessorKey: 'version',
        header: 'Version',
        cell: ({ row }) => `v${String(row.original.version)}`,
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'pricePaise',
        header: 'Price',
        cell: ({ row }) => formatPaiseAsRupees(row.original.pricePaise),
      },
      {
        accessorKey: 'riderEligible',
        header: 'Rider',
        cell: ({ row }) => (row.original.riderEligible ? 'Eligible' : '—'),
      },
      {
        id: 'window',
        header: 'Effective window',
        accessorFn: (row) => formatEffectiveWindow(row),
        cell: ({ row }) => formatEffectiveWindow(row.original),
      },
      {
        id: 'lifecycle',
        header: 'Status',
        accessorFn: (row) => getPlanLifecycle(row),
        cell: ({ row }) => {
          const lifecycle = getPlanLifecycle(row.original);
          return (
            <AlStatusBadge label={lifecycleLabel(lifecycle)} status={lifecycleTone(lifecycle)} />
          );
        },
      },
      {
        id: 'features',
        header: 'Features',
        accessorFn: (row) => featureCountByPlanId.get(row.id) ?? -1,
        cell: ({ row }) => {
          const count = featureCountByPlanId.get(row.original.id);
          if (count === null || count === undefined) {
            return <AlText tone="muted">…</AlText>;
          }
          if (count === 0) {
            // Zero bullets renders a blank plan card in the app — call it out, do not just print "0".
            return <AlStatusBadge label="None — blank card" status="inactive" />;
          }
          return `${String(count)} bullets`;
        },
      },
    ],
    [featureCountByPlanId],
  );
}
