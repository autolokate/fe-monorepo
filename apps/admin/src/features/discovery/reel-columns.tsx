import type { AdminDiscoveryReelDto, AdminReelTransition } from '@autolokate/api-client';
import { AlButton, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import { formatCount, formatDiscoveryDateTime } from '@/features/discovery/discovery-filters';
import { ReelThumb } from '@/features/discovery/ReelThumb';
import { DiscoveryReelStatusBadge } from '@/platform/components/EntityStatusBadge';

export type UseReelColumnsOptions = {
  canWrite: boolean;
  pendingReelId: string | null;
  onTransition: (reel: AdminDiscoveryReelDto, transition: AdminReelTransition) => void;
  onOpen: (reel: AdminDiscoveryReelDto) => void;
};

export function useReelColumns({
  canWrite,
  pendingReelId,
  onTransition,
  onOpen,
}: UseReelColumnsOptions): ColumnDef<AdminDiscoveryReelDto>[] {
  return useMemo(
    () => [
      {
        id: 'thumb',
        header: '',
        enableSorting: false,
        cell: ({ row }) => <ReelThumb reel={row.original} />,
      },
      {
        accessorKey: 'title',
        header: 'Reel',
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">{row.original.title}</span>
            <span className="discovery-cell-title__secondary">{row.original.stableKey}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DiscoveryReelStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'viewCount',
        header: 'Views',
        cell: ({ row }) => formatCount(row.original.viewCount),
      },
      {
        accessorKey: 'likeCount',
        header: 'Likes',
        cell: ({ row }) => formatCount(row.original.likeCount),
      },
      {
        accessorKey: 'commentCount',
        header: 'Comments',
        cell: ({ row }) => formatCount(row.original.commentCount),
      },
      {
        accessorKey: 'bookmarkCount',
        header: 'Saves',
        cell: ({ row }) => formatCount(row.original.bookmarkCount),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatDiscoveryDateTime(row.original.updatedAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const reel = row.original;
          const pending = pendingReelId === reel.reelId;
          const transition: AdminReelTransition =
            reel.status === 'PUBLISHED' ? 'unpublish' : 'publish';
          return (
            <div className="discovery-row-actions">
              {canWrite ? (
                <AlButton
                  size="sm"
                  variant="secondary"
                  data-testid={`discovery-reel-${transition}-${reel.reelId}`}
                  loading={pending}
                  disabled={pendingReelId !== null}
                  onClick={(event) => {
                    event.stopPropagation();
                    onTransition(reel, transition);
                  }}
                >
                  {transition === 'publish' ? 'Publish' : 'Unpublish'}
                </AlButton>
              ) : null}
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`discovery-reel-open-${reel.reelId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(reel);
                }}
              >
                {canWrite ? 'Edit' : 'View'}
              </AlButton>
            </div>
          );
        },
      },
    ],
    [canWrite, onOpen, onTransition, pendingReelId],
  );
}
