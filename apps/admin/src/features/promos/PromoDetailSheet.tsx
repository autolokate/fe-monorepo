import type { AdminPromoDto } from '@autolokate/api-client';
import { AlButton, AlSheet, AlStack, AlStatusBadge } from '@autolokate/ui';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField.js';
import {
  formatPromoDiscount,
  getPromoLifecycleStatus,
} from '@/services/promos/promo-metrics.js';

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
    <AlSheet
      open={open}
      onOpenChange={onOpenChange}
      title={promo.code}
      description={formatPromoDiscount(promo)}
    >
      <AlStack gap="md">
        <AdminDetailSection title="Status">
          <div className="admin-sheet-actions">
            <AlStatusBadge
              label={lifecycle}
              status={lifecycle === 'ACTIVE' ? 'active' : lifecycle === 'UPCOMING' ? 'pending' : 'inactive'}
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
              label="Fixed amount (paise)"
              value={promo.discountPaise !== null ? promo.discountPaise.toLocaleString() : '—'}
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

        <AdminDetailSection title="Reference">
          <AdminDetailField label="Promo ID" value={promo.id} mono />
        </AdminDetailSection>

        {canWrite && onCreatePromo ? (
          <AdminDetailSection title="Actions">
            <AlButton
              size="sm"
              onClick={() => {
                onCreatePromo();
              }}
            >
              Create another promo
            </AlButton>
          </AdminDetailSection>
        ) : null}
      </AlStack>
    </AlSheet>
  );
}
