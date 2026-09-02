import type { AdminPromoDto } from '@autolokate/api-client';
import { AlButton, AlModal, AlStack, AlStatusBadge } from '@autolokate/ui';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';
import { formatPromoDiscount, getPromoLifecycleStatus } from '@/services/promos/promo-metrics';

export type PromoDetailSheetProps = {
  promo: AdminPromoDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
  onCreatePromo?: () => void;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'No end date';
  }
  return new Date(value).toLocaleString();
}

function formatLimit(value: number | null): string {
  if (value === null) {
    return 'Unlimited';
  }
  return value.toLocaleString();
}

export function PromoDetailSheet({
  promo,
  open,
  onOpenChange,
  canWrite,
  onCreatePromo,
}: PromoDetailSheetProps) {
  if (!promo) {
    return null;
  }

  const lifecycle = getPromoLifecycleStatus(promo);

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={promo.code}
      description={formatPromoDiscount(promo)}
    >
      <AlStack gap="md">
        <AdminDetailSection title="Status">
          <div className="admin-modal-actions">
            <AlStatusBadge
              label={lifecycle}
              status={
                lifecycle === 'ACTIVE'
                  ? 'active'
                  : lifecycle === 'UPCOMING'
                    ? 'pending'
                    : 'inactive'
              }
            />
            <AlStatusBadge
              label={promo.active ? 'Enabled' : 'Disabled'}
              status={promo.active ? 'active' : 'inactive'}
            />
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="Discount">
          <AdminDetailGrid>
            <AdminDetailField label="Offer" value={formatPromoDiscount(promo)} />
            <AdminDetailField
              label="Percent off"
              value={promo.discountPercent !== null ? `${String(promo.discountPercent)}%` : '—'}
            />
            <AdminDetailField
              label="Fixed amount"
              value={promo.discountPaise !== null ? formatPaiseAsRupees(promo.discountPaise) : '—'}
            />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Validity">
          <AdminDetailGrid>
            <AdminDetailField label="Starts" value={formatDateTime(promo.validFrom)} />
            <AdminDetailField label="Ends" value={formatDateTime(promo.validTo)} />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Limits">
          <AdminDetailGrid>
            <AdminDetailField label="Max redemptions" value={formatLimit(promo.maxRedemptions)} />
            <AdminDetailField label="Max per account" value={formatLimit(promo.maxPerAccount)} />
          </AdminDetailGrid>
        </AdminDetailSection>

        {canWrite && onCreatePromo ? (
          <AdminDetailSection title="Actions">
            <div className="admin-modal-actions">
              <AlButton
                size="sm"
                onClick={() => {
                  onCreatePromo();
                }}
              >
                Create another promo
              </AlButton>
            </div>
          </AdminDetailSection>
        ) : null}
      </AlStack>
    </AlModal>
  );
}
