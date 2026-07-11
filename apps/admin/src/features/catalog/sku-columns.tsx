import type { AdminPlanDto, SkuSummaryDto } from '@autolokate/api-client';
import { AlStatusBadge, AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { ShelfChips } from '@/features/catalog/ShelfChips';
import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';
import { formatPlanRef } from '@/services/catalog/catalog-model';

export function useSkuColumns(
  plansById: ReadonlyMap<string, AdminPlanDto>,
): ColumnDef<SkuSummaryDto>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'skuCode',
        header: 'SKU code',
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
      },
      {
        id: 'shelf',
        header: 'Shelf (offered tiers)',
        accessorFn: (row) => row.offeredTiers.join(' '),
        cell: ({ row }) => <ShelfChips tiers={row.original.offeredTiers} />,
      },
      {
        id: 'defaultPlan',
        header: 'Default plan',
        accessorFn: (row) => {
          if (row.defaultPlanId === null) {
            return '';
          }
          const plan = plansById.get(row.defaultPlanId);
          return plan ? formatPlanRef(plan) : row.defaultPlanId;
        },
        cell: ({ row }) => {
          const { defaultPlanId, defaultPlanVersion } = row.original;
          if (defaultPlanId === null) {
            return <AlStatusBadge label="Not set" status="error" />;
          }
          const plan = plansById.get(defaultPlanId);
          if (!plan) {
            // Plans load separately; fall back to the server-derived version until they arrive.
            return (
              <AlText tone="muted">
                {defaultPlanVersion === null ? 'Unknown plan' : `v${String(defaultPlanVersion)}`}
              </AlText>
            );
          }
          return formatPlanRef(plan);
        },
      },
      {
        accessorKey: 'listPricePaise',
        header: 'List price',
        cell: ({ row }) => formatPaiseAsRupees(row.original.listPricePaise),
      },
      {
        accessorKey: 'active',
        header: 'New batches',
        cell: ({ row }) => (
          <AlStatusBadge
            label={row.original.active ? 'Accepting' : 'Closed'}
            status={row.original.active ? 'active' : 'inactive'}
          />
        ),
      },
    ],
    [plansById],
  );
}
