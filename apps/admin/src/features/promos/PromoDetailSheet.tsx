import type { AdminPromoDto } from '@autolokate/api-client';
import {
  AlButton,
  AlSectionHeader,
  AlSheet,
  AlStack,
  AlStatusBadge,
  AlText,
} from '@autolokate/ui';

import {
  formatPromoDiscount,
  getPromoLifecycleStatus,
} from '@/services/promos/promo-metrics.js';

import './promos.css';

export type PromoDetailSheetProps = {
  promo: AdminPromoDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
  onCreatePromo?: () => void;
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <AlStack gap="xs">
      <AlText variant="caption" tone="muted">
        {label}
      </AlText>
      <AlText>{value}</AlText>
    </AlStack>
  );
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Unbounded';
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
      description="PromoDto from GET /admin/v1/promos"
    >
      <AlStack gap="lg">
        <section>
          <AlSectionHeader title="Overview" />
          <AlStack gap="md">
            <DetailField label="Promo code" value={promo.code} />
            <AlStack gap="xs">
              <AlText variant="caption" tone="muted">
                Lifecycle
              </AlText>
              <AlStatusBadge
                label={lifecycle}
                status={lifecycle === 'ACTIVE' ? 'active' : lifecycle === 'UPCOMING' ? 'pending' : 'inactive'}
              />
            </AlStack>
            <AlStack gap="xs">
              <AlText variant="caption" tone="muted">
                Active flag
              </AlText>
              <AlStatusBadge
                label={promo.active ? 'Active' : 'Inactive'}
                status={promo.active ? 'active' : 'inactive'}
              />
            </AlStack>
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Discount" />
          <AlStack gap="md">
            <DetailField label="Formatted discount" value={formatPromoDiscount(promo)} />
            <DetailField
              label="Discount percent"
              value={promo.discountPercent !== null ? `${String(promo.discountPercent)}%` : '—'}
            />
            <DetailField
              label="Discount paise"
              value={promo.discountPaise !== null ? promo.discountPaise.toLocaleString() : '—'}
            />
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Validity" />
          <AlStack gap="md">
            <DetailField label="Valid from" value={formatDateTime(promo.validFrom)} />
            <DetailField label="Valid to" value={formatDateTime(promo.validTo)} />
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Eligibility" description="Redemption caps from PromoDto." />
          <AlStack gap="md">
            <DetailField label="Max redemptions (global)" value={formatLimit(promo.maxRedemptions)} />
            <DetailField label="Max per account" value={formatLimit(promo.maxPerAccount)} />
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Campaign" description="PromoDto has no campaign field in OpenAPI." />
          <AlText tone="muted">Not exposed by GET /admin/v1/promos.</AlText>
        </section>

        <section>
          <AlSectionHeader title="Metadata" />
          <AlStack gap="md">
            <DetailField label="Promo ID" value={promo.id} />
          </AlStack>
        </section>

        <section>
          <AlSectionHeader title="Raw API" description="PromoDto payload" />
          <pre className="promo-detail-sheet__raw">{JSON.stringify(promo, null, 2)}</pre>
        </section>

        <section>
          <AlSectionHeader title="Actions" />
          {canWrite ? (
            <AlStack gap="sm">
              <AlText tone="muted">
                OpenAPI exposes create only (POST /admin/v1/promos). Update, deactivate, and delete
                are not available.
              </AlText>
              {onCreatePromo ? (
                <AlButton
                  size="sm"
                  onClick={() => {
                    onCreatePromo();
                  }}
                >
                  Create promo
                </AlButton>
              ) : null}
            </AlStack>
          ) : (
            <AlText tone="muted">You have read-only access to promos.</AlText>
          )}
        </section>
      </AlStack>
    </AlSheet>
  );
}
