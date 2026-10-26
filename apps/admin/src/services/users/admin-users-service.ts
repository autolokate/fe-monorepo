import type {
  AdminUserDetailDto,
  AdminUserEmergencyContactDto,
  AdminUserExpenseDto,
  AdminUserMaintenanceJobDto,
  AdminUserMaintenanceScheduleDto,
  AdminUserServiceLogDto,
  AdminUserSummaryDto,
  AdminUserVehicleDocumentDto,
  AdminUserVehicleDto,
  AdminUsersPageResult,
  GrantableUserRole,
  ListAdminUsersQuery,
  PatchAdminUserBody,
} from '@autolokate/api-client';
import {
  findAdminUserByPhone,
  getAdminUser,
  listAdminUserEmergencyContacts,
  listAdminUserExpenses,
  listAdminUserMaintenanceJobs,
  listAdminUserMaintenanceSchedule,
  listAdminUserServiceLogs,
  listAdminUserVehicleDocuments,
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

export async function fetchUserExpenses(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserExpenseDto[]> {
  return listAdminUserExpenses(getAdminApiClient(), userId, { signal });
}

export async function fetchUserMaintenanceJobs(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserMaintenanceJobDto[]> {
  return listAdminUserMaintenanceJobs(getAdminApiClient(), userId, { signal });
}

export async function fetchUserMaintenanceSchedule(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserMaintenanceScheduleDto[]> {
  return listAdminUserMaintenanceSchedule(getAdminApiClient(), userId, { signal });
}

export async function fetchUserServiceLogs(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserServiceLogDto[]> {
  return listAdminUserServiceLogs(getAdminApiClient(), userId, { signal });
}

export async function fetchUserVehicleDocuments(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserVehicleDocumentDto[]> {
  return listAdminUserVehicleDocuments(getAdminApiClient(), userId, { signal });
}

export async function fetchUserEmergencyContacts(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserEmergencyContactDto[]> {
  return listAdminUserEmergencyContacts(getAdminApiClient(), userId, { signal });
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
