import type {
  AdminDailyDriveStatus,
  AdminDailyDriveTransition,
  AdminDailyDriveVideoDto,
} from '@autolokate/api-client';
import {
  AlButton,
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { DAILY_DRIVE_CATEGORY_LABEL, DailyDriveSheet } from '@/features/discovery/DailyDriveSheet';
import { formatDiscoveryDateTime, type FilterOption } from '@/features/discovery/discovery-filters';
import {
  useDailyDriveMutations,
  useDailyDriveVideos,
  type DailyDriveStatusFilter,
} from '@/hooks/discovery/useDailyDrive';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { DiscoveryReelStatusBadge } from '@/platform/components/EntityStatusBadge';
import { useCanWriteDiscoveryMutations } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './discovery.css';

const STATUS_FILTERS: FilterOption<DailyDriveStatusFilter>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];

type TransitionTarget = { video: AdminDailyDriveVideoDto; transition: AdminDailyDriveTransition };

const CONFIRM_COPY: Record<
  Exclude<AdminDailyDriveTransition, 'publish'>,
  { title: string; verb: string; description: (title: string) => string; destructive: boolean }
> = {
  unpublish: {
    title: 'Unpublish video?',
    verb: 'Unpublish',
    description: (title) =>
      `"${title}" will leave the consumer Daily Drive and return to draft. You can publish it again later.`,
    destructive: false,
  },
  archive: {
    title: 'Archive video?',
    verb: 'Archive',
    description: (title) =>
      `"${title}" will be removed from the consumer Daily Drive and archived.`,
    destructive: true,
  },
};

function nextTransitions(status: AdminDailyDriveStatus): AdminDailyDriveTransition[] {
  if (status === 'PUBLISHED') return ['unpublish', 'archive'];
  if (status === 'DRAFT') return ['publish', 'archive'];
  return ['publish'];
}

const TRANSITION_LABEL: Record<AdminDailyDriveTransition, string> = {
  publish: 'Publish',
  unpublish: 'Unpublish',
  archive: 'Archive',
};

export function DiscoveryDailyDrivePage() {
  const { videos, isLoading, isFetching, userErrorMessage, status, setStatus, refresh, data } =
    useDailyDriveVideos();
  const canWrite = useCanWriteDiscoveryMutations();
  const { transitionMutation } = useDailyDriveMutations();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<AdminDailyDriveVideoDto | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TransitionTarget | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setSelected(null);
    setSheetOpen(true);
  }, []);

  const openVideo = useCallback((video: AdminDailyDriveVideoDto) => {
    setSelected(video);
    setSheetOpen(true);
  }, []);

  const runTransition = useCallback(
    (target: TransitionTarget) => {
      setPendingId(target.video.videoId);
      transitionMutation.mutate(
        { videoId: target.video.videoId, transition: target.transition },
        {
          onSettled: () => {
            setPendingId(null);
            setConfirmTarget(null);
          },
        },
      );
    },
    [transitionMutation],
  );

  const requestTransition = useCallback(
    (video: AdminDailyDriveVideoDto, transition: AdminDailyDriveTransition) => {
      if (transition === 'publish') {
        runTransition({ video, transition });
        return;
      }
      setConfirmTarget({ video, transition });
    },
    [runTransition],
  );

  const columns = useMemo<ColumnDef<AdminDailyDriveVideoDto>[]>(
    () => [
      {
        id: 'thumb',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="discovery-thumb discovery-thumb--wide">
            <img src={row.original.thumbnailUrl} alt="" loading="lazy" />
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Video',
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">{row.original.title}</span>
            <a
              className="discovery-cell-title__secondary"
              href={row.original.watchUrl}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {row.original.youtubeVideoId}
            </a>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => DAILY_DRIVE_CATEGORY_LABEL[row.original.category],
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DiscoveryReelStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'featured',
        header: 'Featured',
        cell: ({ row }) => (row.original.featured ? 'Yes' : '—'),
      },
      { accessorKey: 'sortOrder', header: 'Order' },
      {
        accessorKey: 'publishedAt',
        header: 'Published',
        cell: ({ row }) => formatDiscoveryDateTime(row.original.publishedAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const video = row.original;
          return (
            <div className="discovery-row-actions">
              {canWrite
                ? nextTransitions(video.status).map((transition) => (
                    <AlButton
                      key={transition}
                      size="sm"
                      variant="secondary"
                      data-testid={`daily-drive-${transition}-${video.videoId}`}
                      loading={
                        pendingId === video.videoId &&
                        transitionMutation.variables?.transition === transition
                      }
                      disabled={pendingId !== null}
                      onClick={(event) => {
                        event.stopPropagation();
                        requestTransition(video, transition);
                      }}
                    >
                      {TRANSITION_LABEL[transition]}
                    </AlButton>
                  ))
                : null}
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`daily-drive-open-${video.videoId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  openVideo(video);
                }}
              >
                {canWrite ? 'Edit' : 'View'}
              </AlButton>
            </div>
          );
        },
      },
    ],
    [canWrite, openVideo, pendingId, requestTransition, transitionMutation.variables],
  );

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Free Daily Drive videos from the Indian Drive Guide channel.';
    }
    const published = videos.filter((video) => video.status === 'PUBLISHED').length;
    return buildPageSummary([
      `${videos.length.toLocaleString()} videos`,
      `${published.toLocaleString()} published`,
      'Indian Drive Guide channel only',
    ]);
  }, [isLoading, videos]);

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="discovery:read">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  const confirmCopy =
    confirmTarget && confirmTarget.transition !== 'publish'
      ? CONFIRM_COPY[confirmTarget.transition]
      : null;

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Daily Drive"
          description={pageDescription}
          actions={
            <>
              {canWrite ? <AlPageHeaderAction label="Add video" onClick={openCreate} /> : null}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
            </>
          }
        />

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={STATUS_FILTERS}
                value={status}
                onChange={setStatus}
                aria-label="Daily Drive status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="discovery-daily-drive"
            columns={columns}
            data={videos}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            enableGlobalSearch={false}
            emptyTitle="No Daily Drive videos"
            emptyDescription={
              canWrite
                ? 'Add a video from the Indian Drive Guide channel or change the filter.'
                : 'Change the filter to see more videos.'
            }
            getRowId={(row) => row.videoId}
            onRowClick={openVideo}
          />
        </AdminDataBlock>

        <DailyDriveSheet
          video={selected}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          canWrite={canWrite}
        />

        <AlConfirmationDialog
          open={confirmTarget !== null && confirmCopy !== null}
          onOpenChange={(open) => {
            if (!open && pendingId === null) {
              setConfirmTarget(null);
            }
          }}
          title={confirmCopy?.title ?? ''}
          description={
            confirmCopy && confirmTarget ? confirmCopy.description(confirmTarget.video.title) : ''
          }
          confirmLabel={confirmCopy?.verb ?? 'Confirm'}
          destructive={confirmCopy?.destructive ?? false}
          loading={pendingId !== null}
          onConfirm={() => {
            if (confirmTarget) {
              runTransition(confirmTarget);
            }
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
