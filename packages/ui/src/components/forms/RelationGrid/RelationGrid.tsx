import { cn } from '../../../utils/cn';

import type { AlRelationGridProps } from './RelationGrid.types';
import './RelationGrid.css';

/** Figma AlRelationGrid — 721:2136 */
export function AlRelationGrid<T extends string = string>({
  label = 'How are they related?',
  value,
  options,
  onChange,
  disabled = false,
  className,
}: AlRelationGridProps<T>) {
  return (
    <div className={cn('al-relation-grid', className)}>
      <p className="al-relation-grid__label">{label}</p>
      <div className="al-relation-grid__tiles" role="listbox" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(
                'al-relation-grid__tile',
                selected && 'al-relation-grid__tile--selected',
              )}
              disabled={disabled}
              onClick={() => {
                onChange?.(option.id);
              }}
            >
              {option.icon}
              <span className="al-relation-grid__tile-label">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
