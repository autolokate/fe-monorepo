import type {
  AdminUserDetailDto,
  AdminUserSummaryDto,
  AdminUserVehicleDto,
  AdminUsersPageResult,
  GrantableUserRole,
  ListAdminUsersQuery,
  PatchAdminUserBody,
} from '@autolokate/api-client';
import {
  findAdminUserByPhone,
  getAdminUser,
  listAdminUserVehicles,
  listAdminUsersPage,
  patchAdminUser,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import { throwAdminProductBlocked } from '@/platform/api/product-blocked';

export async function listUsers(
  query: ListAdminUsersQuery = {},
  signal?: AbortSignal,
): Promise<AdminUsersPageResult> {
  return listAdminUsersPage(getAdminApiClient(), query, { signal });
}

export async function lookupUserByPhone(
  phone: string,
  signal?: AbortSignal,
): Promise<AdminUserSummaryDto> {
  return findAdminUserByPhone(getAdminApiClient(), phone, { signal });
}

export async function fetchUserDetail(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserDetailDto> {
  return getAdminUser(getAdminApiClient(), userId, { signal });
}

export async function updateUser(
  userId: string,
  body: PatchAdminUserBody,
  signal?: AbortSignal,
): Promise<AdminUserSummaryDto> {
  return patchAdminUser(getAdminApiClient(), userId, body, { signal });
}

export async function fetchUserVehicles(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserVehicleDto[]> {
  return listAdminUserVehicles(getAdminApiClient(), userId, { signal });
}

/** POST …/users/{userId}/roles — G0-4 Absent. Fail closed. */
export function grantRole(
  _userId: string,
  _role: GrantableUserRole,
  _signal?: AbortSignal,
): Promise<AdminUserSummaryDto> {
  throwAdminProductBlocked('POST /admin/v1/users/{userId}/roles');
}

/** DELETE …/users/{userId}/roles/{role} — G0-4 Absent. Fail closed. */
export function revokeRole(
  _userId: string,
  _role: GrantableUserRole,
  _signal?: AbortSignal,
): Promise<AdminUserSummaryDto> {
  throwAdminProductBlocked('DELETE /admin/v1/users/{userId}/roles/{role}');
}
