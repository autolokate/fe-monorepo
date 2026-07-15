import { AlText } from '@autolokate/ui';
import type { ReactNode } from 'react';

export type AdminDetailFieldProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

export function AdminDetailField({ label, value, mono = false }: AdminDetailFieldProps) {
  return (
    <div className="admin-detail-field">
      <AlText variant="caption" tone="muted">
        {label}
      </AlText>
      <AlText className={mono ? 'admin-detail-field__value--mono' : undefined}>{value}</AlText>
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
    <section className="admin-detail-section">
      <div className="admin-detail-section__header">
        <h3 className="admin-detail-section__title">{title}</h3>
        {description ? <p className="admin-detail-section__description">{description}</p> : null}
      </div>
      <div className="admin-detail-section__body">{children}</div>
    </section>
  );
}

export function AdminDetailGrid({ children }: { children: ReactNode }) {
  return <div className="admin-detail-grid">{children}</div>;
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
