import type { AdminSupportTicketStatus } from '@autolokate/api-client';
import { ApiError } from '@autolokate/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supportTicketsQueryKeys } from '@/hooks/support/useSupportTickets';
import { resolveSubmitErrorMessage } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { updateSupportTicketStatus } from '@/services/support/support-service';

/** Inline copy for a failed triage; 409 means someone else moved the ticket (or it is CLOSED). */
export function describeTicketStatusError(error: unknown): string {
  if (error instanceof ApiError && error.code === 'support_ticket_invalid_transition') {
    return 'That status change isn’t allowed from the ticket’s current status (it may have changed meanwhile, and CLOSED is final). Refresh and try again.';
  }
  return resolveSubmitErrorMessage(error);
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({
      ticketId,
      status,
      note,
      signal,
    }: {
      ticketId: string;
      status: AdminSupportTicketStatus;
      note?: string;
      signal?: AbortSignal;
    }) => updateSupportTicketStatus(ticketId, note ? { status, note } : { status }, signal),
    retry: 0,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: supportTicketsQueryKeys.all });
      showSuccessToast(`Ticket set to ${result.status}.`);
    },
    onError: (error) => {
      if (!(error instanceof ApiError && (error.status === 409 || error.status === 400))) {
        reportAdminApiError(error, { context: 'support:write', toast: true });
      }
    },
  });

  return {
    statusMutation,
    describeError: describeTicketStatusError,
  };
}
