import {
  queryAuditEventsPage,
  type AuditEventsPageResult,
  type QueryAuditEventsParams,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchAuditEvents(
  params: QueryAuditEventsParams = {},
  signal?: AbortSignal,
): Promise<AuditEventsPageResult['events']> {
  const page = await fetchAuditEventsPage(params, signal);
  return page.events;
}

export async function fetchAuditEventsPage(
  params: QueryAuditEventsParams = {},
  signal?: AbortSignal,
): Promise<AuditEventsPageResult> {
  return queryAuditEventsPage(getAdminApiClient(), params, { signal });
}
