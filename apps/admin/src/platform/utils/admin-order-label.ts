import { shortAdminId } from '@/platform/components/AdminWowSurface';

/**
 * Operator label for a `payment.orders` row. The admin order/payment DTOs carry `orderNumber: null`
 * (there is no order-number column), so fall back to the short order id — never invent a number.
 */
export function adminOrderLabel(
  orderNumber: string | null | undefined,
  orderId: string | null | undefined,
): string {
  const number = orderNumber?.trim();
  if (number) return number;
  return shortAdminId(orderId);
}
