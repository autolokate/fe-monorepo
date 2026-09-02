import type { ChangeEvent, ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { AlInput } from '../forms/Input/index';
import './SearchInput.css';

function SearchIcon() {
  return (
    <svg
      className="al-search-input__icon-svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export type AlSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  trailing?: ReactNode;
  compact?: boolean;
  className?: string;
  showClear?: boolean;
  onClear?: () => void;
};

export function AlSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  ariaLabel = 'Search',
  trailing,
  compact = false,
  className,
  showClear = true,
  onClear,
}: AlSearchInputProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn('al-search-input', compact && 'al-search-input--compact', className)}>
      <span className="al-search-input__icon">
        <SearchIcon />
      </span>
      <AlInput
        type="search"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="al-search-input__field"
        inputClassName="al-search-input__control"
      />
      {showClear && value ? (
        <button
          type="button"
          className="al-search-input__clear al-admin-focus-ring"
          aria-label="Clear search"
          onClick={handleClear}
        >
          ×
        </button>
      ) : null}
      {trailing ? <div className="al-search-input__trailing">{trailing}</div> : null}
    </div>
  );
}

export type AlFilterBarProps = {
  children: ReactNode;
  className?: string;
};

export function AlFilterBar({ children, className }: AlFilterBarProps) {
  return <div className={cn('al-filter-bar', className)}>{children}</div>;
}

export type AlToolbarProps = {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  inset?: boolean;
  className?: string;
};

export function AlToolbar({
  leading,
  trailing,
  children,
  inset = false,
  className,
}: AlToolbarProps) {
  return (
    <div className={cn('al-toolbar', inset && 'al-toolbar--inset', className)}>
      {leading ? <div className="al-toolbar__leading">{leading}</div> : null}
      {children ? <div className="al-toolbar__center">{children}</div> : null}
      {trailing ? <div className="al-toolbar__trailing">{trailing}</div> : null}
    </div>
  );
}
