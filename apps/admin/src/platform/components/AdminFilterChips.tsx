import { AlBadge } from '@autolokate/ui';

export type AdminFilterChipOption<T extends string> = {
  value: T;
  label: string;
};

export type AdminFilterChipsProps<T extends string> = {
  options: readonly AdminFilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label'?: string;
};

export function AdminFilterChips<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel = 'Filter',
}: AdminFilterChipsProps<T>) {
  return (
    <div className="admin-filter-bar" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className="admin-filter-chip al-admin-focus-ring"
            aria-pressed={isActive}
            onClick={() => {
              onChange(option.value);
            }}
          >
            <AlBadge variant="neutral">{option.label}</AlBadge>
          </button>
        );
      })}
    </div>
  );
}
