import type { AdminCommunityReplyDto } from '@autolokate/api-client';
import {
  AlButton,
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlSearchInput,
  AlStack,
  AlText,
  type ColumnDef,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { formatDiscoveryDateTime, QA_STATUS_FILTERS } from '@/features/discovery/discovery-filters';
import { useDiscoveryReplies, useModerateReply } from '@/hooks/discovery/useDiscoveryReplies';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip } from '@/platform/components/AdminWowSurface';
import { DiscoveryQaStatusBadge } from '@/platform/components/EntityStatusBadge';
import { useCanWriteDiscoveryMutations } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { REPLIES_LIST_LIMIT } from '@/services/discovery/admin-replies-service';

import './discovery.css';

function replyKpisFromPage(replies: AdminCommunityReplyDto[]) {
  let published = 0;
  let hidden = 0;
  for (const reply of replies) {
    if (reply.status === 'VISIBLE') published += 1;
    else hidden += 1;
  }
  return [
    { label: 'On this page', value: String(replies.length) },
    { label: 'Published', value: String(published) },
    { label: 'Hidden', value: String(hidden) },
  ];
}

function excerpt(body: string, max = 140): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

export function DiscoveryRepliesPage() {
  const {
    replies,
    isLoading,
    isFetching,
    userErrorMessage,
    status,
    setStatus,
    search,
    setSearch,
    refresh,
    data,
  } = useDiscoveryReplies();
  const canWrite = useCanWriteDiscoveryMutations();
  const moderate = useModerateReply();
  const [hideTarget, setHideTarget] = useState<AdminCommunityReplyDto | null>(null);
  const pendingId = moderate.isPending ? moderate.variables.replyId : null;

  const restore = useCallback(
    (reply: AdminCommunityReplyDto) => {
      moderate.mutate({ replyId: reply.replyId, status: 'VISIBLE' });
    },
    [moderate],
  );

  const columns = useMemo<ColumnDef<AdminCommunityReplyDto>[]>(
    () => [
      {
        accessorKey: 'body',
        header: 'Reply',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="discovery-cell-title">
            <span className="discovery-cell-title__primary">{excerpt(row.original.body)}</span>
            <span className="discovery-cell-title__secondary">
              {row.original.questionTitle
                ? `On: ${row.original.questionTitle}`
                : 'Question unavailable'}
            </span>
          </div>
        ),
      },
      {
        id: 'author',
        header: 'Author',
        cell: ({ row }) =>
          row.original.authorUsername ? `@${row.original.authorUsername}` : 'No handle',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DiscoveryQaStatusBadge status={row.original.status} />,
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
          const reply = row.original;
          if (!canWrite) {
            return null;
          }
          const hidden = reply.status === 'HIDDEN';
          return (
            <div className="discovery-row-actions">
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`reply-${hidden ? 'restore' : 'hide'}-${reply.replyId}`}
                loading={pendingId === reply.replyId}
                disabled={pendingId !== null}
                onClick={(event) => {
                  event.stopPropagation();
                  if (hidden) {
                    restore(reply);
                  } else {
                    setHideTarget(reply);
                  }
                }}
              >
                {hidden ? 'Restore' : 'Hide'}
              </AlButton>
            </div>
          );
        },
      },
    ],
    [canWrite, pendingId, restore],
  );

  const kpiItems = useMemo(() => (replies.length > 0 ? replyKpisFromPage(replies) : []), [replies]);

  const pageDescription = 'Moderate member replies under Q&A answers.';

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="discovery:read">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Q&A replies"
          description={pageDescription}
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <>
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={QA_STATUS_FILTERS}
                  value={status}
                  onChange={setStatus}
                  aria-label="Reply status"
                />
              </AdminFilterField>
              <AdminFilterField label="Search">
                <AlSearchInput
                  compact
                  value={search}
                  onChange={setSearch}
                  placeholder="Search reply text…"
                  ariaLabel="Search replies"
                />
              </AdminFilterField>
            </>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="discovery-replies"
            columns={columns}
            data={replies}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            enableGlobalSearch={false}
            emptyTitle="No replies"
            emptyDescription="No replies match this filter."
            getRowId={(row) => row.replyId}
          />
          {replies.length >= REPLIES_LIST_LIMIT ? (
            <AlText tone="muted" variant="caption">
              Showing the newest {REPLIES_LIST_LIMIT} replies. Search or filter to find older ones.
            </AlText>
          ) : null}
        </AdminDataBlock>

        <AlConfirmationDialog
          open={hideTarget !== null}
          onOpenChange={(open) => {
            if (!open && pendingId === null) {
              setHideTarget(null);
            }
          }}
          title="Hide reply?"
          description={
            hideTarget
              ? `"${excerpt(hideTarget.body, 80)}" will disappear from the consumer app. You can restore it later.`
              : ''
          }
          confirmLabel="Hide"
          destructive
          loading={pendingId !== null}
          onConfirm={() => {
            if (hideTarget) {
              moderate.mutate(
                { replyId: hideTarget.replyId, status: 'HIDDEN' },
                {
                  onSettled: () => {
                    setHideTarget(null);
                  },
                },
              );
            }
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
