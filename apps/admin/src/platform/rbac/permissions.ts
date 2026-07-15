/** Admin RBAC roles — aligned with backend session roles from POST /v1/auth/session. */
export type AdminRole =
  | 'SUPER_ADMIN'
  | 'OPS'
  | 'SUPPORT'
  | 'FINANCE'
  | 'PARTNER_MANAGER'
  | 'READ_ONLY';

/** API session role strings that map to an internal admin role. */
function resolveApiRoleAlias(normalized: string): AdminRole | null {
  if (normalized === 'ADMIN') {
    return 'SUPER_ADMIN';
  }
  return null;
}

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
  | 'orders:view'
  | 'subscriptions:view'
  | 'audit:read'
  | 'audit:view'
  | 'settlements:write'
  | 'clawbacks:write'
  | 'partners:read'
  | 'partners:write'
  | 'settings:read'
  | 'settings:write'
  | 'users:read'
  | 'users:write';

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  SUPER_ADMIN: [
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
    // Catalog writes move money: a price, a shelf, a default plan. SUPER_ADMIN only.
    'catalog:read',
    'catalog:write',
    'orders:view',
    'subscriptions:view',
    'audit:read',
    'audit:view',
    'settlements:write',
    'clawbacks:write',
    'partners:read',
    'partners:write',
    'settings:read',
    'settings:write',
    // Role grant/revoke is SUPER_ADMIN-only (14-roles §14.6) — no other tier may escalate privilege.
    'users:read',
    'users:write',
  ],
  OPS: [
    'dashboard:view',
    'inventory:view',
    'inventory:read',
    'inventory:write',
    'qr-batches:read',
    'qr-batches:write',
    'qr-lifecycle:write',
    // READ, not write: OPS manufactures batches AGAINST a Sku, so it has to be able to see which Sku it is
    // picking and what that Sku actually sells (its shelf) — `GET /admin/v1/skus` is an OPS route in the
    // locked contract. Authoring the catalog (prices, shelves) stays with FINANCE.
    'catalog:read',
    'promos:read',
    'promo:view',
    'orders:view',
    'subscriptions:view',
    'audit:read',
    'audit:view',
    'partners:read',
  ],
  SUPPORT: [
    'dashboard:view',
    'inventory:view',
    'inventory:read',
    'orders:view',
    'subscriptions:view',
    'audit:read',
    'audit:view',
    'partners:read',
  ],
  FINANCE: [
    'dashboard:view',
    'audit:read',
    'audit:view',
    'settlements:write',
    'clawbacks:write',
    'promos:read',
    'promo:view',
    'catalog:read',
    'orders:view',
    'subscriptions:view',
  ],
  PARTNER_MANAGER: [
    'dashboard:view',
    'inventory:view',
    'inventory:read',
    'partners:read',
    'partners:write',
    'orders:view',
    'subscriptions:view',
    'audit:read',
    'audit:view',
  ],
  READ_ONLY: [
    'dashboard:view',
    'inventory:view',
    'inventory:read',
    'qr-batches:read',
    'promos:read',
    'promo:view',
    'catalog:read',
    'orders:view',
    'subscriptions:view',
    'audit:read',
    'audit:view',
    'partners:read',
  ],
};

export function normalizeAdminRole(role: string | null | undefined): AdminRole {
  const normalized = role?.toUpperCase().replace(/-/g, '_');
  if (!normalized) {
    return 'READ_ONLY';
  }
  const aliasRole = resolveApiRoleAlias(normalized);
  if (aliasRole) {
    return aliasRole;
  }
  if (normalized in ROLE_PERMISSIONS) {
    return normalized as AdminRole;
  }
  return 'READ_ONLY';
}

export function roleHasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function resolvePermissions(role: AdminRole): readonly AdminPermission[] {
  return ROLE_PERMISSIONS[role];
}
