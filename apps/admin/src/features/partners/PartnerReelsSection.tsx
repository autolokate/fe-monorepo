import type { AdminPartnerReelSummaryDto } from '@autolokate/api-client';
import { AlDataTable, AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { formatPartnersDateTime } from '@/features/partners/partners-filters';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';

function reelStatusTone(status: string): AdminStatusChipTone {
  if (status === 'PUBLISHED') return 'published';
  if (status === 'DRAFT') return 'draft';
  if (status === 'ARCHIVED') return 'none';
  return 'neutral';
}

type PartnerReelsSectionProps = {
  reels: AdminPartnerReelSummaryDto[];
};

export function PartnerReelsSection({ reels }: PartnerReelsSectionProps) {
  const columns = useMemo<ColumnDef<AdminPartnerReelSummaryDto>[]>(() => {
    const list: ColumnDef<AdminPartnerReelSummaryDto>[] = [
      {
        accessorKey: 'title',
        header: 'Reel',
        cell: ({ row }) => (
          <div className="partners-cell-title">
            <span className="partners-cell-title__primary">{row.original.title}</span>
            <span className="partners-cell-title__secondary">{row.original.stableKey}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AdminStatusChip
            label={humanizeAdminLabel(row.original.status)}
            tone={reelStatusTone(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'publishedAt',
        header: 'Published',
        cell: ({ row }) => formatPartnersDateTime(row.original.publishedAt),
      },
    ];
    return list;
  }, []);

  const published = reels.filter((reel) => reel.status === 'PUBLISHED').length;
  const subtitle =
    reels.length === 0
      ? 'AutoClip inventory linked to this partner.'
      : `${reels.length.toLocaleString()} reel${reels.length === 1 ? '' : 's'}${
          published ? ` · ${published.toLocaleString()} published` : ''
        }`;

  return (
    <div data-testid="partners-reels-section">
      <AdminPanel title="AutoClip inventory" subtitle={subtitle}>
        <AlText tone="muted" variant="caption">
          Engagement (likes, comments, views) and publish / archive controls live in Content →
          Reels.
        </AlText>
        <AlDataTable
          {...ADMIN_LIST_TABLE_PROPS}
          tableId="partner-reels"
          columns={columns}
          data={reels}
          enableGlobalSearch={false}
          emptyTitle="No reels linked to this partner"
          emptyDescription="This partner has no AutoClip reels yet."
          getRowId={(row) => row.reelId}
        />
      </AdminPanel>
    </div>
  );
}
