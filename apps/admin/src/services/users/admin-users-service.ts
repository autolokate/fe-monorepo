import type {
  AdminUserDetailDto,
  AdminUserEntitlementsDto,
  AdminUserStreakDto,
  AdminUserEmergencyContactDto,
  AdminUserExpenseDto,
  AdminUserMaintenanceJobDto,
  AdminUserMaintenanceScheduleDto,
  AdminUserServiceLogDto,
  AdminUserSummaryDto,
  AdminUserVehicleDocumentDto,
  AdminUserVehicleDto,
  AdminUsersPageResult,
  AdminVehicleDriversDto,
  GrantableUserRole,
  ListAdminUsersQuery,
  PatchAdminUserBody,
} from '@autolokate/api-client';
import {
  findAdminUserByPhone,
  getAdminUserEntitlements,
  getAdminUserStreak,
  getAdminUser,
  getAdminVehicleDrivers,
  grantUserRole,
  listAdminUserEmergencyContacts,
  listAdminUserExpenses,
  listAdminUserMaintenanceJobs,
  listAdminUserMaintenanceSchedule,
  listAdminUserServiceLogs,
  listAdminUserVehicleDocuments,
  listAdminUserVehicles,
  listAdminUsersPage,
  patchAdminUser,
  revokeUserRole,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

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

/** POST /admin/v1/users/{userId}/roles — grant CONSUMER or OPERATOR (idempotent, audited). */
export async function grantRole(
  userId: string,
  role: GrantableUserRole,
  signal?: AbortSignal,
): Promise<AdminUserSummaryDto> {
  return grantUserRole(getAdminApiClient(), userId, role, { signal });
}

/** DELETE /admin/v1/users/{userId}/roles/{role} — revoke (409 `last_admin` / `last_role` guards). */
export async function revokeRole(
  userId: string,
  role: GrantableUserRole,
  signal?: AbortSignal,
): Promise<AdminUserSummaryDto> {
  return revokeUserRole(getAdminApiClient(), userId, role, { signal });
}

/** GET /admin/v1/users/{userId}/entitlements — what the consumer app sees (paid, tier, premium flags, vehicle roles). */
export async function fetchUserEntitlements(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserEntitlementsDto> {
  return getAdminUserEntitlements(getAdminApiClient(), userId, { signal });
}

/** GET /admin/v1/users/{userId}/streak — IST-day streak with weekly forgiveness. */
export async function fetchUserStreak(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserStreakDto> {
  return getAdminUserStreak(getAdminApiClient(), userId, { signal });
}

/** GET /admin/v1/vehicles/{vehicleId}/drivers — owner + every driver membership on one vehicle. */
export async function fetchVehicleDrivers(
  vehicleId: string,
  signal?: AbortSignal,
): Promise<AdminVehicleDriversDto> {
  return getAdminVehicleDrivers(getAdminApiClient(), vehicleId, { signal });
}
