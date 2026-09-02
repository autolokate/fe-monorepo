import { useAdminAnyPermission } from '@/platform/rbac/useAdminPermission';

/** POST /admin/v1/qr-batches and inventory-related batch mutations. */
export function useCanWriteInventoryMutations(): boolean {
  return useAdminAnyPermission(['inventory:write', 'qr-batches:write']);
}

/** POST /admin/v1/qr/{code}/replace|retire and batch generate/provision/distribute. */
export function useCanRunQrLifecycleMutations(): boolean {
  return useAdminAnyPermission(['qr-lifecycle:write', 'inventory:write', 'qr-batches:write']);
}

/** POST /admin/v1/promos */
export function useCanWritePromoMutations(): boolean {
  return useAdminAnyPermission(['promo:write', 'promos:write']);
}

/** POST/PATCH /admin/v1/plans and /admin/v1/skus — minting plan versions, editing shelves and prices. */
export function useCanWriteCatalogMutations(): boolean {
  return useAdminAnyPermission(['catalog:write']);
}

/** POST /admin/v1/orders/{orderId}/refund — a full money refund (FINANCE·step_up). */
export function useCanRefundOrders(): boolean {
  return useAdminAnyPermission(['orders:refund']);
}

/** PATCH /admin/v1/support/tickets/{ticketId} — status triage (SUPPORT/OPS/SUPER_ADMIN). */
export function useCanWriteSupportTickets(): boolean {
  return useAdminAnyPermission(['support:write']);
}

/** POST /admin/v1/shipments/{orderId}/status — the manual shipment milestone mark (OPS/FINANCE). */
export function useCanUpdateShipments(): boolean {
  return useAdminAnyPermission(['shipments:update']);
}
