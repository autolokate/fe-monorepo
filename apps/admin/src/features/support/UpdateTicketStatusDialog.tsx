import type { AdminSupportTicketStatus, AdminSupportTicketSummary } from '@autolokate/api-client';
import { AlButton, AlModal, AlSelect } from '@autolokate/ui';
import { useEffect, useRef, useState } from 'react';

import { SUPPORT_STATUS_FILTERS } from '@/features/support/support-filters';
import { useUpdateTicketStatus } from '@/hooks/support/useUpdateTicketStatus';

/** The four lifecycle statuses, without the list-only `ALL` sentinel. */
const STATUS_OPTIONS = SUPPORT_STATUS_FILTERS.filter(
  (option): option is { value: AdminSupportTicketStatus; label: string } => option.value !== 'ALL',
);

export type UpdateTicketStatusDialogProps = {
  /** The ticket to triage; `null` closes the dialog. */
  ticket: AdminSupportTicketSummary | null;
  onOpenChange: (open: boolean) => void;
};

/** Confirmation-gated status triage for a support ticket — a single lifecycle transition. */
export function UpdateTicketStatusDialog({ ticket, onOpenChange }: UpdateTicketStatusDialogProps) {
  const open = ticket !== null;
  const abortRef = useRef<AbortController | null>(null);
  const { statusMutation, mapMutationError } = useUpdateTicketStatus();
  const [status, setStatus] = useState<AdminSupportTicketStatus>('OPEN');

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
    } else {
      abortRef.current?.abort();
      abortRef.current = null;
    }
  }, [ticket]);

  const submitError = statusMutation.isError
    ? mapMutationError(statusMutation.error).userMessage
    : null;

  const unchanged = ticket !== null && status === ticket.status;

  const onSubmit = async () => {
    if (!ticket || unchanged) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await statusMutation.mutateAsync({
        ticketId: ticket.ticketId,
        status,
        signal: controller.signal,
      });
      onOpenChange(false);
    } catch {
      // Error surfaced via mutation state + toast.
    }
  };

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Change ticket status"
      description={
        ticket
          ? `Triage ticket "${ticket.subject}" — currently ${ticket.status}.`
          : 'Set the ticket status.'
      }
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="submit"
            form="update-ticket-status-form"
            variant="primary"
            size="sm"
            loading={statusMutation.isPending}
            disabled={statusMutation.isPending || unchanged}
          >
            Save status
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={statusMutation.isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
        </div>
      }
    >
      <form
        id="update-ticket-status-form"
        className="admin-form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <AlSelect
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as AdminSupportTicketStatus);
          }}
          helperText="Sets the ticket's lifecycle status."
        />

        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </form>
    </AlModal>
  );
}
