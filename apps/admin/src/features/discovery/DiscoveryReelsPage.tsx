import type { AdminDiscoveryReelDto, AdminReelTransition } from '@autolokate/api-client';
import {
  AlButton,
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlSearchInput,
  AlSelect,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import { REEL_SORT_OPTIONS, REEL_STATUS_FILTERS } from '@/features/discovery/discovery-filters';
import { useReelColumns } from '@/features/discovery/reel-columns';
import { ReelSheet } from '@/features/discovery/ReelSheet';
import { useDiscoveryMutations } from '@/hooks/discovery/useDiscoveryMutations';
import { useDiscoveryReels } from '@/hooks/discovery/useDiscoveryReels';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { useCanWriteDiscoveryMutations } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './discovery.css';

type TransitionTarget = { reel: AdminDiscoveryReelDto; transition: AdminReelTransition };

const CONFIRM_COPY: Record<
  Exclude<AdminReelTransition, 'publish'>,
  { title: string; verb: string; description: (title: string) => string; destructive: boolean }
> = {
  unpublish: {
    title: 'Unpublish reel?',
    verb: 'Unpublish',
    description: (title) =>
      `"${title}" will disappear from the consumer feed and return to draft. You can publish it again later.`,
    destructive: false,
  },
  archive: {
    title: 'Archive reel?',
    verb: 'Archive',
    description: (title) =>
      `"${title}" will be removed from the consumer feed and archived. Engagement history is kept.`,
    destructive: true,
  },
};

export function DiscoveryReelsPage() {
  const {
    reels,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    mayBeTruncated,
    userErrorMessage,
    status,
    setStatus,
    sort,
    setSort,
    search,
    setSearch,
    refresh,
    data,
  } = useDiscoveryReels();

  const canWrite = useCanWriteDiscoveryMutations();
  const { transitionReelMutation } = useDiscoveryMutations();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<AdminDiscoveryReelDto | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<TransitionTarget | null>(null);
  const [pendingReelId, setPendingReelId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setSelected(null);
    setSheetOpen(true);
  }, []);

  const openReel = useCallback((reel: AdminDiscoveryReelDto) => {
    setSelected(reel);
    setSheetOpen(true);
  }, []);

  const runTransition = useCallback(
    (target: TransitionTarget) => {
      setPendingReelId(target.reel.reelId);
      transitionReelMutation.mutate(
        { reelId: target.reel.reelId, transition: target.transition },
        {
          onSettled: () => {
            setPendingReelId(null);
            setConfirmTarget(null);
          },
        },
      );
    },
    [transitionReelMutation],
  );

  const requestTransition = useCallback(
    (reel: AdminDiscoveryReelDto, transition: AdminReelTransition) => {
      if (transition === 'publish') {
        runTransition({ reel, transition });
        return;
      }
      setConfirmTarget({ reel, transition });
    },
    [runTransition],
  );

  const columns = useReelColumns({
    canWrite,
    pendingReelId,
    onTransition: requestTransition,
    onOpen: openReel,
  });

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Upload, publish and archive Discovery reels.';
    }
    const published = reels.filter((reel) => reel.status === 'PUBLISHED').length;
    const drafts = reels.filter((reel) => reel.status === 'DRAFT').length;
    return buildPageSummary([
      `${reels.length.toLocaleString()}${mayBeTruncated || hasNextPage ? '+' : ''} reels loaded`,
      `${published.toLocaleString()} published`,
      `${drafts.toLocaleString()} draft`,
    ]);
  }, [hasNextPage, isLoading, mayBeTruncated, reels]);

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
          title="Discovery Reels"
          description={pageDescription}
          actions={
            <>
              {canWrite ? <AlPageHeaderAction label="New reel" onClick={openCreate} /> : null}
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
            <>
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={REEL_STATUS_FILTERS}
                  value={status}
                  onChange={setStatus}
                  aria-label="Reel status"
                />
              </AdminFilterField>
              <AdminFilterField label="Sort">
                <AlSelect
                  compact
                  aria-label="Reel sort"
                  options={REEL_SORT_OPTIONS}
                  value={sort}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    setSort(event.target.value as typeof sort);
                  }}
                />
              </AdminFilterField>
              <AdminFilterField label="Search">
                <AlSearchInput
                  compact
                  value={search}
                  onChange={setSearch}
                  placeholder="Search title, key or caption…"
                  ariaLabel="Search reels"
                />
              </AdminFilterField>
            </>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="discovery-reels"
            columns={columns}
            data={reels}
            loading={isLoading}
            isRefreshing={isFetching && !isFetchingNextPage}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            enableGlobalSearch={false}
            emptyTitle="No reels found"
            emptyDescription={
              canWrite
                ? 'Upload a reel or change the filters.'
                : 'Change the filters to see more reels.'
            }
            getRowId={(row) => row.reelId}
            onRowClick={openReel}
          />
        </AdminDataBlock>

        {hasNextPage ? (
          <div className="discovery-load-more">
            <AlButton
              variant="secondary"
              size="sm"
              data-testid="discovery-reels-load-more"
              loading={isFetchingNextPage}
              onClick={() => {
                void fetchNextPage();
              }}
            >
              Load more
            </AlButton>
          </div>
        ) : null}
        {mayBeTruncated ? (
          <AlText tone="muted" variant="caption">
            Showing the first 100 results. Narrow the list with a filter or search to find the rest.
          </AlText>
        ) : null}

        <ReelSheet
          reel={selected}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          canWrite={canWrite}
          onRequestTransition={requestTransition}
        />

        <AlConfirmationDialog
          open={confirmTarget !== null && confirmCopy !== null}
          onOpenChange={(open) => {
            if (!open && pendingReelId === null) {
              setConfirmTarget(null);
            }
          }}
          title={confirmCopy?.title ?? ''}
          description={
            confirmCopy && confirmTarget ? confirmCopy.description(confirmTarget.reel.title) : ''
          }
          confirmLabel={confirmCopy?.verb ?? 'Confirm'}
          destructive={confirmCopy?.destructive ?? false}
          loading={pendingReelId !== null}
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
