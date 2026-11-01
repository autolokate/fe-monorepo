/** Shared, locale-stable formatters for operational tables and detail panels. */

export function formatAdminDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Server amounts arrive in paise; render as rupees without re-deriving anything. */
export function formatPaise(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `₹${(value / 100).toLocaleString('en-IN', {
    minimumFractionDigits: value % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatRupeeAmount(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `₹${value.toLocaleString('en-IN')}`;
}

export function shortAdminId(value: string | null | undefined): string {
  if (!value) return '—';
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}
