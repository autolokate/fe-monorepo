import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/**
 * Admin Expert marketplace authorship — Nest `/admin/v1/experts*` + `/admin/v1/expert-bookings`.
 * OPERATOR + step_up. `GET /admin/v1/experts[?status]` + `GET /admin/v1/experts/{id}` read every
 * status (INACTIVE included) so the edit form can prefill from the stored profile.
 */

export const ADMIN_EXPERT_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type AdminExpertStatus = (typeof ADMIN_EXPERT_STATUSES)[number];

/** OpenAPI `UpsertExpertDto` (omit `id` to create). */
export type UpsertAdminExpertBody = {
  id?: string;
  name: string;
  designation?: string;
  bio?: string;
  expertise?: string[];
  channelUrl?: string;
  rating?: number;
  sessionsCompleted?: number;
  status?: AdminExpertStatus;
  photoAsset?: string;
};

/** OpenAPI `ExpertProfileDto` */
export type AdminExpertProfileDto = {
  id: string;
  name: string;
  designation: string;
  bio: string;
  expertise: string[];
  channelUrl?: string;
  rating?: number;
  sessionsCompleted?: number;
  photoAsset?: string;
};

/** OpenAPI `AdminExpertDto` — the full stored profile, any status (admin read). */
export type AdminExpertDto = {
  id: string;
  name: string;
  designation: string;
  bio: string;
  expertise: string[];
  channelUrl: string | null;
  rating: number | null;
  sessionsCompleted: number;
  status: AdminExpertStatus;
  /** Bundle resource name (no extension) — not a remote URL. */
  photoAsset: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListAdminExpertsQuery = {
  /** Omit for every status. */
  status?: AdminExpertStatus;
};

/** OpenAPI `UpsertExpertSessionTypeDto` (omit `id` to create). */
export type UpsertAdminExpertSessionTypeBody = {
  id?: string;
  code: string;
  title: string;
  durationMinutes: number;
  subtitle?: string;
  priceInr?: number;
  priceSource?: string;
  bookable?: boolean;
};

/** OpenAPI `ExpertSessionTypeDto` */
export type AdminExpertSessionTypeDto = {
  id: string;
  title: string;
  durationMinutes: number;
  subtitle: string;
  priceInr?: number;
  priceSource: string;
  bookable: boolean;
};

/** OpenAPI `PublishExpertSlotsDto` */
export type PublishAdminExpertSlotsBody = {
  /** yyyy-MM-dd */
  slotDate: string;
  slots: Array<{ startTime: string; endTime: string; period: string }>;
};

/** OpenAPI `ExpertTimeSlotDto` */
export type AdminExpertTimeSlotDto = {
  id: string;
  dateKey: string;
  startLabel: string;
  endLabel: string;
  period: string;
  status: 'available' | 'blocked';
};

/** OpenAPI `ExpertBookingDto` */
export type AdminExpertBookingDto = {
  id: string;
  expertId: string;
  sessionTypeId: string;
  durationMinutes: number;
  dateKey: string;
  startLabel: string;
  endLabel: string;
  topic: string;
  vehicleLabel?: string;
  status: string;
  paymentStatus: string;
  amountInr: number;
  createdAtLabel: string;
};

type RequestOptions = { signal?: AbortSignal };

function signalOption(options: RequestOptions): RequestOptions {
  return options.signal ? { signal: options.signal } : {};
}

/** GET /admin/v1/experts[?status=ACTIVE|INACTIVE] */
export async function listAdminExperts(
  client: ApiClient,
  query: ListAdminExpertsQuery = {},
  options: RequestOptions = {},
): Promise<AdminExpertDto[]> {
  const path = query.status
    ? `${endpoints.adminExperts.experts}?status=${encodeURIComponent(query.status)}`
    : endpoints.adminExperts.experts;
  const response = await client.get<unknown>(path, signalOption(options));
  return unwrapEnvelope(response) as AdminExpertDto[];
}

/** GET /admin/v1/experts/{id} — the stored profile used to prefill the edit form. */
export async function getAdminExpert(
  client: ApiClient,
  expertId: string,
  options: RequestOptions = {},
): Promise<AdminExpertDto> {
  const response = await client.get<unknown>(
    endpoints.adminExperts.expert(expertId),
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminExpertDto;
}

/** PUT /admin/v1/experts — create or update an expert profile. */
export async function upsertAdminExpert(
  client: ApiClient,
  body: UpsertAdminExpertBody,
  options: RequestOptions = {},
): Promise<AdminExpertProfileDto> {
  const response = await client.put<unknown>(
    endpoints.adminExperts.upsertExpert,
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminExpertProfileDto;
}

/** PUT /admin/v1/experts/{id}/session-types */
export async function upsertAdminExpertSessionType(
  client: ApiClient,
  expertId: string,
  body: UpsertAdminExpertSessionTypeBody,
  options: RequestOptions = {},
): Promise<AdminExpertSessionTypeDto> {
  const response = await client.put<unknown>(
    endpoints.adminExperts.sessionTypes(expertId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminExpertSessionTypeDto;
}

/** POST /admin/v1/experts/{id}/slots — bulk publish the supplied windows for one date. */
export async function publishAdminExpertSlots(
  client: ApiClient,
  expertId: string,
  body: PublishAdminExpertSlotsBody,
  options: RequestOptions = {},
): Promise<AdminExpertTimeSlotDto[]> {
  const response = await client.post<unknown>(
    endpoints.adminExperts.slots(expertId),
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminExpertTimeSlotDto[];
}

/** POST /admin/v1/expert-bookings/{id}/confirm — PENDING→CONFIRMED only. */
export async function confirmAdminExpertBooking(
  client: ApiClient,
  bookingId: string,
  options: RequestOptions = {},
): Promise<AdminExpertBookingDto> {
  const response = await client.post<unknown>(
    endpoints.adminExperts.confirmBooking(bookingId),
    {},
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminExpertBookingDto;
}
