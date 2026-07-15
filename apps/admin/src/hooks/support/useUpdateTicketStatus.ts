import type { AdminSupportTicketStatus } from '@autolokate/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supportTicketsQueryKeys } from '@/hooks/support/useSupportTickets';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { updateSupportTicketStatus } from '@/services/support/support-service';

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({
      ticketId,
      status,
      signal,
    }: {
      ticketId: string;
      status: AdminSupportTicketStatus;
      signal?: AbortSignal;
    }) => updateSupportTicketStatus(ticketId, status, signal),
    retry: 0,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: supportTicketsQueryKeys.all });
      showSuccessToast(`Ticket set to ${result.status}.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'support:write', toast: true });
    },
  });

  return {
    statusMutation,
    mapMutationError: mapAdminApiError,
  };
}
