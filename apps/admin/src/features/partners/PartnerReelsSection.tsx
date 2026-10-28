import type { AdminPartnerReelSummaryDto } from '@autolokate/api-client';
import { AlDataTable, AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { formatPartnersDateTime } from '@/features/partners/partners-filters';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';

function hasEngagement(reel: AdminPartnerReelSummaryDto): boolean {
  return (
    reel.likeCount != null ||
    reel.commentCount != null ||
    reel.bookmarkCount != null ||
    reel.viewCount != null
  );
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

  return (
    <section className="partners-section" data-testid="partners-reels-section">
      <h2 className="partners-section__heading">
        AutoClip inventory ({reels.length.toLocaleString()}
        {published ? ` · ${published.toLocaleString()} published` : ''})
      </h2>
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
    </section>
  );
}
