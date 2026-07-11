import type { ApiPlanTier } from '@autolokate/api-client';
import { AlChip, AlStatusBadge } from '@autolokate/ui';

import { planTierLabel, PLAN_TIERS } from '@/services/catalog/catalog-model';

export type ShelfChipsProps = {
  tiers: readonly ApiPlanTier[];
};

/**
 * The shelf, rendered so an empty one is impossible to miss. `offeredTiers` is a fail-closed money control:
 * a tier that is not here cannot be sold against this SKU's stock, and an empty shelf sells nothing at all.
 */
export function ShelfChips({ tiers }: ShelfChipsProps) {
  if (tiers.length === 0) {
    return <AlStatusBadge label="Empty shelf — sells nothing" status="error" />;
  }

  const ordered = PLAN_TIERS.filter((tier) => tiers.includes(tier));

  return (
    <div className="catalog-shelf-chips">
      {ordered.map((tier) => (
        <AlChip key={tier} variant="green" label={planTierLabel(tier)} />
      ))}
    </div>
  );
}
