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

function hasEngagement(reel: AdminPartnerReelSummaryDto): boolean {
  return (
    reel.likeCount != null ||
    reel.commentCount != null ||
    reel.bookmarkCount != null ||
    reel.viewCount != null
  );
}

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
  const showEngagement = reels.some(hasEngagement);

  const columns = useMemo<ColumnDef<AdminPartnerReelSummaryDto>[]>(() => {
    const base: ColumnDef<AdminPartnerReelSummaryDto>[] = [
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

    if (showEngagement) {
      base.push(
        {
          id: 'likes',
          header: 'Likes',
          accessorFn: (row) => row.likeCount ?? null,
          cell: ({ row }) =>
            row.original.likeCount != null ? row.original.likeCount.toLocaleString() : '—',
        },
        {
          id: 'comments',
          header: 'Comments',
          accessorFn: (row) => row.commentCount ?? null,
          cell: ({ row }) =>
            row.original.commentCount != null ? row.original.commentCount.toLocaleString() : '—',
        },
        {
          id: 'bookmarks',
          header: 'Bookmarks',
          accessorFn: (row) => row.bookmarkCount ?? null,
          cell: ({ row }) =>
            row.original.bookmarkCount != null ? row.original.bookmarkCount.toLocaleString() : '—',
        },
        {
          id: 'views',
          header: 'Views',
          accessorFn: (row) => row.viewCount ?? null,
          cell: ({ row }) =>
            row.original.viewCount != null ? row.original.viewCount.toLocaleString() : '—',
        },
      );
    }

    return base;
  }, [showEngagement]);

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
        {!showEngagement && reels.length > 0 ? (
          <AlText tone="muted" variant="caption">
            Engagement counts are not available for these reels.
          </AlText>
        ) : null}
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
