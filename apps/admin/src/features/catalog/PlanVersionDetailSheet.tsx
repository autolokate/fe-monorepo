import type { AdminPlanDto } from '@autolokate/api-client';
import { AlButton, AlModal, AlStack } from '@autolokate/ui';

import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminStatusChip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { formatPaiseAsRupees } from '@/services/catalog/catalog-money';
import {
  formatEffectiveWindow,
  getPlanLifecycle,
  planTierLabel,
} from '@/services/catalog/catalog-model';

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
  const statusLabel = plan.isEffectiveNow ? 'Live' : humanizeAdminLabel(lifecycle);

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={`${planTierLabel(plan.tier)} v${String(plan.version)}`}
      description={plan.name}
    >
      <AlStack gap="md">
        <AdminDetailSection title="Status" description="Whether this version is sellable.">
          <div className="admin-status-row">
            <AdminStatusChip
              label={statusLabel}
              tone={plan.isEffectiveNow ? 'active' : lifecycle === 'RETIRED' ? 'none' : 'draft'}
            />
            {featureCount === 0 ? <AdminStatusChip label="No features" tone="none" /> : null}
          </div>
        </AdminDetailSection>

        <AdminDetailSection
          title="Pricing"
          description="Price and name are locked. Create a new version to change them."
        >
          <AdminDetailGrid>
            <AdminDetailField label="Price" value={formatPaiseAsRupees(plan.pricePaise)} />
            <AdminDetailField label="Period" value={plan.period} />
            <AdminDetailField
              label="Rider"
              value={plan.riderEligible ? 'Eligible' : 'Not eligible'}
            />
            <AdminDetailField
              label="Features"
              value={featureCount === null ? '—' : `${String(featureCount)} bullets`}
            />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Lifecycle" description="When this version is effective.">
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
            description="Feature bullets can be edited. Price and name cannot."
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
