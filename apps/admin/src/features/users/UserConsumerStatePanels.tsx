import type {
  AdminUserEntitlementsDto,
  AdminUserStreakDto,
  AdminUserVehicleDto,
  AdminUserVehicleRoleDto,
  AdminVehicleRcStatus,
  AdminVehicleRole,
} from '@autolokate/api-client';
import { AlDataTable, AlErrorState, AlSkeleton, AlStack, AlText } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { VehicleRosterPanel } from '@/features/users/VehicleRosterPanel';
import type { AdminReadState } from '@/hooks/users/useAdminUserConsumerState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

const ROLE_LABEL: Record<AdminVehicleRole, string> = {
  OWNER: 'Owner',
  PROVISIONAL_OWNER: 'Provisional owner',
  DRIVER: 'Driver',
};

const RC_STATUS_LABEL: Record<AdminVehicleRcStatus, string> = {
  NOT_SUBMITTED: 'RC not submitted',
  IN_REVIEW: 'RC in review',
  APPROVED: 'RC approved',
  REJECTED: 'RC rejected',
};

type RcFields = Pick<AdminUserVehicleRoleDto, 'rcStatus' | 'ownershipVerified'>;

/** RC review label — flow v3 `rcStatus` when the server sends it, else the legacy verified flag. */
function rcStatusLabel(row: RcFields): string {
  if (row.rcStatus) return RC_STATUS_LABEL[row.rcStatus];
  return row.ownershipVerified ? 'Verified' : 'Not verified';
}

function rcStatusTone(row: RcFields): 'active' | 'draft' | 'none' | 'neutral' {
  const status = row.rcStatus ?? (row.ownershipVerified ? 'APPROVED' : 'NOT_SUBMITTED');
  if (status === 'APPROVED') return 'active';
  if (status === 'IN_REVIEW') return 'draft';
  if (status === 'REJECTED') return 'none';
  return 'neutral';
}

const FEATURE_ROWS: { key: keyof AdminUserEntitlementsDto['features']; label: string }[] = [
  { key: 'driveQuant', label: 'DriveQuant (trips, driver score, crash detection)' },
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'academy', label: 'Academy videos' },
  { key: 'ai', label: 'Autolokate AI' },
];

function PanelLoading({ testId }: { testId: string }) {
  return (
    <AlStack gap="sm" data-testid={testId} aria-busy="true">
      <AlSkeleton width="45%" height={14} />
      <AlSkeleton width="70%" height={14} />
      <AlSkeleton width="60%" height={14} />
    </AlStack>
  );
}

/** Formats an IST calendar day (`YYYY-MM-DD`) without shifting it through the browser's timezone. */
function formatIstDay(value: string | null | undefined): string {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function UserPlanPanel({
  state,
  onRetry,
  mainVehiclePlate = null,
}: {
  state: AdminReadState<AdminUserEntitlementsDto>;
  onRetry: () => void;
  /** Plate of `mainVehicleId` when it is one of this customer's vehicles. */
  mainVehiclePlate?: string | null;
}) {
  const title = 'Plan & premium access';
  if (state.notDeployed) {
    return (
      <AdminNotDeployedState
        title={title}
        endpoint="GET /admin/v1/users/{userId}/entitlements"
        description="Plan and premium access can't be read on this server yet."
      />
    );
  }
  const data = state.data;
  return (
    <AdminPanel
      title={title}
      subtitle="Exactly what the customer's app sees. Premium features unlock only for a paid account."
      meta={
        data ? (
          <AdminStatusChip
            label={data.paid ? 'Paid' : 'Free'}
            tone={data.paid ? 'active' : 'none'}
          />
        ) : null
      }
    >
      {state.error ? (
        <AlErrorState message={state.error} onRetry={onRetry} />
      ) : state.isLoading || !data ? (
        <PanelLoading testId="users-plan-loading" />
      ) : (
        <AlStack gap="md" data-testid="users-plan">
          <AdminDetailGrid>
            <AdminDetailField
              label="Plan status"
              value={data.paid ? 'Paid' : 'Free (no active plan)'}
            />
            <AdminDetailField
              label="Plan tier"
              value={data.planTier ? humanizeAdminLabel(data.planTier) : '—'}
            />
            <AdminDetailField
              label="Source"
              value={data.source === 'SUBSCRIPTION' ? 'Subscription' : 'None'}
            />
            <AdminDetailField
              label="Renews / expires"
              value={data.expiresAt ? formatAdminDateTime(data.expiresAt) : '—'}
            />
            {data.mainVehicleId !== undefined ? (
              <AdminDetailField
                label="Main vehicle (vehicle premium)"
                value={
                  data.mainVehicleId ? (
                    <span className="admin-mono" title={data.mainVehicleId}>
                      {mainVehiclePlate ?? shortAdminId(data.mainVehicleId)}
                    </span>
                  ) : (
                    '— (no plan)'
                  )
                }
              />
            ) : null}
          </AdminDetailGrid>
          <ul className="admin-user-features" aria-label="Premium features">
            {FEATURE_ROWS.map((row) => {
              const on = data.features[row.key];
              return (
                <li key={row.key} data-testid={`users-feature-${row.key}`}>
                  <span>{row.label}</span>
                  <AdminStatusChip
                    label={on ? 'Unlocked' : 'Locked'}
                    tone={on ? 'active' : 'none'}
                  />
                </li>
              );
            })}
          </ul>
        </AlStack>
      )}
    </AdminPanel>
  );
}

export function UserStreakPanel({
  state,
  onRetry,
}: {
  state: AdminReadState<AdminUserStreakDto>;
  onRetry: () => void;
}) {
  const title = 'Streak';
  if (state.notDeployed) {
    return (
      <AdminNotDeployedState
        title={title}
        endpoint="GET /admin/v1/users/{userId}/streak"
        description="The customer's streak can't be read on this server yet."
      />
    );
  }
  const data = state.data;
  return (
    <AdminPanel
      title={title}
      subtitle="Daily activity streak (IST days). One missed day per Mon–Sun week is forgiven."
      meta={
        data ? (
          <AdminStatusChip
            label={data.todayCompleted ? 'Active today' : 'Not active today'}
            tone={data.todayCompleted ? 'active' : 'none'}
          />
        ) : null
      }
    >
      {state.error ? (
        <AlErrorState message={state.error} onRetry={onRetry} />
      ) : state.isLoading || !data ? (
        <PanelLoading testId="users-streak-loading" />
      ) : (
        <AdminDetailGrid>
          <AdminDetailField label="Current streak" value={`${String(data.current)} days`} />
          <AdminDetailField label="Longest streak" value={`${String(data.longest)} days`} />
          <AdminDetailField label="Last active (IST)" value={formatIstDay(data.lastActiveDate)} />
          <AdminDetailField
            label="Forgiveness this week"
            value={data.forgivenessUsedThisWeek ? 'Used' : 'Available'}
          />
          <AdminDetailField label="Week starting" value={formatIstDay(data.weekStart)} />
          <AdminDetailField label="Next milestone" value={`${String(data.nextMilestone)} days`} />
          <AdminDetailField
            label="Pending celebration"
            value={
              data.celebrate
                ? `${humanizeAdminLabel(data.celebrate.kind)} · ${String(data.celebrate.value)}`
                : 'None'
            }
          />
        </AdminDetailGrid>
      )}
    </AdminPanel>
  );
}

type MembershipRow = AdminUserVehicleRoleDto & {
  vehicle: AdminUserVehicleDto | null;
  isMain: boolean;
};

export function UserVehicleMembershipsPanel({
  state,
  vehicles,
  onRetry,
  onOpenVehicle,
  accountId,
  onOpenAccount,
}: {
  state: AdminReadState<AdminUserEntitlementsDto>;
  vehicles: AdminUserVehicleDto[];
  onRetry: () => void;
  onOpenVehicle: (vehicleId: string) => void;
  /** The account being viewed. */
  accountId: string;
  /** Open another account from a vehicle roster row. */
  onOpenAccount: (accountId: string) => void;
}) {
  const title = 'Vehicle memberships';
  // A membership on a vehicle this customer doesn't own (driver-only) has no care page here —
  // its owner + driver roster opens inline instead.
  const [rosterVehicleId, setRosterVehicleId] = useState<string | null>(null);
  const rows: MembershipRow[] = useMemo(() => {
    const byId = new Map(vehicles.map((vehicle) => [vehicle.vehicleId, vehicle]));
    const mainVehicleId = state.data?.mainVehicleId ?? null;
    return (state.data?.vehicles ?? []).map((entry) => ({
      ...entry,
      vehicle: byId.get(entry.vehicleId) ?? null,
      isMain: mainVehicleId !== null && entry.vehicleId === mainVehicleId,
    }));
  }, [state.data, vehicles]);

  if (state.notDeployed) {
    return (
      <AdminNotDeployedState
        title={title}
        endpoint="GET /admin/v1/users/{userId}/entitlements"
        description="Per-vehicle roles (owner / provisional owner / driver) can't be read on this server yet."
      />
    );
  }

  return (
    <AdminPanel
      title={title}
      subtitle="This customer's role on each vehicle: owner (RC approved), provisional owner (paid, RC not yet approved) or driver. Vehicle premium (DriveQuant binding, protection badge) applies to the main vehicle the plan was bought with."
    >
      {state.error ? (
        <AlErrorState message={state.error} onRetry={onRetry} />
      ) : (
        <AlStack gap="sm">
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="account-vehicle-memberships"
            columns={[
              {
                id: 'vehicle',
                header: 'Vehicle',
                accessorFn: (row) => row.vehicle?.plate ?? row.vehicleId,
                cell: ({ row }) => (
                  <span className="admin-inline-cluster">
                    {row.original.vehicle?.plate ? (
                      row.original.vehicle.plate
                    ) : (
                      <span className="admin-mono" title={row.original.vehicleId}>
                        {shortAdminId(row.original.vehicleId)}
                      </span>
                    )}
                    {row.original.isMain ? (
                      <AdminStatusChip label="Main vehicle" tone="published" />
                    ) : null}
                  </span>
                ),
              },
              {
                id: 'role',
                header: 'Role',
                accessorFn: (row) => ROLE_LABEL[row.role],
                cell: ({ row }) => (
                  <AdminStatusChip
                    label={ROLE_LABEL[row.original.role]}
                    tone={row.original.role === 'DRIVER' ? 'neutral' : 'active'}
                  />
                ),
              },
              {
                id: 'rcStatus',
                header: 'RC review',
                accessorFn: (row) => rcStatusLabel(row),
                cell: ({ row }) => (
                  <span className="admin-inline-cluster">
                    <AdminStatusChip
                      label={rcStatusLabel(row.original)}
                      tone={rcStatusTone(row.original)}
                    />
                    {row.original.rcStatus === 'REJECTED' && row.original.rejectionReason ? (
                      <span className="admin-cell-hint">{row.original.rejectionReason}</span>
                    ) : null}
                  </span>
                ),
              },
              {
                id: 'vehiclePremium',
                header: 'Vehicle premium',
                accessorFn: (row) =>
                  row.vehiclePremium === undefined ? '—' : row.vehiclePremium ? 'Yes' : 'No',
                cell: ({ row }) =>
                  row.original.vehiclePremium === undefined ? (
                    '—'
                  ) : (
                    <AdminStatusChip
                      label={row.original.vehiclePremium ? 'Premium' : 'Not covered'}
                      tone={row.original.vehiclePremium ? 'active' : 'neutral'}
                    />
                  ),
              },
              {
                id: 'protection',
                header: 'Protection',
                accessorFn: (row) =>
                  row.vehicle ? humanizeAdminLabel(row.vehicle.protection) : '—',
              },
            ]}
            data={rows}
            loading={state.isLoading}
            emptyTitle="No vehicle memberships"
            emptyDescription="This customer isn't an owner or driver on any vehicle."
            getRowId={(row) => row.vehicleId}
            onRowClick={(row) => {
              if (row.vehicle) {
                onOpenVehicle(row.vehicleId);
                return;
              }
              setRosterVehicleId((current) => (current === row.vehicleId ? null : row.vehicleId));
            }}
          />
          <AlText variant="caption" tone="muted" data-testid="users-memberships-drivers-note">
            Open a vehicle to see its owner and every driver on it. Vehicles this customer only
            drives open their roster below.
          </AlText>
          {rosterVehicleId ? (
            <VehicleRosterPanel
              vehicleId={rosterVehicleId}
              currentAccountId={accountId}
              onOpenAccount={onOpenAccount}
              testId="membership-roster"
            />
          ) : null}
        </AlStack>
      )}
    </AdminPanel>
  );
}
