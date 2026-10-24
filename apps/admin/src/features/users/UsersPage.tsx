import type { AdminUserSummaryDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlInput,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlStatusBadge,
  AlText,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { CustomerDrilldown } from '@/features/users/CustomerDrilldown';
import { useUsersColumns } from '@/features/users/users-columns';
import { useAdminUserCareRecords } from '@/hooks/users/useAdminUserCareRecords';
import { useAdminUserDetail } from '@/hooks/users/useAdminUserDetail';
import { useAdminUsers } from '@/hooks/users/useAdminUsers';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminDetailField } from '@/platform/components/AdminDetailField';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './users.css';

const STATUS_FILTERS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ALL', label: 'All' },
] as const;

const TYPE_FILTERS = [
  { value: 'ALL', label: 'All types' },
  { value: 'CONSUMER', label: 'Consumer' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'INTERNAL', label: 'Internal' },
] as const;

function UserDetailPanel({
  account,
  searchPhone,
  onClose,
}: {
  account: AdminUserSummaryDto;
  searchPhone: string | null;
  onClose: () => void;
}) {
  const canWrite = useAdminPermission('users:write');
  const {
    detail,
    vehicles,
    isLoading,
    detailError,
    vehiclesError,
    vehiclesLoading,
    patchMutation,
    refresh: refreshDetail,
  } = useAdminUserDetail(account.id);
  const {
    expenses,
    expensesLoading,
    expensesError,
    maintenanceJobs,
    maintenanceJobsLoading,
    maintenanceJobsError,
    maintenanceSchedule,
    maintenanceScheduleLoading,
    maintenanceScheduleError,
    vehicleDocuments,
    vehicleDocumentsLoading,
    vehicleDocumentsError,
    emergencyContacts,
    emergencyContactsLoading,
    emergencyContactsError,
    isFetching: careFetching,
    refresh: refreshCare,
  } = useAdminUserCareRecords(account.id);

  const refresh = () => {
    refreshDetail();
    refreshCare();
  };

  const [localeDraft, setLocaleDraft] = useState(account.locale);

  return (
    <section className="admin-user-account" aria-label="Account detail">
      <AlStack gap="md">
        <div className="admin-page-actions">
          <AlButton type="button" size="sm" variant="secondary" onClick={onClose}>
            Back to directory
          </AlButton>
          <AlButton
            type="button"
            size="sm"
            variant="secondary"
            loading={isLoading || careFetching}
            onClick={refresh}
          >
            Refresh
          </AlButton>
        </div>

        {detailError ? <AlErrorState message={detailError} onRetry={refresh} /> : null}

        <AdminDetailField label="Account id" value={account.id} mono />
        {searchPhone ? (
          <>
            <AdminDetailField label="Phone search" value={searchPhone} mono />
            <AlText variant="caption" tone="muted">
              Matched via blind index — the API never returns the phone.
            </AlText>
          </>
        ) : null}
        <AdminDetailField
          label="Display name"
          value={detail?.name ?? (isLoading ? 'Loading…' : '—')}
        />
        <AdminDetailField label="Account type" value={detail?.accountType ?? account.accountType} />
        <AdminDetailField label="Status" value={detail?.status ?? account.status} />
        <AdminDetailField
          label="Created"
          value={new Date((detail ?? account).createdAt).toLocaleString()}
        />

        <AlStack gap="xs">
          <AlText variant="caption" tone="muted">
            Active roles
          </AlText>
          <div className="admin-user-account__roles">
            {(detail?.roles ?? account.roles).length === 0 ? (
              <AlText tone="muted">No active roles.</AlText>
            ) : (
              (detail?.roles ?? account.roles).map((role) => (
                <AlStatusBadge
                  key={`${role.role}:${role.scopeRef ?? 'platform'}`}
                  label={role.role}
                  status="inactive"
                />
              ))
            )}
          </div>
        </AlStack>

        {canWrite ? (
          <AlStack gap="sm">
            <AlText variant="caption" tone="muted">
              Authorized edits
            </AlText>
            <AlInput
              label="Locale"
              value={localeDraft}
              onChange={(event) => {
                setLocaleDraft(event.target.value);
              }}
              helperText="Phone, identity, and subscription changes use dedicated workflows — not this form."
              data-testid="users-edit-locale"
            />
            <div className="admin-page-actions">
              <AlButton
                type="button"
                size="sm"
                data-testid="users-save-locale"
                loading={patchMutation.isPending}
                disabled={
                  patchMutation.isPending || localeDraft === (detail?.locale ?? account.locale)
                }
                onClick={() => {
                  void patchMutation.mutateAsync({ locale: localeDraft }).then(refresh);
                }}
              >
                Save locale
              </AlButton>
              <AlButton
                type="button"
                size="sm"
                variant="secondary"
                data-testid="users-flag-review"
                loading={patchMutation.isPending}
                disabled={patchMutation.isPending || (detail ?? account).fraudFlagged}
                onClick={() => {
                  void patchMutation.mutateAsync({ fraudFlagged: true }).then(refresh);
                }}
              >
                Flag for review
              </AlButton>
            </div>
            <p className="admin-inline-alert" data-testid="users-delete-unavailable">
              Permanent delete is unavailable here. Accounts are closed only through DPDP erasure
              (data-rights / self DELETE /v1/account) so ownership and financial evidence stay
              intact. Use Flag for review for ops follow-up.
            </p>
          </AlStack>
        ) : null}

        <AlStack gap="xs">
          <AlText variant="caption" tone="muted">
            Vehicles (all owned, including UNPROTECTED)
          </AlText>
          {vehiclesError ? (
            <AlErrorState message={vehiclesError} onRetry={refresh} />
          ) : (
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="account-vehicles"
              columns={[
                { id: 'plate', header: 'Plate', accessorKey: 'plate' },
                { id: 'make', header: 'Make', accessorKey: 'make' },
                { id: 'model', header: 'Model', accessorKey: 'model' },
                { id: 'protection', header: 'Protection', accessorKey: 'protection' },
              ]}
              data={vehicles}
              loading={vehiclesLoading}
              emptyTitle="No vehicles"
              emptyDescription="This account has no owned vehicles yet."
              getRowId={(row) => row.vehicleId}
            />
          )}
        </AlStack>

        <AlStack gap="xs">
          <AlText variant="caption" tone="muted">
            Expenses
          </AlText>
          {expensesError ? (
            <AlErrorState message={expensesError} onRetry={refresh} />
          ) : (
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="account-expenses"
              columns={[
                { id: 'title', header: 'Title', accessorKey: 'title' },
                { id: 'category', header: 'Category', accessorKey: 'category' },
                { id: 'amountInr', header: 'Amount (INR)', accessorKey: 'amountInr' },
                { id: 'occurredOn', header: 'Occurred', accessorKey: 'occurredOn' },
                { id: 'vehicleId', header: 'Vehicle', accessorKey: 'vehicleId' },
              ]}
              data={expenses}
              loading={expensesLoading}
              emptyTitle="No expenses"
              emptyDescription="This account has no personal expenses yet."
              getRowId={(row) => row.id}
            />
          )}
        </AlStack>

        <AlStack gap="xs">
          <AlText variant="caption" tone="muted">
            Maintenance jobs
          </AlText>
          {maintenanceJobsError ? (
            <AlErrorState message={maintenanceJobsError} onRetry={refresh} />
          ) : (
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="account-maintenance-jobs"
              columns={[
                { id: 'title', header: 'Title', accessorKey: 'title' },
                { id: 'status', header: 'Status', accessorKey: 'status' },
                { id: 'dueOn', header: 'Due', accessorKey: 'dueOn' },
                {
                  id: 'estimatedCostInr',
                  header: 'Est. cost (INR)',
                  accessorKey: 'estimatedCostInr',
                },
              ]}
              data={maintenanceJobs}
              loading={maintenanceJobsLoading}
              emptyTitle="No maintenance jobs"
              emptyDescription="This account has no maintenance jobs yet."
              getRowId={(row) => row.id}
            />
          )}
        </AlStack>

        <AlStack gap="xs">
          <AlText variant="caption" tone="muted">
            Maintenance schedule
          </AlText>
          {maintenanceScheduleError ? (
            <AlErrorState message={maintenanceScheduleError} onRetry={refresh} />
          ) : (
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="account-maintenance-schedule"
              columns={[
                { id: 'title', header: 'Title', accessorKey: 'title' },
                { id: 'nextDueOn', header: 'Next due', accessorKey: 'nextDueOn' },
                { id: 'source', header: 'Source', accessorKey: 'source' },
              ]}
              data={maintenanceSchedule}
              loading={maintenanceScheduleLoading}
              emptyTitle="No maintenance schedule"
              emptyDescription="This account has no maintenance schedule entries yet."
              getRowId={(row) => row.id}
            />
          )}
        </AlStack>

        <AlStack gap="xs">
          <AlText variant="caption" tone="muted">
            Vehicle documents
          </AlText>
          {vehicleDocumentsError ? (
            <AlErrorState message={vehicleDocumentsError} onRetry={refresh} />
          ) : (
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="account-vehicle-documents"
              columns={[
                { id: 'title', header: 'Title', accessorKey: 'title' },
                { id: 'documentKind', header: 'Kind', accessorKey: 'documentKind' },
                { id: 'vehicleId', header: 'Vehicle', accessorKey: 'vehicleId' },
              ]}
              data={vehicleDocuments}
              loading={vehicleDocumentsLoading}
              emptyTitle="No vehicle documents"
              emptyDescription="This account has no vehicle document metadata yet."
              getRowId={(row) => row.id}
            />
          )}
        </AlStack>

        <AlStack gap="xs">
          <AlText variant="caption" tone="muted">
            Emergency contacts
          </AlText>
          {emergencyContactsError ? (
            <AlErrorState message={emergencyContactsError} onRetry={refresh} />
          ) : (
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="account-emergency-contacts"
              columns={[
                { id: 'name', header: 'Name', accessorKey: 'name' },
                { id: 'relation', header: 'Relation', accessorKey: 'relation' },
                { id: 'phoneMasked', header: 'Phone', accessorKey: 'phoneMasked' },
              ]}
              data={emergencyContacts}
              loading={emergencyContactsLoading}
              emptyTitle="No emergency contacts"
              emptyDescription="This account has no emergency contacts yet."
              getRowId={(row) => row.id}
            />
          )}
        </AlStack>

        <CustomerDrilldown accountId={account.id} />
      </AlStack>
    </section>
  );
}

/**
 * Customers directory — Nest `GET /admin/v1/users` (keyset + phone blind-index).
 * Detail / vehicles / authorized PATCH. Role grant/revoke and permanent delete stay unavailable.
 */
export function UsersPage() {
  const {
    users,
    isLoading,
    isFetching,
    userErrorMessage,
    phoneInput,
    setPhoneInput,
    phoneApplied,
    applyPhoneSearch,
    clearPhoneSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    refresh,
  } = useAdminUsers();

  const [selected, setSelected] = useState<AdminUserSummaryDto | null>(null);
  const columns = useUsersColumns();

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Browse accounts by phone or filters. Phone is matched on a blind index — never stored by this screen.';
    }
    return buildPageSummary([`${users.length.toLocaleString()} accounts loaded`]);
  }, [isLoading, users.length]);

  if (userErrorMessage && users.length === 0 && !selected) {
    return (
      <RequirePermission permission="users:read">
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
    <RequirePermission permission="users:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Customers"
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

        {selected ? (
          <UserDetailPanel
            account={selected}
            searchPhone={phoneApplied ?? null}
            onClose={() => {
              setSelected(null);
            }}
          />
        ) : (
          <>
            <section className="admin-user-lookup" aria-label="Search accounts">
              <AlStack gap="md">
                <AlInput
                  label="Phone search"
                  mono
                  autoComplete="off"
                  placeholder="+919876543210 or 9876543210"
                  data-testid="users-lookup-phone"
                  value={phoneInput}
                  onChange={(event) => {
                    setPhoneInput(event.target.value);
                  }}
                  helperText="E.164, Indian 10-digit, or 91-prefixed. Server-side blind-index match — no download-all."
                />
                <div className="admin-page-actions">
                  <AlButton
                    type="button"
                    size="sm"
                    data-testid="users-lookup-submit"
                    loading={isFetching}
                    onClick={applyPhoneSearch}
                  >
                    Search phone
                  </AlButton>
                  {phoneApplied ? (
                    <AlButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={clearPhoneSearch}
                    >
                      Clear phone
                    </AlButton>
                  ) : null}
                </div>
              </AlStack>
            </section>

            <AdminDataBlock
              filters={
                <>
                  <AdminFilterField label="Status">
                    <AdminFilterChips
                      options={[...STATUS_FILTERS]}
                      value={statusFilter}
                      onChange={(value) => {
                        setStatusFilter(value);
                      }}
                      aria-label="Account status"
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Type">
                    <AdminFilterChips
                      options={[...TYPE_FILTERS]}
                      value={typeFilter}
                      onChange={(value) => {
                        setTypeFilter(value);
                      }}
                      aria-label="Account type family"
                    />
                  </AdminFilterField>
                </>
              }
            >
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="admin-users"
                columns={columns}
                data={users}
                loading={isLoading}
                isRefreshing={isFetching}
                error={userErrorMessage && users.length > 0 ? userErrorMessage : null}
                onRetry={refresh}
                globalSearchPlaceholder="Filter this page…"
                emptyTitle="No accounts found"
                emptyDescription={
                  phoneApplied
                    ? 'No account matches that phone on the blind index.'
                    : 'Try another status or type filter.'
                }
                getRowId={(row) => row.id}
                onRowClick={(row) => {
                  setSelected(row);
                }}
              />
            </AdminDataBlock>
          </>
        )}
      </AlStack>
    </RequirePermission>
  );
}
