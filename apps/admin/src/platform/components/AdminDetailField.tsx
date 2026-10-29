import type { ReactNode } from 'react';

export type AdminDetailFieldProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

/** Detail cell — wow card language used by sheets and RO panels. */
export function AdminDetailField({ label, value, mono = false }: AdminDetailFieldProps) {
  return (
    <div className="admin-detail-card">
      <span className="admin-detail-card__label">{label}</span>
      <span className={`admin-detail-card__value${mono ? ' admin-detail-card__value--mono' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

export type AdminDetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AdminDetailSection({ title, description, children }: AdminDetailSectionProps) {
  return (
    <section className="admin-panel admin-panel--nested">
      <header className="admin-panel__header">
        <div>
          <h3 className="admin-panel__title">{title}</h3>
          {description ? <p className="admin-panel__subtitle">{description}</p> : null}
        </div>
      </header>
      <div className="admin-panel__body">{children}</div>
    </section>
  );
}

export function AdminDetailGrid({ children }: { children: ReactNode }) {
  return <div className="admin-detail-card-grid">{children}</div>;
}

function isIdLikeMetadataKey(key: string): boolean {
  const normalized = key.toLowerCase();
  if (normalized === 'id' || normalized.endsWith('id') || normalized.includes('_id')) {
    return true;
  }
  if (normalized.includes('uuid') || normalized.endsWith('ref')) {
    return true;
  }
  return normalized === 'requestid' || normalized === 'correlationid';
}

export function formatMetadataEntries(
  metadata: object | null,
): Array<{ label: string; value: string }> {
  if (!metadata || typeof metadata !== 'object') {
    return [];
  }
  return Object.entries(metadata as Record<string, unknown>)
    .filter(([key]) => !isIdLikeMetadataKey(key))
    .map(([key, value]) => ({
      label: key,
      value: formatMetadataValue(value),
    }));
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}
