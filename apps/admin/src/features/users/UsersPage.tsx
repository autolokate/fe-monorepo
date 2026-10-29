import type { AdminUserSummaryDto, AdminUserVehicleDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { CustomerDrilldown } from '@/features/users/CustomerDrilldown';
import { filterCareByVehicleId } from '@/features/users/filter-care-by-vehicle';
import { useUsersColumns } from '@/features/users/users-columns';
import { useAdminUserCareRecords } from '@/hooks/users/useAdminUserCareRecords';
import { useAdminUserDetail } from '@/hooks/users/useAdminUserDetail';
import { useAdminUsers } from '@/hooks/users/useAdminUsers';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './users.css';

/** Care lists are GET-only today — show honestly (no fabricate write). */
const CARE_RO_CAPTION = 'Care records are read-only.';

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

function protectionLabel(value: string): string {
  return humanizeAdminLabel(value);
}

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
    serviceLogs,
    serviceLogsLoading,
    serviceLogsError,
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const selectedVehicle: AdminUserVehicleDto | null = useMemo(
    () => vehicles.find((row) => row.vehicleId === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  const vehicleExpenses = useMemo(
    () => filterCareByVehicleId(expenses, selectedVehicleId),
    [expenses, selectedVehicleId],
  );
  const vehicleMaintenanceJobs = useMemo(
    () => filterCareByVehicleId(maintenanceJobs, selectedVehicleId),
    [maintenanceJobs, selectedVehicleId],
  );
  const vehicleMaintenanceSchedule = useMemo(
    () => filterCareByVehicleId(maintenanceSchedule, selectedVehicleId),
    [maintenanceSchedule, selectedVehicleId],
  );
  const vehicleServiceLogs = useMemo(
    () => filterCareByVehicleId(serviceLogs, selectedVehicleId),
    [serviceLogs, selectedVehicleId],
  );
  const vehicleDocs = useMemo(
    () => filterCareByVehicleId(vehicleDocuments, selectedVehicleId),
    [vehicleDocuments, selectedVehicleId],
  );

  const accountType = detail?.accountType ?? account.accountType;
  const accountStatus = detail?.status ?? account.status;
  const roles = detail?.roles ?? account.roles;

  const closeAccount = () => {
    setSelectedVehicleId(null);
    onClose();
  };

  return (
    <AlStack gap="md" aria-label="Account detail">
      <div className="admin-user-account__actions">
        {selectedVehicle ? (
          <AlButton
            type="button"
            size="sm"
            variant="secondary"
            data-testid="users-back-to-account"
            onClick={() => {
              setSelectedVehicleId(null);
            }}
          >
            Back to account
          </AlButton>
        ) : (
          <AlButton type="button" size="sm" variant="secondary" onClick={closeAccount}>
            Back to directory
          </AlButton>
        )}
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

      {selectedVehicle ? (
        <>
          <AdminPanel
            title={selectedVehicle.plate || 'Vehicle'}
            subtitle="Care records for this vehicle."
            meta={
              <AdminStatusChip label={protectionLabel(selectedVehicle.protection)} tone="neutral" />
            }
          >
            <AlText variant="caption" tone="muted" data-testid="users-vehicle-care-ro">
              {CARE_RO_CAPTION}
            </AlText>
            <AdminDetailGrid>
              <AdminDetailField
                label="Vehicle id"
                value={shortAdminId(selectedVehicle.vehicleId)}
                mono
              />
              <AdminDetailField label="Plate" value={selectedVehicle.plate} />
              <AdminDetailField
                label="Make / model"
                value={
                  [selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(' ') || '—'
                }
              />
              <AdminDetailField
                label="Protection"
                value={protectionLabel(selectedVehicle.protection)}
              />
              <AdminDetailField
                label="Ownership verified"
                value={
                  selectedVehicle.ownershipVerifiedAt
                    ? new Date(selectedVehicle.ownershipVerifiedAt).toLocaleString()
                    : 'Not verified'
                }
              />
              <AdminDetailField label="Owner account" value={shortAdminId(account.id)} mono />
            </AdminDetailGrid>
          </AdminPanel>

          <AdminPanel title="Expenses" subtitle="Personal expenses for this vehicle.">
            {expensesError ? (
              <AlErrorState message={expensesError} onRetry={refresh} />
            ) : (
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="vehicle-expenses"
                columns={[
                  { id: 'title', header: 'Title', accessorKey: 'title' },
                  { id: 'category', header: 'Category', accessorKey: 'category' },
                  { id: 'amountInr', header: 'Amount (INR)', accessorKey: 'amountInr' },
                  { id: 'occurredOn', header: 'Occurred', accessorKey: 'occurredOn' },
                ]}
                data={vehicleExpenses}
                loading={expensesLoading}
                emptyTitle="No expenses"
                emptyDescription="No personal expenses for this vehicle."
                getRowId={(row) => row.id}
              />
            )}
          </AdminPanel>

          <AdminPanel title="Maintenance jobs" subtitle="Open and scheduled jobs for this vehicle.">
            {maintenanceJobsError ? (
              <AlErrorState message={maintenanceJobsError} onRetry={refresh} />
            ) : (
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="vehicle-maintenance-jobs"
                columns={[
                  { id: 'title', header: 'Title', accessorKey: 'title' },
                  {
                    id: 'status',
                    header: 'Status',
                    accessorFn: (row) => humanizeAdminLabel(row.status),
                  },
                  { id: 'dueOn', header: 'Due', accessorKey: 'dueOn' },
                  {
                    id: 'estimatedCostInr',
                    header: 'Est. cost (INR)',
                    accessorKey: 'estimatedCostInr',
                  },
                ]}
                data={vehicleMaintenanceJobs}
                loading={maintenanceJobsLoading}
                emptyTitle="No maintenance jobs"
                emptyDescription="No maintenance jobs for this vehicle."
                getRowId={(row) => row.id}
              />
            )}
          </AdminPanel>

          <AdminPanel title="Service logs" subtitle="Completed service visits for this vehicle.">
            {serviceLogsError ? (
              <AlErrorState message={serviceLogsError} onRetry={refresh} />
            ) : (
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="vehicle-service-logs"
                columns={[
                  { id: 'title', header: 'Title', accessorKey: 'title' },
                  { id: 'servicedOn', header: 'Serviced', accessorKey: 'servicedOn' },
                  { id: 'workshop', header: 'Workshop', accessorKey: 'workshop' },
                  { id: 'costInr', header: 'Cost (INR)', accessorKey: 'costInr' },
                  { id: 'odometerKm', header: 'Odometer (km)', accessorKey: 'odometerKm' },
                ]}
                data={vehicleServiceLogs}
                loading={serviceLogsLoading}
                emptyTitle="No service logs"
                emptyDescription="No service logs for this vehicle."
                getRowId={(row) => row.id}
              />
            )}
          </AdminPanel>

          <AdminPanel
            title="Maintenance schedule"
            subtitle="Upcoming maintenance for this vehicle."
          >
            {maintenanceScheduleError ? (
              <AlErrorState message={maintenanceScheduleError} onRetry={refresh} />
            ) : (
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="vehicle-maintenance-schedule"
                columns={[
                  { id: 'title', header: 'Title', accessorKey: 'title' },
                  { id: 'nextDueOn', header: 'Next due', accessorKey: 'nextDueOn' },
                  {
                    id: 'source',
                    header: 'Source',
                    accessorFn: (row) => humanizeAdminLabel(row.source),
                  },
                ]}
                data={vehicleMaintenanceSchedule}
                loading={maintenanceScheduleLoading}
                emptyTitle="No maintenance schedule"
                emptyDescription="No maintenance schedule entries for this vehicle."
                getRowId={(row) => row.id}
              />
            )}
          </AdminPanel>

          <AdminPanel title="Documents" subtitle="Document metadata for this vehicle.">
            {vehicleDocumentsError ? (
              <AlErrorState message={vehicleDocumentsError} onRetry={refresh} />
            ) : (
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="vehicle-documents"
                columns={[
                  { id: 'title', header: 'Title', accessorKey: 'title' },
                  {
                    id: 'documentKind',
                    header: 'Kind',
                    accessorFn: (row) => humanizeAdminLabel(row.documentKind),
                  },
                ]}
                data={vehicleDocs}
                loading={vehicleDocumentsLoading}
                emptyTitle="No vehicle documents"
                emptyDescription="No document metadata for this vehicle."
                getRowId={(row) => row.id}
              />
            )}
          </AdminPanel>
        </>
      ) : (
        <>
          <AdminPanel
            title={detail?.name?.trim() || 'Account'}
            subtitle="Customer profile and account status."
            meta={
              <>
                <AdminStatusChip label={humanizeAdminLabel(accountType)} tone="neutral" />
                <AdminStatusChip
                  label={humanizeAdminLabel(accountStatus)}
                  tone={accountStatus === 'ACTIVE' ? 'active' : 'none'}
                />
              </>
            }
          >
            <AdminDetailGrid>
              <AdminDetailField label="Account" value={shortAdminId(account.id)} mono />
              {searchPhone ? (
                <AdminDetailField label="Phone search" value={searchPhone} mono />
              ) : null}
              <AdminDetailField
                label="Display name"
                value={detail?.name ?? (isLoading ? 'Loading…' : '—')}
              />
              <AdminDetailField label="Account type" value={humanizeAdminLabel(accountType)} />
              <AdminDetailField label="Status" value={humanizeAdminLabel(accountStatus)} />
              <AdminDetailField
                label="Created"
                value={new Date((detail ?? account).createdAt).toLocaleString()}
              />
            </AdminDetailGrid>

            <div className="admin-user-account__roles" aria-label="Active roles">
              {roles.length === 0 ? (
                <AlText tone="muted">No active roles.</AlText>
              ) : (
                roles.map((role) => (
                  <AdminStatusChip
                    key={`${role.role}:${role.scopeRef ?? 'platform'}`}
                    label={humanizeAdminLabel(role.role)}
                    tone="neutral"
                  />
                ))
              )}
            </div>
          </AdminPanel>

          {canWrite ? (
            <AdminPanel
              title="Authorized edits"
              subtitle="Locale and review flag only. Identity and billing use dedicated workflows."
            >
              <div className="admin-form-grid">
                <label className="admin-field">
                  Locale
                  <input
                    value={localeDraft}
                    onChange={(event) => {
                      setLocaleDraft(event.target.value);
                    }}
                    data-testid="users-edit-locale"
                  />
                  <span className="admin-field__hint">
                    Phone and subscription changes use dedicated workflows.
                  </span>
                </label>
              </div>
              <div className="admin-user-account__actions">
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
                Permanent delete is unavailable here. Accounts close only through customer data
                erasure so ownership and financial evidence stay intact. Use Flag for review for ops
                follow-up.
              </p>
            </AdminPanel>
          ) : null}

          <AdminPanel
            title="Emergency contacts"
            subtitle="Account-level contacts. Vehicle care stays on each vehicle."
            meta={
              <AlText variant="caption" tone="muted" data-testid="users-contacts-ro">
                {CARE_RO_CAPTION}
              </AlText>
            }
          >
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
          </AdminPanel>

          <AdminPanel
            title="Vehicles"
            subtitle="All owned vehicles. Open one to view expenses, maintenance, and documents."
          >
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
                  {
                    id: 'protection',
                    header: 'Protection',
                    accessorFn: (row) => protectionLabel(row.protection),
                  },
                  {
                    id: 'ownershipVerifiedAt',
                    header: 'Ownership verified',
                    accessorFn: (row) => row.ownershipVerifiedAt ?? '',
                    cell: ({ row }) =>
                      row.original.ownershipVerifiedAt
                        ? row.original.ownershipVerifiedAt.slice(0, 10)
                        : '—',
                  },
                ]}
                data={vehicles}
                loading={vehiclesLoading}
                emptyTitle="No vehicles"
                emptyDescription="This account has no owned vehicles yet."
                getRowId={(row) => row.vehicleId}
                onRowClick={(row) => {
                  setSelectedVehicleId(row.vehicleId);
                }}
              />
            )}
          </AdminPanel>

          <CustomerDrilldown accountId={account.id} />
        </>
      )}
    </AlStack>
  );
}

/**
 * Customers directory — list + phone search, then account / vehicle care.
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

  const pageDescription = 'Look up customers and review account care.';

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
            <AdminPanel
              title="Phone lookup"
              subtitle="Find an account by Indian mobile or +91 format."
            >
              <div className="admin-form-grid admin-user-lookup">
                <label className="admin-field">
                  Phone search
                  <input
                    autoComplete="off"
                    placeholder="+919876543210 or 9876543210"
                    data-testid="users-lookup-phone"
                    value={phoneInput}
                    onChange={(event) => {
                      setPhoneInput(event.target.value);
                    }}
                  />
                  <span className="admin-field__hint">Indian mobile or +91 format.</span>
                </label>
              </div>
              <div className="admin-user-account__actions">
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
                  <AlButton type="button" size="sm" variant="secondary" onClick={clearPhoneSearch}>
                    Clear phone
                  </AlButton>
                ) : null}
              </div>
            </AdminPanel>

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
                    ? 'No account matches that phone.'
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
