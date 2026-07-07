import type { SelectHTMLAttributes } from 'react';

export type AlSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type AlSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  options: AlSelectOption[];
  placeholder?: string;
  /** Compact sizing for toolbars and filter rows. */
  compact?: boolean;
};
