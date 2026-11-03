import type { AdminTaxiFleetMediaItemDto } from '@autolokate/api-client';
import { AlButton, AlSheet, AlStack } from '@autolokate/ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { adminPartnerPath } from '@/app/routes/admin-paths';
import { TaxiDriverIdentity } from '@/features/taxi/TaxiDriverIdentity';
import { TaxiFleetMediaViewer } from '@/features/taxi/TaxiFleetMediaViewer';
import {
  taxiBidBlockerLabel,
  taxiMediaSlotLabel,
  taxiMediaStatusTone,
  taxiRcTone,
  vehicleTitle,
} from '@/features/taxi/taxi-fleet-format';
import {
  fleetActionErrorMessage,
  useRemoveTaxiFleetMedia,
  useTaxiFleetVehicle,
} from '@/hooks/taxi/useTaxiFleet';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { AdminReasonDialog } from '@/platform/components/AdminReasonDialog';
import { AdminStatusChip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './taxi-v4.css';

export function TaxiFleetDrawer({
  vehicleId,
  onOpenChange,
}: {
  vehicleId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const canWrite = useAdminPermission('taxi:write');
  const { vehicle, isLoading, isFetching, notFound, userErrorMessage, refresh } =
    useTaxiFleetVehicle(vehicleId);
  const remove = useRemoveTaxiFleetMedia(vehicleId ?? '');
  const [pendingRemove, setPendingRemove] = useState<AdminTaxiFleetMediaItemDto | null>(null);

  return (
    <AlSheet
      open={vehicleId !== null}
      onOpenChange={onOpenChange}
      title={vehicle ? `${vehicle.registration} · ${vehicleTitle(vehicle)}` : 'Fleet vehicle'}
      description="Bid readiness, driver and the camera media customers see on bid cards."
    >
      <div className="taxi-wide-drawer" data-testid="taxi-fleet-drawer">
        {isLoading ? <AdminPageLoader label="Loading vehicle…" /> : null}
        {notFound ? <p className="admin-empty-note">This fleet vehicle no longer exists.</p> : null}
        {userErrorMessage ? (
          <p className="admin-form-error" role="alert">
            {userErrorMessage}
          </p>
        ) : null}
        {vehicle ? (
          <AlStack gap="md">
            <AdminDetailSection title="Bid readiness">
              <div className="taxi-fleet-blockers" data-testid="taxi-fleet-blockers">
                {vehicle.canBid ? (
                  <AdminStatusChip label="Can bid" tone="active" />
                ) : vehicle.bidBlockers.length > 0 ? (
                  vehicle.bidBlockers.map((blocker) => (
                    <AdminStatusChip
                      key={blocker}
                      label={taxiBidBlockerLabel(blocker)}
                      tone="none"
                    />
                  ))
                ) : (
                  <AdminStatusChip label="Cannot bid" tone="none" />
                )}
              </div>
              <AdminDetailGrid>
                <AdminDetailField
                  label="Partner org"
                  value={
                    <Link className="admin-link" to={adminPartnerPath(vehicle.orgId)}>
                      {vehicle.orgName ?? vehicle.orgId}
                    </Link>
                  }
                />
                <AdminDetailField label="Fleet status" value={humanizeAdminLabel(vehicle.status)} />
                <AdminDetailField
                  label="RC"
                  value={
                    <AdminStatusChip
                      label={humanizeAdminLabel(vehicle.rcStatus)}
                      tone={taxiRcTone(vehicle.rcStatus)}
                    />
                  }
                />
                {vehicle.rejectionReason ? (
                  <AdminDetailField label="RC rejection" value={vehicle.rejectionReason} />
                ) : null}
                <AdminDetailField
                  label="Owner role"
                  value={vehicle.role ? humanizeAdminLabel(vehicle.role) : '—'}
                />
                <AdminDetailField label="Fleet vehicle" value={vehicle.id} mono />
                {vehicle.vehicleId ? (
                  <AdminDetailField label="Vehicle record" value={vehicle.vehicleId} mono />
                ) : null}
              </AdminDetailGrid>
            </AdminDetailSection>

            <AdminDetailSection
              title="Driver"
              description="Name and camera photo shown to customers on bid cards."
            >
              <TaxiDriverIdentity driver={vehicle.driver} />
              {vehicle.assignedDriver ? (
                <AdminDetailGrid>
                  <AdminDetailField
                    label="Assigned account"
                    value={
                      vehicle.assignedDriver.username
                        ? `@${vehicle.assignedDriver.username}`
                        : vehicle.assignedDriver.accountId
                    }
                  />
                  <AdminDetailField
                    label="Phone"
                    value={
                      vehicle.assignedDriver.phoneLast4
                        ? `••••${vehicle.assignedDriver.phoneLast4}`
                        : '—'
                    }
                  />
                </AdminDetailGrid>
              ) : null}
            </AdminDetailSection>

            <AdminDetailSection
              title="Camera media"
              description="Signed links expire 300 s after this read — reopen or refresh to view again."
            >
              <AdminDetailGrid>
                <AdminDetailField
                  label="Freshness"
                  value={
                    <AdminStatusChip
                      label={humanizeAdminLabel(vehicle.media.status)}
                      tone={taxiMediaStatusTone(vehicle.media.status)}
                    />
                  }
                />
                <AdminDetailField
                  label="Earliest expiry"
                  value={formatAdminDateTime(vehicle.media.expiresAt)}
                />
                <AdminDetailField
                  label="Missing slots"
                  value={
                    vehicle.media.missingSlots.length > 0
                      ? vehicle.media.missingSlots.map(taxiMediaSlotLabel).join(', ')
                      : 'None'
                  }
                />
                <AdminDetailField
                  label="Expired slots"
                  value={
                    vehicle.media.expiredSlots.length > 0
                      ? vehicle.media.expiredSlots.map(taxiMediaSlotLabel).join(', ')
                      : 'None'
                  }
                />
              </AdminDetailGrid>
              <div className="admin-page-actions">
                <AlButton
                  size="sm"
                  variant="secondary"
                  loading={isFetching}
                  data-testid="taxi-fleet-refresh-media"
                  onClick={refresh}
                >
                  Refresh links
                </AlButton>
              </div>
              <TaxiFleetMediaViewer
                items={vehicle.mediaItems}
                slots={vehicle.media.slots}
                canRemove={canWrite}
                onRemove={(item) => {
                  remove.reset();
                  setPendingRemove(item);
                }}
              />
            </AdminDetailSection>
          </AlStack>
        ) : null}
      </div>

      <AdminReasonDialog
        open={pendingRemove !== null}
        onOpenChange={(next) => {
          if (!next) setPendingRemove(null);
        }}
        title={`Remove ${pendingRemove ? taxiMediaSlotLabel(pendingRemove.slot).toLowerCase() : 'media'}?`}
        description="The slot is taken down and its file purged. The vehicle cannot bid until the partner re-captures it; the owner and managers are notified."
        confirmLabel="Remove media"
        destructive
        loading={remove.isPending}
        error={remove.isError ? fleetActionErrorMessage(remove.error) : null}
        testIdPrefix="taxi-fleet-media-remove"
        onConfirm={(reason) => {
          if (!pendingRemove || !reason) return;
          remove.mutate(
            { mediaId: pendingRemove.mediaId, reason },
            {
              onSuccess: () => {
                setPendingRemove(null);
              },
            },
          );
        }}
      />
    </AlSheet>
  );
}
