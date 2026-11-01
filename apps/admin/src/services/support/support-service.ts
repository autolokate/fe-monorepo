import {
  getAdminSupportTicket,
  listAdminSupportTicketsPage,
  updateAdminSupportTicketStatus,
  type AdminSupportTicket,
  type AdminSupportTicketsPageResult,
  type ListAdminSupportTicketsQuery,
  type UpdateSupportTicketStatusBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/support/tickets — keyset-paginated list (subject only; no customer body). */
export async function fetchSupportTicketsPage(
  query: ListAdminSupportTicketsQuery = {},
  signal?: AbortSignal,
): Promise<AdminSupportTicketsPageResult> {
  return listAdminSupportTicketsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/support/tickets/{ticketId} — `body` is always "" (privacy by design). */
export async function fetchSupportTicket(
  ticketId: string,
  signal?: AbortSignal,
): Promise<AdminSupportTicket> {
  return getAdminSupportTicket(getAdminApiClient(), ticketId, { signal });
}

/** PATCH /admin/v1/support/tickets/{ticketId} — status + optional ops note (audited). */
export async function updateSupportTicketStatus(
  ticketId: string,
  body: UpdateSupportTicketStatusBody,
  signal?: AbortSignal,
): Promise<AdminSupportTicket> {
  return updateAdminSupportTicketStatus(getAdminApiClient(), ticketId, body, { signal });
}
