import { AlModal, AlStack } from '@autolokate/ui';

import { useOrderDetail } from '@/hooks/orders/useOrderDetail';
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

function statusTone(status: string) {
  if (status === 'PAID') return 'active' as const;
  if (status === 'PENDING_PAYMENT') return 'draft' as const;
  return 'none' as const;
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
      description="Money, plan, and attribution for this order."
    >
      {isLoading ? <AdminPageLoader label="Loading order…" /> : null}
      {!isLoading && userErrorMessage ? (
        <p className="admin-form-error" role="alert">
          {userErrorMessage}
        </p>
      ) : null}
      {!isLoading && order ? (
        <AlStack gap="md">
          <AdminDetailSection title="Status" description="Order and payment outcome.">
            <div className="admin-status-row">
              <AdminStatusChip
                label={humanizeAdminLabel(order.status)}
                tone={statusTone(order.status)}
              />
              {order.paymentOutcome ? (
                <AdminStatusChip label={humanizeAdminLabel(order.paymentOutcome)} tone="neutral" />
              ) : null}
            </div>
          </AdminDetailSection>

          <AdminDetailSection title="Plan" description="Coverage plan on this order.">
            <AdminDetailGrid>
              <AdminDetailField label="Plan" value={order.planName} />
              <AdminDetailField label="Version" value={String(order.planVersion)} />
              <AdminDetailField label="Kind" value={humanizeAdminLabel(order.orderKind)} />
              <AdminDetailField label="Riders" value={String(order.riderCount)} />
            </AdminDetailGrid>
          </AdminDetailSection>

          <AdminDetailSection title="Money" description="Amounts charged for this order.">
            <AdminDetailGrid>
              <AdminDetailField label="Subtotal" value={formatPaiseAsRupees(order.subtotalPaise)} />
              <AdminDetailField label="GST" value={formatPaiseAsRupees(order.gstPaise)} />
              <AdminDetailField label="Discount" value={formatPaiseAsRupees(order.discountPaise)} />
              <AdminDetailField label="Total" value={formatPaiseAsRupees(order.totalPaise)} />
            </AdminDetailGrid>
          </AdminDetailSection>

          <AdminDetailSection title="Attribution" description="Who and where this order came from.">
            <AdminDetailGrid>
              <AdminDetailField
                label="Account"
                value={order.accountId ? shortAdminId(order.accountId) : '—'}
                mono
              />
              <AdminDetailField
                label="Partner org"
                value={order.partnerOrgId ? shortAdminId(order.partnerOrgId) : '—'}
                mono
              />
              <AdminDetailField
                label="QR code"
                value={order.qrCodeId ? shortAdminId(order.qrCodeId) : '—'}
                mono
              />
              <AdminDetailField label="Created" value={formatDateTime(order.createdAt)} />
            </AdminDetailGrid>
          </AdminDetailSection>
        </AlStack>
      ) : null}
    </AlModal>
  );
}
