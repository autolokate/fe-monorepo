import { AlModal, AlStack } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';
import { fetchSubscriptionDetail } from '@/services/subscriptions/subscriptions-service';

/** `GET /admin/v1/subscriptions/{subscriptionId}` — read-only coverage detail. */
export function SubscriptionDetailSheet({
  subscriptionId,
  open,
  onOpenChange,
}: {
  subscriptionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ['admin', 'subscriptions', 'detail', subscriptionId],
    queryFn: ({ signal }) => fetchSubscriptionDetail(subscriptionId ?? '', signal),
    enabled: open && Boolean(subscriptionId),
    retry: false,
  });
  const sub = query.data;

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={sub ? `${humanizeAdminLabel(sub.planTier)} v${String(sub.planVersion)}` : 'Coverage'}
      description="Plan, vehicle and renewal for this subscription."
    >
      {query.isLoading ? <AdminPageLoader label="Loading coverage…" /> : null}
      {query.isError ? (
        <p className="admin-form-error" role="alert" data-testid="subscription-detail-error">
          {mapAdminApiError(query.error).userMessage}
        </p>
      ) : null}
      {sub ? (
        <AlStack gap="md" data-testid="subscription-detail">
          <AdminDetailSection title="Status" description="Lifecycle and renewal.">
            <div className="admin-status-row">
              <AdminStatusChip
                label={humanizeAdminLabel(sub.status)}
                tone={sub.status === 'ACTIVE' ? 'active' : 'none'}
              />
              <AdminStatusChip
                label={sub.autoRenew ? 'Auto-renew on' : 'Auto-renew off'}
                tone="neutral"
              />
            </div>
            <AdminDetailGrid>
              <AdminDetailField label="Started" value={formatAdminDateTime(sub.startedAt)} />
              <AdminDetailField label="Renews" value={formatAdminDateTime(sub.renewsAt)} />
              <AdminDetailField
                label="Activated via"
                value={humanizeAdminLabel(sub.activatedVia)}
              />
              <AdminDetailField
                label="Billing mandate"
                value={sub.billingMandateId ? shortAdminId(sub.billingMandateId) : '—'}
                mono
              />
            </AdminDetailGrid>
          </AdminDetailSection>
          <AdminDetailSection title="Links" description="Account, vehicle, QR and plan ids.">
            <AdminDetailGrid>
              <AdminDetailField label="Account" value={shortAdminId(sub.accountId)} mono />
              <AdminDetailField label="Vehicle" value={shortAdminId(sub.vehicleId)} mono />
              <AdminDetailField label="QR code" value={shortAdminId(sub.qrCodeId)} mono />
              <AdminDetailField label="Plan" value={shortAdminId(sub.planId)} mono />
            </AdminDetailGrid>
          </AdminDetailSection>
        </AlStack>
      ) : null}
    </AlModal>
  );
}
