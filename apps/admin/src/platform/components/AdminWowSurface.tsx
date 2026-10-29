import type { ReactNode } from 'react';

export type AdminPanelProps = {
  title?: string;
  subtitle?: string;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Primary operator work panel — matches Taxi / Garage / Partner detail language. */
export function AdminPanel({ title, subtitle, meta, children, className }: AdminPanelProps) {
  const hasHeader = Boolean(title || subtitle || meta);
  return (
    <section
      className={['admin-panel', className].filter(Boolean).join(' ')}
      aria-label={title || undefined}
    >
      {hasHeader ? (
        <header className="admin-panel__header">
          <div>
            {title ? <h2 className="admin-panel__title">{title}</h2> : null}
            {subtitle ? <p className="admin-panel__subtitle">{subtitle}</p> : null}
          </div>
          {meta ? <div className="admin-panel__meta">{meta}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export type AdminKpiProps = {
  label: string;
  value: string;
};

export function AdminKpiStrip({ items }: { items: AdminKpiProps[] }) {
  if (items.length === 0) return null;
  return (
    <div className="admin-kpi-strip" role="group" aria-label="Summary">
      {items.map((item) => (
        <div key={item.label} className="admin-kpi">
          <span className="admin-kpi__value">{item.value}</span>
          <span className="admin-kpi__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export type AdminStatusChipTone = 'draft' | 'published' | 'active' | 'none' | 'neutral';

export function AdminStatusChip({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: AdminStatusChipTone;
}) {
  return <span className={`admin-status-chip admin-status-chip--${tone}`}>{label}</span>;
}

/** Humanize SCREAMING_SNAKE / camelCase enums for operator chips. */
export function humanizeAdminLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Shorten UUID-like ids for secondary mono display (never as the sole primary label). */
export function shortAdminId(value: string | null | undefined, size = 8): string {
  if (!value) return '—';
  const trimmed = value.trim();
  if (trimmed.length <= size) return trimmed;
  return trimmed.slice(0, size);
}
