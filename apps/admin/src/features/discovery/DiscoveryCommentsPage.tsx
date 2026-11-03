import type { AdminCommunityCommentDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlSearchInput,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { Fragment, useMemo, useState, type ReactNode } from 'react';

import { formatDiscoveryDateTime } from '@/features/discovery/discovery-filters';
import {
  useCommunityComments,
  useModerateComment,
  type CommentStatusFilter,
} from '@/hooks/discovery/useCommunityComments';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { AdminReasonDialog } from '@/platform/components/AdminReasonDialog';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminKpiStrip,
  AdminStatusChip,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { resolveSubmitErrorMessage } from '@/platform/errors/admin-api-errors';
import { useCanWriteDiscoveryMutations } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './discovery.css';

const COMMENT_STATUS_FILTERS: { value: CommentStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'VISIBLE', label: 'Visible' },
  { value: 'HIDDEN', label: 'Hidden' },
];

function excerpt(body: string, max = 160): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** Renders a comment body with `@handle` mentions highlighted (text only — never HTML). */
export function CommentBody({ body }: { body: string }): ReactNode {
  const parts = excerpt(body).split(/(@[A-Za-z0-9._]{2,40})/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('@') ? (
          <span key={index} className="discovery-mention">
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

type PendingModeration = { comment: AdminCommunityCommentDto; action: 'hide' | 'restore' } | null;

export function DiscoveryCommentsPage() {
  const list = useCommunityComments();
  const canWrite = useCanWriteDiscoveryMutations();
  const moderate = useModerateComment();
  const [pending, setPending] = useState<PendingModeration>(null);

  const columns = useMemo<ColumnDef<AdminCommunityCommentDto>[]>(
    () => [
      {
        accessorKey: 'body',
        header: 'Comment',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">
              <CommentBody body={row.original.body} />
            </span>
            <span className="discovery-cell-title__secondary">
              {row.original.parentCommentId ? '↳ Reply · ' : ''}On: {row.original.reelTitle}
              {row.original.partnerOrgId ? ' · partner clip' : ''}
            </span>
          </div>
        ),
      },
      {
        id: 'author',
        header: 'Author',
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">
              {row.original.authorUsername ? `@${row.original.authorUsername}` : 'No handle'}
            </span>
            <span className="discovery-cell-title__secondary admin-mono">
              {shortAdminId(row.original.authorAccountId)}
            </span>
          </div>
        ),
      },
      {
        id: 'mentions',
        header: 'Mentions',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.mentions.length > 0
            ? row.original.mentions.map((handle) => `@${handle.replace(/^@/, '')}`).join(', ')
            : '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AdminStatusChip
            label={row.original.status === 'VISIBLE' ? 'Visible' : 'Hidden'}
            tone={row.original.status === 'VISIBLE' ? 'published' : 'none'}
          />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Posted',
        cell: ({ row }) => formatDiscoveryDateTime(row.original.createdAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          if (!canWrite) return null;
          const comment = row.original;
          const hidden = comment.status === 'HIDDEN';
          return (
            <div className="discovery-row-actions">
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`comment-${hidden ? 'restore' : 'hide'}-${comment.id}`}
                onClick={(event) => {
                  event.stopPropagation();
                  moderate.reset();
                  setPending({ comment, action: hidden ? 'restore' : 'hide' });
                }}
              >
                {hidden ? 'Restore' : 'Hide'}
              </AlButton>
            </div>
          );
        },
      },
    ],
    [canWrite, moderate],
  );

  const kpis = useMemo(() => {
    if (list.comments.length === 0) return [];
    const hidden = list.comments.filter((comment) => comment.status === 'HIDDEN').length;
    return [
      { label: 'Loaded', value: String(list.comments.length) },
      { label: 'Visible', value: String(list.comments.length - hidden) },
      { label: 'Hidden', value: String(hidden) },
    ];
  }, [list.comments]);

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Comments"
          description="Moderate comments on reels and partner clips. Hiding removes a comment from both apps; every decision is audited."
          actions={
            <AlPageHeaderAction
              label={list.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={list.isFetching}
              variant="secondary"
              onClick={list.refresh}
            />
          }
        />

        {list.notDeployed ? (
          <AdminNotDeployedState
            title="Comment moderation"
            endpoint="GET /admin/v1/community/comments"
          />
        ) : list.userErrorMessage && !list.data ? (
          <AlErrorState message={list.userErrorMessage} onRetry={list.refresh} />
        ) : (
          <>
            {!list.isLoading && kpis.length > 0 ? <AdminKpiStrip items={kpis} /> : null}
            <AdminDataBlock
              filters={
                <>
                  <AdminFilterField label="Status">
                    <AdminFilterChips
                      options={COMMENT_STATUS_FILTERS}
                      value={list.status}
                      onChange={list.setStatus}
                      aria-label="Comment status"
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Search">
                    <AlSearchInput
                      compact
                      value={list.search}
                      onChange={list.setSearch}
                      placeholder="Search comment text…"
                      ariaLabel="Search comments"
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Reel ID">
                    <AlSearchInput
                      compact
                      value={list.reelId}
                      onChange={list.setReelId}
                      placeholder="Reel UUID"
                      ariaLabel="Filter by reel id"
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Partner org ID">
                    <AlSearchInput
                      compact
                      value={list.partnerOrgId}
                      onChange={list.setPartnerOrgId}
                      placeholder="Org UUID"
                      ariaLabel="Filter by partner org id"
                    />
                  </AdminFilterField>
                </>
              }
            >
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="discovery-comments"
                columns={columns}
                data={list.comments}
                loading={list.isLoading}
                isRefreshing={list.isFetching && !list.isFetchingNextPage}
                error={list.userErrorMessage && list.data ? list.userErrorMessage : null}
                onRetry={list.refresh}
                enableGlobalSearch={false}
                emptyTitle="No comments"
                emptyDescription="No comments match these filters."
                getRowId={(row) => row.id}
              />
            </AdminDataBlock>
            <AdminLoadMore
              hasMore={list.hasNextPage}
              loading={list.isFetchingNextPage}
              testId="comments-load-more"
              onLoadMore={() => {
                void list.fetchNextPage();
              }}
            />
          </>
        )}

        <AdminReasonDialog
          open={pending !== null}
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
          title={pending?.action === 'hide' ? 'Hide comment?' : 'Restore comment?'}
          description={
            pending
              ? pending.action === 'hide'
                ? `"${excerpt(pending.comment.body, 80)}" will disappear from the reel in both apps. You can restore it later.`
                : `"${excerpt(pending.comment.body, 80)}" will be visible on the reel again.`
              : undefined
          }
          confirmLabel={pending?.action === 'hide' ? 'Hide comment' : 'Restore comment'}
          required={pending?.action === 'hide'}
          destructive={pending?.action === 'hide'}
          loading={moderate.isPending}
          error={moderate.isError ? resolveSubmitErrorMessage(moderate.error) : null}
          testIdPrefix="comment-moderation"
          onConfirm={(reason) => {
            if (!pending) return;
            moderate.mutate(
              {
                id: pending.comment.id,
                status: pending.action === 'hide' ? 'HIDDEN' : 'VISIBLE',
                ...(reason ? { reason } : {}),
              },
              {
                onSuccess: () => {
                  setPending(null);
                },
              },
            );
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
