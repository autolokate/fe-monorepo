import type {
  AdminSupportTicket,
  AdminSupportTicketStatus,
  AdminSupportTicketsPageResult,
  ListAdminSupportTicketsQuery,
} from '@autolokate/api-client';

import { throwAdminProductBlocked } from '@/platform/api/product-blocked';

/**
 * GET /admin/v1/support/tickets — absent from Nest Dev OA.
 * Fail closed; do not call the network.
 */
export function fetchSupportTicketsPage(
  _query: ListAdminSupportTicketsQuery = {},
  _signal?: AbortSignal,
): Promise<AdminSupportTicketsPageResult> {
  throwAdminProductBlocked('GET /admin/v1/support/tickets');
}

/**
 * GET /admin/v1/support/tickets/{ticketId} — absent from Nest Dev OA.
 * Fail closed; do not call the network.
 */
export function fetchSupportTicket(
  _ticketId: string,
  _signal?: AbortSignal,
): Promise<AdminSupportTicket> {
  throwAdminProductBlocked('GET /admin/v1/support/tickets/{ticketId}');
}

/**
 * PATCH /admin/v1/support/tickets/{ticketId} — absent from Nest Dev OA.
 * Fail closed; do not call the network.
 */
export function updateSupportTicketStatus(
  _ticketId: string,
  _status: AdminSupportTicketStatus,
  _signal?: AbortSignal,
): Promise<AdminSupportTicket> {
  throwAdminProductBlocked('PATCH /admin/v1/support/tickets/{ticketId}');
}
