import { AlEmptyState } from '@autolokate/ui';

import { ADMIN_PRODUCT_BLOCKED_MESSAGE } from '@/platform/api/product-blocked';

export type AdminUnavailableStateProps = {
  title: string;
  /** Absent / blocked operation (kept for call sites; not shown to operators). */
  operation?: string;
  description?: string;
};

/**
 * Honest empty surface for G0-4 Absents and other Nest-missing Admin modules.
 * Never fabricates rows or success states.
 */
export function AdminUnavailableState({ title, description }: AdminUnavailableStateProps) {
  return (
    <AlEmptyState
      title={title}
      description={description ?? ADMIN_PRODUCT_BLOCKED_MESSAGE}
      compact
    />
  );
}
