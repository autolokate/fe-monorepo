import { useAdminAnyPermission } from '@/platform/rbac/useAdminPermission';

/** POST /admin/v1/qr-batches and inventory-related batch mutations. */
export function useCanWriteInventoryMutations(): boolean {
  return useAdminAnyPermission(['inventory:write', 'qr-batches:write']);
}

/** POST /admin/v1/qr/{code}/replace|retire and batch generate/provision. */
export function useCanRunQrLifecycleMutations(): boolean {
  return useAdminAnyPermission(['qr-lifecycle:write', 'inventory:write', 'qr-batches:write']);
}

/** POST /admin/v1/promos */
export function useCanWritePromoMutations(): boolean {
  return useAdminAnyPermission(['promo:write', 'promos:write']);
}
