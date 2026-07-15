import type { AdminSupportTicketSummary } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { useSupportColumns } from '@/features/support/support-columns';
import { SUPPORT_STATUS_FILTERS, SUPPORT_TYPE_FILTERS } from '@/features/support/support-filters';
import { UpdateTicketStatusDialog } from '@/features/support/UpdateTicketStatusDialog';
import { useSupportTickets } from '@/hooks/support/useSupportTickets';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { useCanWriteSupportTickets } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

export function SupportTicketsPage() {
  const {
    tickets,
    isLoading,
    isFetching,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    refresh,
  } = useSupportTickets();

  const canTriage = useCanWriteSupportTickets();
  const [triageTarget, setTriageTarget] = useState<AdminSupportTicketSummary | null>(null);

  const columns = useSupportColumns({ canTriage, onChangeStatus: setTriageTarget });

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Browse support tickets and triage their status.';
    }
    return buildPageSummary([`${tickets.length.toLocaleString()} tickets loaded`]);
  }, [isLoading, tickets.length]);

  if (userErrorMessage && tickets.length === 0) {
    return (
      <RequirePermission permission="support:view">
        <AlErrorState
          message={userErrorMessage}
          onRetry={() => {
            refresh();
          }}
        />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="support:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Support Tickets"
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
            isRefreshing={isFetching}
            error={userErrorMessage && tickets.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search subject…"
            emptyTitle="No support tickets found"
            emptyDescription="Try another status or type filter."
            getRowId={(row) => row.ticketId}
          />
        </AdminDataBlock>

        <UpdateTicketStatusDialog
          ticket={triageTarget}
          onOpenChange={(open) => {
            if (!open) {
              setTriageTarget(null);
            }
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
