import { AlModal, AlStack, AlStatusBadge, AlText } from '@autolokate/ui';

import { useOrderDetail } from '@/hooks/orders/useOrderDetail';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';

export type OrderDetailSheetProps = {
  orderId: string | null;
  orderNumber?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function OrderDetailSheet({
  orderId,
  orderNumber,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const { order, isLoading, userErrorMessage } = useOrderDetail(open ? orderId : null);

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={order?.orderNumber ?? orderNumber ?? 'Order'}
      description="Order detail."
    >
      {isLoading ? <AdminPageLoader label="Loading order…" /> : null}
      {!isLoading && userErrorMessage ? (
        <AlText tone="muted" role="alert">
          {userErrorMessage}
        </AlText>
      ) : null}
      {!isLoading && order ? (
        <AlStack gap="md">
          <AdminDetailSection title="Status">
            <div className="admin-modal-actions">
              <AlStatusBadge
                label={order.status}
                status={
                  order.status === 'PAID'
                    ? 'active'
                    : order.status === 'PENDING_PAYMENT'
                      ? 'pending'
                      : 'inactive'
                }
              />
              {order.paymentOutcome ? (
                <AlStatusBadge label={order.paymentOutcome} status="pending" />
              ) : null}
            </div>
          </AdminDetailSection>

          <AdminDetailSection title="Plan">
            <AdminDetailGrid>
              <AdminDetailField label="Plan" value={order.planName} />
              <AdminDetailField label="Version" value={String(order.planVersion)} />
              <AdminDetailField label="Kind" value={order.orderKind} />
              <AdminDetailField label="Riders" value={String(order.riderCount)} />
            </AdminDetailGrid>
          </AdminDetailSection>

          <AdminDetailSection title="Money">
            <AdminDetailGrid>
              <AdminDetailField label="Subtotal" value={formatPaiseAsRupees(order.subtotalPaise)} />
              <AdminDetailField label="GST" value={formatPaiseAsRupees(order.gstPaise)} />
              <AdminDetailField label="Discount" value={formatPaiseAsRupees(order.discountPaise)} />
              <AdminDetailField label="Total" value={formatPaiseAsRupees(order.totalPaise)} />
            </AdminDetailGrid>
          </AdminDetailSection>

          <AdminDetailSection title="Attribution">
            <AdminDetailGrid>
              <AdminDetailField label="Account" value={order.accountId ?? '—'} />
              <AdminDetailField label="Partner org" value={order.partnerOrgId ?? '—'} />
              <AdminDetailField label="QR code" value={order.qrCodeId ?? '—'} />
              <AdminDetailField label="Created" value={formatDateTime(order.createdAt)} />
            </AdminDetailGrid>
          </AdminDetailSection>
        </AlStack>
      ) : null}
    </AlModal>
  );
}
