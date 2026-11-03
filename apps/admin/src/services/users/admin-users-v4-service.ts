import type {
  AdminActiveVehicleDuplicatesDto,
  AdminDriverInviteDto,
  AdminDriverScoreDto,
  AdminNotificationAudience,
  AdminPlateCollisionDto,
  AdminPlateKeyBackfillResultDto,
  AdminPlateVehicleDto,
  AdminScanAbuseDto,
  AdminScanLookupDto,
  AdminSystemNotificationBody,
  AdminSystemNotificationResultDto,
  AdminUserDeviceDto,
  AdminUserNotificationDto,
  AdminUserTripDto,
  AdminV4Page,
  ListAdminScanLookupsQuery,
} from '@autolokate/api-client';
import {
  clearAdminScanFlag,
  getAdminActiveVehicleDuplicates,
  getAdminScanAbuse,
  getAdminUserDriverScore,
  listAdminPlateCollisions,
  listAdminScanLookups,
  listAdminUnparsedPlates,
  listAdminUserDevices,
  listAdminUserDriverInvites,
  listAdminUserNotifications,
  listAdminUserTrips,
  listAdminVehicleDriverInvites,
  runAdminPlateKeyBackfill,
  searchAdminVehiclesByPlate,
  sendAdminSystemNotification,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export const DRIVER_INVITES_PAGE_SIZE = 20;
export const NOTIFICATIONS_PAGE_SIZE = 25;
/** Server max for `/users/{id}/trips`. */
export const TRIPS_PAGE_SIZE = 50;

/** GET /admin/v1/users/{userId}/driver-invites */
export function fetchUserDriverInvites(
  userId: string,
  cursor: string | undefined,
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminDriverInviteDto>> {
  return listAdminUserDriverInvites(
    getAdminApiClient(),
    userId,
    { limit: DRIVER_INVITES_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
    { signal },
  );
}

/** GET /admin/v1/vehicles/{vehicleId}/driver-invites */
export function fetchVehicleDriverInvites(
  vehicleId: string,
  cursor: string | undefined,
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminDriverInviteDto>> {
  return listAdminVehicleDriverInvites(
    getAdminApiClient(),
    vehicleId,
    { limit: DRIVER_INVITES_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
    { signal },
  );
}

/** GET /admin/v1/users/{userId}/notifications — every page writes `NOTIFICATION_INBOX_ACCESS`. */
export function fetchUserNotifications(
  userId: string,
  audience: AdminNotificationAudience | undefined,
  cursor: string | undefined,
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminUserNotificationDto>> {
  return listAdminUserNotifications(
    getAdminApiClient(),
    userId,
    {
      limit: NOTIFICATIONS_PAGE_SIZE,
      ...(audience ? { audience } : {}),
      ...(cursor ? { cursor } : {}),
    },
    { signal },
  );
}

/** GET /admin/v1/users/{userId}/devices */
export function fetchUserDevices(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminUserDeviceDto[]> {
  return listAdminUserDevices(getAdminApiClient(), userId, { signal });
}

/** GET /admin/v1/users/{userId}/trips — audited (`DRIVER_TRIP_ACCESS`). */
export function fetchUserTrips(
  userId: string,
  range: { from?: string; to?: string },
  cursor: string | undefined,
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminUserTripDto>> {
  return listAdminUserTrips(
    getAdminApiClient(),
    userId,
    { ...range, limit: TRIPS_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
    { signal },
  );
}

/** GET /admin/v1/users/{userId}/driver-score — audited (`DRIVER_TRIP_ACCESS`). */
export function fetchUserDriverScore(
  userId: string,
  signal?: AbortSignal,
): Promise<AdminDriverScoreDto> {
  return getAdminUserDriverScore(getAdminApiClient(), userId, { signal });
}

/** GET /admin/v1/vehicles?plate= */
export function fetchVehiclesByPlate(
  plate: string,
  signal?: AbortSignal,
): Promise<AdminPlateVehicleDto[]> {
  return searchAdminVehiclesByPlate(getAdminApiClient(), plate, { signal });
}

export function fetchScanLookups(
  query: ListAdminScanLookupsQuery,
  signal?: AbortSignal,
): Promise<AdminScanLookupDto[]> {
  return listAdminScanLookups(getAdminApiClient(), query, { signal });
}

export function fetchScanAbuse(hours: number, signal?: AbortSignal): Promise<AdminScanAbuseDto> {
  return getAdminScanAbuse(getAdminApiClient(), { hours }, { signal });
}

export function submitClearScanFlag(id: string): Promise<{ cleared: boolean }> {
  return clearAdminScanFlag(getAdminApiClient(), id);
}

export function fetchPlateCollisions(
  limit: number,
  signal?: AbortSignal,
): Promise<AdminPlateCollisionDto[]> {
  return listAdminPlateCollisions(getAdminApiClient(), { limit }, { signal });
}

export function fetchUnparsedPlates(
  limit: number,
  signal?: AbortSignal,
): Promise<AdminPlateVehicleDto[]> {
  return listAdminUnparsedPlates(getAdminApiClient(), { limit }, { signal });
}

export function submitPlateKeyBackfill(): Promise<AdminPlateKeyBackfillResultDto> {
  return runAdminPlateKeyBackfill(getAdminApiClient());
}

export function fetchActiveVehicleDuplicates(
  signal?: AbortSignal,
): Promise<AdminActiveVehicleDuplicatesDto> {
  return getAdminActiveVehicleDuplicates(getAdminApiClient(), { signal });
}

export function submitSystemNotification(
  body: AdminSystemNotificationBody,
): Promise<AdminSystemNotificationResultDto> {
  return sendAdminSystemNotification(getAdminApiClient(), body);
}
