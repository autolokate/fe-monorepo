import type { AdminPlanDto } from '@autolokate/api-client';
import { AlButton, AlModal, AlStack, AlStatusBadge, AlText } from '@autolokate/ui';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';
import { formatEffectiveWindow, getPlanLifecycle, planTierLabel } from '@/services/catalog/catalog-model';

export type PlanVersionDetailSheetProps = {
  plan: AdminPlanDto | null;
  featureCount: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
  onEditFeatures: () => void;
  onNewVersion: () => void;
  onPublish: () => void;
  onRetire: () => void;
  lifecyclePending: boolean;
};

export function PlanVersionDetailSheet({
  plan,
  featureCount,
  open,
  onOpenChange,
  canWrite,
  onEditFeatures,
  onNewVersion,
  onPublish,
  onRetire,
  lifecyclePending,
}: PlanVersionDetailSheetProps) {
  if (!plan) {
    return null;
  }

  const lifecycle = getPlanLifecycle(plan);

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={`${planTierLabel(plan.tier)} v${String(plan.version)}`}
      description={plan.name}
    >
      <AlStack gap="md">
        <AdminDetailSection title="Status">
          <div className="admin-modal-actions">
            <AlStatusBadge
              label={plan.isEffectiveNow ? 'Live' : lifecycle.charAt(0) + lifecycle.slice(1).toLowerCase()}
              status={plan.isEffectiveNow ? 'active' : lifecycle === 'RETIRED' ? 'inactive' : 'pending'}
            />
            {featureCount === 0 ? (
              <AlStatusBadge label="No features — blank card" status="error" />
            ) : null}
          </div>
        </AdminDetailSection>

        <AdminDetailSection
          title="Pricing"
          description="Immutable. A price, tier or name change mints a NEW version — there is no edit."
        >
          <AdminDetailGrid>
            <AdminDetailField label="Price" value={formatPaiseAsRupees(plan.pricePaise)} />
            <AdminDetailField label="Period" value={plan.period} />
            <AdminDetailField label="Rider" value={plan.riderEligible ? 'Eligible' : 'Not eligible'} />
            <AdminDetailField
              label="Features"
              value={featureCount === null ? '—' : `${String(featureCount)} bullets`}
            />
          </AdminDetailGrid>
          <AlText variant="caption" tone="muted">
            A Subscription pins the plan version it was sold on. Editing this price in place would
            retro-reprice everyone who already paid, so the API rejects it — mint a new version instead.
          </AlText>
        </AdminDetailSection>

        <AdminDetailSection title="Lifecycle">
          <AdminDetailGrid>
            <AdminDetailField label="Effective window" value={formatEffectiveWindow(plan)} />
            <AdminDetailField
              label="Effective now"
              value={plan.isEffectiveNow ? 'Yes — sellable' : 'No'}
            />
          </AdminDetailGrid>
        </AdminDetailSection>

        {canWrite ? (
          <AdminDetailSection
            title="Actions"
            description="Feature bullets are editable in place. Price and name are not."
          >
            <div className="admin-modal-actions">
              <AlButton size="sm" onClick={onEditFeatures}>
                Edit features
              </AlButton>
              <AlButton size="sm" variant="secondary" onClick={onNewVersion}>
                New version of this tier
              </AlButton>
              {plan.isEffectiveNow ? (
                <AlButton
                  size="sm"
                  variant="secondary"
                  loading={lifecyclePending}
                  disabled={lifecyclePending}
                  onClick={onRetire}
                >
                  Retire
                </AlButton>
              ) : (
                <AlButton
                  size="sm"
                  variant="secondary"
                  loading={lifecyclePending}
                  disabled={lifecyclePending}
                  onClick={onPublish}
                >
                  Publish
                </AlButton>
              )}
            </div>
          </AdminDetailSection>
        ) : null}
      </AlStack>
    </AlModal>
  );
}
