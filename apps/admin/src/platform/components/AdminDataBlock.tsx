import type { ReactNode } from 'react';

export type AdminDataBlockProps = {
  filters?: ReactNode;
  children: ReactNode;
};

/** Groups filters and a data table into one cohesive panel. */
export function AdminDataBlock({ filters, children }: AdminDataBlockProps) {
  return (
    <div className="admin-data-block">
      {filters ? <div className="admin-data-block__filters">{filters}</div> : null}
      <div className="admin-data-block__content">{children}</div>
    </div>
  );
}

export type AdminFilterFieldProps = {
  label: string;
  children: ReactNode;
};

export function AdminFilterField({ label, children }: AdminFilterFieldProps) {
  return (
    <div className="admin-filter-field">
      <span className="admin-filter-field__label">{label}</span>
      <div className="admin-filter-field__control">{children}</div>
    </div>
  );
}
