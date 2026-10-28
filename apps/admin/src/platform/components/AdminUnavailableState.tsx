import { AlEmptyState } from '@autolokate/ui';

import { ADMIN_PRODUCT_BLOCKED_MESSAGE } from '@/platform/api/product-blocked';

export type AdminUnavailableStateProps = {
  title: string;
  /** Nest method+path that is absent / blocked (shown for operators). */
  operation?: string;
  description?: string;
};

/**
 * Honest empty surface for G0-4 Absents and other Nest-missing Admin modules.
 * Never fabricates rows or success states.
 */
export function AdminUnavailableState({
  title,
  operation,
  description,
}: AdminUnavailableStateProps) {
  const detail =
    description ??
    (operation ? `${ADMIN_PRODUCT_BLOCKED_MESSAGE} (${operation})` : ADMIN_PRODUCT_BLOCKED_MESSAGE);

  return <AlEmptyState title={title} description={detail} compact />;
}
