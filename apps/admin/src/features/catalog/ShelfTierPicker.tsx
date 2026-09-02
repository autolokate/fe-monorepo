import type { ApiPlanTier } from '@autolokate/api-client';
import { AlCheckbox, AlStack, AlText } from '@autolokate/ui';

import { ShelfChips } from '@/features/catalog/ShelfChips';
import { planTierLabel } from '@/services/catalog/catalog-model';

export type ShelfTierPickerProps = {
  /** Only tiers with an effective plan — a tier with no price cannot be put on a shelf. */
  selectableTiers: readonly ApiPlanTier[];
  value: ApiPlanTier[];
  onChange: (next: ApiPlanTier[]) => void;
  errorText?: string;
  disabled?: boolean;
};

export function ShelfTierPicker({
  selectableTiers,
  value,
  onChange,
  errorText,
  disabled = false,
}: ShelfTierPickerProps) {
  const toggle = (tier: ApiPlanTier, checked: boolean) => {
    if (checked) {
      onChange(value.includes(tier) ? value : [...value, tier]);
      return;
    }
    onChange(value.filter((entry) => entry !== tier));
  };

  return (
    <AlStack gap="sm">
      <AlText variant="label">Shelf — offered tiers</AlText>
      <AlText variant="caption" tone="muted">
        A tier that is not on the shelf cannot be sold against this SKU&apos;s stock. The server
        enforces this, so an empty shelf sells nothing.
      </AlText>

      {selectableTiers.length === 0 ? (
        <AlText role="alert">
          No tier has an effective plan right now. Publish a plan version before stocking a shelf.
        </AlText>
      ) : (
        <div className="catalog-shelf-picker">
          {selectableTiers.map((tier) => (
            <AlCheckbox
              key={tier}
              label={planTierLabel(tier)}
              checked={value.includes(tier)}
              disabled={disabled}
              onChange={(event) => {
                toggle(tier, event.target.checked);
              }}
            />
          ))}
        </div>
      )}

      <div className="catalog-shelf-preview">
        <AlText variant="caption" tone="muted">
          On the shelf
        </AlText>
        <ShelfChips tiers={value} />
      </div>

      {errorText ? <AlText role="alert">{errorText}</AlText> : null}
    </AlStack>
  );
}
