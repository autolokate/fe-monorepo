import { AlInput } from '@autolokate/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AUDIT_ACTION_OPTIONS } from '@/features/audit/audit-filters';

import './audit-events.css';

export type AuditActionFilterProps = {
  value: string;
  onChange: (value: string) => void;
  errorText?: string | null;
  compact?: boolean;
};

export function AuditActionFilter({
  value,
  onChange,
  errorText,
  compact = false,
}: AuditActionFilterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) {
      return AUDIT_ACTION_OPTIONS;
    }
    return AUDIT_ACTION_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query),
    );
  }, [value]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, open]);

  const selectOption = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      close();
    },
    [close, onChange],
  );

  return (
    <div ref={rootRef} className="audit-action-filter">
      <AlInput
        {...(compact ? {} : { label: 'Action' })}
        value={value}
        placeholder="Action"
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        errorText={errorText ?? undefined}
        {...(compact ? {} : { helperText: 'Search or pick an audit action' })}
      />

      {open ? (
        <div className="audit-action-filter__menu" role="listbox" aria-label="Audit actions">
          <button
            type="button"
            role="option"
            aria-selected={!value.trim()}
            className="audit-action-filter__option"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              selectOption('');
            }}
          >
            All actions
          </button>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.label || value === option.value}
                className="audit-action-filter__option"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  selectOption(option.label);
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="audit-action-filter__empty">No matching actions</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
