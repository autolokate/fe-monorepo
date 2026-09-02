import {
  getAdminSupportTicket,
  listAdminSupportTicketsPage,
  updateAdminSupportTicketStatus,
  type AdminSupportTicket,
  type AdminSupportTicketStatus,
  type AdminSupportTicketsPageResult,
  type ListAdminSupportTicketsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/support/tickets — one keyset page of the account-wide ticket queue. */
export async function fetchSupportTicketsPage(
  query: ListAdminSupportTicketsQuery = {},
  signal?: AbortSignal,
): Promise<AdminSupportTicketsPageResult> {
  return listAdminSupportTicketsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/support/tickets/{ticketId} — one ticket in full (subject + body + metadata). */
export async function fetchSupportTicket(
  ticketId: string,
  signal?: AbortSignal,
): Promise<AdminSupportTicket> {
  return getAdminSupportTicket(getAdminApiClient(), ticketId, { signal });
}

/** PATCH /admin/v1/support/tickets/{ticketId} — triage a ticket by setting its status. */
export async function updateSupportTicketStatus(
  ticketId: string,
  status: AdminSupportTicketStatus,
  signal?: AbortSignal,
): Promise<AdminSupportTicket> {
  return updateAdminSupportTicketStatus(getAdminApiClient(), ticketId, status, { signal });
}
