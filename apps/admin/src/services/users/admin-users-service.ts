import type { AdminUserDto, GrantableUserRole } from '@autolokate/api-client';
import { findAdminUserByPhone, grantUserRole, revokeUserRole } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function lookupUserByPhone(
  phone: string,
  signal?: AbortSignal,
): Promise<AdminUserDto> {
  return findAdminUserByPhone(getAdminApiClient(), phone, { signal });
}

export async function grantRole(
  userId: string,
  role: GrantableUserRole,
  signal?: AbortSignal,
): Promise<AdminUserDto> {
  return grantUserRole(getAdminApiClient(), userId, role, { signal });
}

export async function revokeRole(
  userId: string,
  role: GrantableUserRole,
  signal?: AbortSignal,
): Promise<AdminUserDto> {
  return revokeUserRole(getAdminApiClient(), userId, role, { signal });
}
