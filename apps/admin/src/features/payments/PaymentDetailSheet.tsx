import { AlModal, AlStack } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { AdminStatusChip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { formatAdminDateTime, formatPaise } from '@/platform/utils/format-admin-date';
import { fetchPaymentDetail } from '@/services/payments/payments-service';

/** `GET /admin/v1/payments/{paymentId}` — read-only; refunds stay on the order. */
export function PaymentDetailSheet({
  paymentId,
  open,
  onOpenChange,
}: {
  paymentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ['admin', 'payments', 'detail', paymentId],
    queryFn: ({ signal }) => fetchPaymentDetail(paymentId ?? '', signal),
    enabled: open && Boolean(paymentId),
    retry: false,
  });
  const payment = query.data;

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={payment?.ref ?? 'Payment'}
      description="Server payment state. Refunds are issued from the order."
    >
      {query.isLoading ? <AdminPageLoader label="Loading payment…" /> : null}
      {query.isError ? (
        <p className="admin-form-error" role="alert" data-testid="payment-detail-error">
          {mapAdminApiError(query.error).userMessage}
        </p>
      ) : null}
      {payment ? (
        <AlStack gap="md" data-testid="payment-detail">
          <AdminDetailSection title="Outcome" description="Settled outcome and payment state.">
            <div className="admin-status-row">
              <AdminStatusChip
                label={humanizeAdminLabel(payment.outcome)}
                tone={payment.outcome === 'PAID' ? 'active' : 'neutral'}
              />
              <AdminStatusChip label={humanizeAdminLabel(payment.state)} tone="neutral" />
            </div>
          </AdminDetailSection>
          <AdminDetailSection title="Money" description="Amounts in rupees.">
            <AdminDetailGrid>
              <AdminDetailField label="Amount" value={formatPaise(payment.amountPaise)} />
              <AdminDetailField label="Captured" value={formatPaise(payment.capturedPaise)} />
              <AdminDetailField label="Mode" value={humanizeAdminLabel(payment.mode)} />
              <AdminDetailField label="State sequence" value={String(payment.stateSeq)} />
            </AdminDetailGrid>
          </AdminDetailSection>
          <AdminDetailSection title="References" description="Order and provider references.">
            <AdminDetailGrid>
              <AdminDetailField label="Order #" value={payment.orderNumber ?? '—'} mono />
              <AdminDetailField label="Reference" value={payment.ref} mono />
              <AdminDetailField label="Provider ref" value={payment.providerRef ?? '—'} mono />
              <AdminDetailField label="Created" value={formatAdminDateTime(payment.createdAt)} />
            </AdminDetailGrid>
          </AdminDetailSection>
        </AlStack>
      ) : null}
    </AlModal>
  );
}
