import { AlIcon } from '@autolokate/icons';
import { AlRelationGrid } from '@autolokate/ui';

import {
  CONTACT_RELATIONSHIP_OPTIONS,
  type RelationshipOption,
} from '@/features/emergency/data/relationships.js';
import type { RelationshipId } from '@/features/emergency/types.js';

export type RelationshipSelectorProps = {
  value?: RelationshipId;
  onChange?: (relation: RelationshipId) => void;
  disabled?: boolean;
  /** E3 contact name and R3 rider name — 6 tiles, no Colleague/Other. */
  variant?: 'contact' | 'full';
};

/** Thin wrapper — options from emergency data; grid primitive lives in @autolokate/ui. */
export function RelationshipSelector({
  value,
  onChange,
  disabled = false,
  variant: _variant = 'contact',
}: RelationshipSelectorProps) {
  const options: readonly RelationshipOption[] = CONTACT_RELATIONSHIP_OPTIONS;

  return (
    <AlRelationGrid
      className="ob-relationship-selector"
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options.map((option) => ({
        id: option.id,
        label: option.label,
        icon: <AlIcon name={option.icon} size={26} aria-hidden />,
      }))}
    />
  );
}
