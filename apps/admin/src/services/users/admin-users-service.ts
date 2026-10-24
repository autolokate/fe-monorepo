import type { AdminUserDto, GrantableUserRole } from '@autolokate/api-client';
import { findAdminUserByPhone } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import { throwAdminProductBlocked } from '@/platform/api/product-blocked';

export async function lookupUserByPhone(
  phone: string,
  signal?: AbortSignal,
): Promise<AdminUserDto> {
  return findAdminUserByPhone(getAdminApiClient(), phone, { signal });
}

/** POST …/users/{userId}/roles — G0-4 Absent. Fail closed. */
export function grantRole(
  _userId: string,
  _role: GrantableUserRole,
  _signal?: AbortSignal,
): Promise<AdminUserDto> {
  throwAdminProductBlocked('POST /admin/v1/users/{userId}/roles');
}

/** DELETE …/users/{userId}/roles/{role} — G0-4 Absent. Fail closed. */
export function revokeRole(
  _userId: string,
  _role: GrantableUserRole,
  _signal?: AbortSignal,
): Promise<AdminUserDto> {
  throwAdminProductBlocked('DELETE /admin/v1/users/{userId}/roles/{role}');
}
