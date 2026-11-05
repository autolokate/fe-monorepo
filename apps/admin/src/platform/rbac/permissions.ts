/**
 * Admin authorization — mirrors what the SERVER enforces, nothing more.
 *
 * The backend has exactly one admin-plane role: `OPERATOR` (+ the `step_up` 2FA claim) on every
 * `/admin/v1/*` route (`@Roles('OPERATOR')` + `AdminPlaneGuard`). There are no server-side
 * sub-roles (finance / support / ops), so the console does not pretend to segregate duties: an
 * operator can use every module, and any other session gets the access-denied screen.
 * `ADMIN` is accepted as a legacy alias of `OPERATOR`.
 *
 * Permission names are kept as stable call-site labels (what a control needs), but they all
 * resolve to the single server role. If the BE ever ships sub-roles, map them here.
 */
export type AdminRole = 'OPERATOR' | 'NONE';

export type AdminPermission =
  | 'dashboard:view'
  | 'inventory:view'
  | 'inventory:read'
  | 'inventory:write'
  | 'qr-batches:read'
  | 'qr-batches:write'
  | 'qr-lifecycle:write'
  | 'promos:read'
  | 'promos:write'
  | 'promo:view'
  | 'promo:write'
  | 'catalog:read'
  | 'catalog:write'
  | 'discovery:read'
  | 'discovery:write'
  | 'orders:view'
  | 'orders:refund'
  | 'subscriptions:view'
  | 'shipments:view'
  | 'payments:view'
  | 'support:view'
  | 'support:write'
  | 'incidents:view'
  | 'sos:view'
  | 'sos:write'
  | 'audit:read'
  | 'audit:view'
  | 'settlements:write'
  | 'clawbacks:write'
  | 'partners:read'
  | 'partners:write'
  | 'settings:read'
  | 'settings:write'
  | 'users:read'
  | 'users:write'
  | 'taxi:read'
  | 'taxi:write'
  | 'experts:write'
  | 'website-bookings:view'
  | 'website-bookings:write'
  /**
   * Open the ownership-claim review. Approve / reject is further gated by the SERVER reviewer
   * allowlist (`GET /admin/v1/ownership-claims/review-access`), never by this label.
   */
  | 'ownership:review';

const ALL_PERMISSIONS: readonly AdminPermission[] = [
  'dashboard:view',
  'inventory:view',
  'inventory:read',
  'inventory:write',
  'qr-batches:read',
  'qr-batches:write',
  'qr-lifecycle:write',
  'promos:read',
  'promos:write',
  'promo:view',
  'promo:write',
  'catalog:read',
  'catalog:write',
  'discovery:read',
  'discovery:write',
  'orders:view',
  'orders:refund',
  'subscriptions:view',
  'shipments:view',
  'payments:view',
  'support:view',
  'support:write',
  'incidents:view',
  'sos:view',
  'sos:write',
  'audit:read',
  'audit:view',
  'settlements:write',
  'clawbacks:write',
  'partners:read',
  'partners:write',
  'settings:read',
  'settings:write',
  'users:read',
  'users:write',
  'taxi:read',
  'taxi:write',
  'experts:write',
  'website-bookings:view',
  'website-bookings:write',
  'ownership:review',
];

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  OPERATOR: ALL_PERMISSIONS,
  NONE: [],
};

/** Session roles the server accepts on the admin plane. */
export const ADMIN_PLANE_SESSION_ROLES = ['OPERATOR', 'ADMIN'] as const;

export function isAdminPlaneSessionRole(role: string | null | undefined): boolean {
  const normalized = role?.toUpperCase();
  return normalized === 'OPERATOR' || normalized === 'ADMIN';
}

export function normalizeAdminRole(role: string | null | undefined): AdminRole {
  return isAdminPlaneSessionRole(role) ? 'OPERATOR' : 'NONE';
}

export function roleHasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function resolvePermissions(role: AdminRole): readonly AdminPermission[] {
  return ROLE_PERMISSIONS[role];
}
