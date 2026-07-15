import type { OrderKind, OrderStatus } from '@/services/purchase';

export const ORDER_KIND_LABELS: Record<OrderKind, string> = {
  SCAN_SELF_PAY: 'Activation',
  RETAIL_SHIP: 'Sticker kit',
  UPGRADE: 'Plan upgrade',
  RENEWAL: 'Renewal',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Draft',
  PENDING_PAYMENT: 'Payment pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

/** ISO timestamp → "14 Jul 2026, 1:17 PM" (buyer's locale, best effort). */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
