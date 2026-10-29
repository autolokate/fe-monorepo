import { ADMIN_PRODUCT_BLOCKED_MESSAGE } from '@/platform/api/product-blocked';

export type AdminUnavailableStateProps = {
  title: string;
  /** Absent / blocked operation (kept for call sites; not shown to operators). */
  operation?: string;
  description?: string;
};

/**
 * Honest empty surface for product-blocked Admin modules.
 * Never fabricates rows or success states.
 */
export function AdminUnavailableState({ title, description }: AdminUnavailableStateProps) {
  return (
    <div className="admin-panel admin-panel--empty" role="status">
      <h2 className="admin-panel__title">{title}</h2>
      <p className="admin-panel__subtitle">{description ?? ADMIN_PRODUCT_BLOCKED_MESSAGE}</p>
    </div>
  );
}
