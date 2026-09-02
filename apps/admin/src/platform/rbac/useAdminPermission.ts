import { useMemo } from 'react';

import { useAdminAuth } from '@/providers/AdminAuthProvider';
import {
  roleHasPermission,
  resolvePermissions,
  type AdminPermission,
  type AdminRole,
} from '@/platform/rbac/permissions';

export function useAdminPermission(permission: AdminPermission): boolean {
  const { adminRole } = useAdminAuth();
  return useMemo(() => roleHasPermission(adminRole, permission), [adminRole, permission]);
}

export function useAdminRole(): AdminRole {
  const { adminRole } = useAdminAuth();
  return adminRole;
}

export function useAdminPermissions(): readonly AdminPermission[] {
  const { adminRole } = useAdminAuth();
  return useMemo(() => resolvePermissions(adminRole), [adminRole]);
}

export function useAdminAnyPermission(permissions: readonly AdminPermission[]): boolean {
  const granted = useAdminPermissions();
  return useMemo(
    () => permissions.some((permission) => granted.includes(permission)),
    [granted, permissions],
  );
}
