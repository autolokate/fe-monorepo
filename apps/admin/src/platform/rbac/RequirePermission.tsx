import type { ReactNode } from 'react';

import { AlErrorState } from '@autolokate/ui';

import type { AdminPermission } from '@/platform/rbac/permissions';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

export type RequirePermissionProps = {
  permission: AdminPermission;
  children: ReactNode;
};

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const allowed = useAdminPermission(permission);

  if (!allowed) {
    return (
      <AlErrorState
        title="Access denied"
        message="You do not have permission to view this module."
      />
    );
  }

  return children;
}
