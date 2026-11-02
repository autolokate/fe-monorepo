import {
  confirmAdminExpertBooking,
  getAdminExpert,
  listAdminExperts,
  publishAdminExpertSlots,
  upsertAdminExpert,
  upsertAdminExpertSessionType,
  type AdminExpertStatus,
  type PublishAdminExpertSlotsBody,
  type UpsertAdminExpertBody,
  type UpsertAdminExpertSessionTypeBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export const fetchExperts = (status: AdminExpertStatus | undefined, signal?: AbortSignal) =>
  listAdminExperts(getAdminApiClient(), status ? { status } : {}, { signal });
export const fetchExpert = (expertId: string, signal?: AbortSignal) =>
  getAdminExpert(getAdminApiClient(), expertId, { signal });
export const saveExpert = (body: UpsertAdminExpertBody) =>
  upsertAdminExpert(getAdminApiClient(), body);
export const saveExpertSessionType = (expertId: string, body: UpsertAdminExpertSessionTypeBody) =>
  upsertAdminExpertSessionType(getAdminApiClient(), expertId, body);
export const publishExpertSlots = (expertId: string, body: PublishAdminExpertSlotsBody) =>
  publishAdminExpertSlots(getAdminApiClient(), expertId, body);
export const confirmExpertBooking = (bookingId: string) =>
  confirmAdminExpertBooking(getAdminApiClient(), bookingId);
