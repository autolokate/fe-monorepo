import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useState } from 'react';

import { SupportTicketDetailSheet } from '@/features/support/SupportTicketDetailSheet';
import { useSupportColumns } from '@/features/support/support-columns';
import { SUPPORT_STATUS_FILTERS, SUPPORT_TYPE_FILTERS } from '@/features/support/support-filters';
import { useSupportTickets } from '@/hooks/support/useSupportTickets';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { useCanWriteSupportTickets } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

/**
 * Support tickets — keyset list filtered by status/type, detail + triage (status, ops note).
 * Customer message bodies are never decrypted on the admin plane; the detail says so explicitly.
 */
export function SupportTicketsPage() {
  const {
    tickets,
    hasMore,
    isLoading,
    isFetching,
    isFetchingNextPage,
    notDeployed,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    refresh,
    loadMore,
  } = useSupportTickets();
  const canTriage = useCanWriteSupportTickets();
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const columns = useSupportColumns();

  const header = (
    <AlPageHeader
      title="Tickets"
      description="Customer support tickets."
      actions={
        <AlPageHeaderAction
          label={isFetching ? 'Refreshing…' : 'Refresh'}
          loading={isFetching}
          variant="secondary"
          onClick={refresh}
        />
      }
    />
  );

  if (notDeployed) {
    return (
      <RequirePermission permission="support:view">
        <AlStack gap="md">
          {header}
          <AdminNotDeployedState title="Support tickets" endpoint="GET /admin/v1/support/tickets" />
        </AlStack>
      </RequirePermission>
    );
  }

  if (userErrorMessage && tickets.length === 0) {
    return (
      <RequirePermission permission="support:view">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="support:view">
      <AlStack gap="md">
        {header}

        <AdminDataBlock
          filters={
            <>
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={SUPPORT_STATUS_FILTERS}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  aria-label="Ticket status"
                />
              </AdminFilterField>
              <AdminFilterField label="Type">
                <AdminFilterChips
                  options={SUPPORT_TYPE_FILTERS}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  aria-label="Ticket type"
                />
              </AdminFilterField>
            </>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="support-tickets"
            columns={columns}
            data={tickets}
            loading={isLoading}
            isRefreshing={isFetching && !isFetchingNextPage}
            error={userErrorMessage && tickets.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search subject…"
            emptyTitle="No tickets"
            emptyDescription="No tickets match these filters."
            getRowId={(row) => row.ticketId}
            onRowClick={(row) => {
              setOpenTicketId(row.ticketId);
            }}
          />
          {hasMore ? (
            <div className="admin-page-actions">
              <AlButton
                size="sm"
                variant="secondary"
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
                onClick={loadMore}
              >
                Load more
              </AlButton>
            </div>
          ) : null}
        </AdminDataBlock>

        <SupportTicketDetailSheet
          ticketId={openTicketId}
          canTriage={canTriage}
          onOpenChange={(open) => {
            if (!open) {
              setOpenTicketId(null);
            }
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
