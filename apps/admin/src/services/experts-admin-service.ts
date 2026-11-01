import {
  confirmAdminExpertBooking,
  publishAdminExpertSlots,
  upsertAdminExpert,
  upsertAdminExpertSessionType,
  type PublishAdminExpertSlotsBody,
  type UpsertAdminExpertBody,
  type UpsertAdminExpertSessionTypeBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export const saveExpert = (body: UpsertAdminExpertBody) =>
  upsertAdminExpert(getAdminApiClient(), body);
export const saveExpertSessionType = (expertId: string, body: UpsertAdminExpertSessionTypeBody) =>
  upsertAdminExpertSessionType(getAdminApiClient(), expertId, body);
export const publishExpertSlots = (expertId: string, body: PublishAdminExpertSlotsBody) =>
  publishAdminExpertSlots(getAdminApiClient(), expertId, body);
export const confirmExpertBooking = (bookingId: string) =>
  confirmAdminExpertBooking(getAdminApiClient(), bookingId);
