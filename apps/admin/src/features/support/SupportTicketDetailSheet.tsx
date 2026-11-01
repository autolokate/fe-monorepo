import type { AdminSupportTicket, AdminSupportTicketStatus } from '@autolokate/api-client';
import { AlButton, AlModal, AlSelect, AlStack } from '@autolokate/ui';
import { useEffect, useState } from 'react';

import {
  SUPPORT_BODY_PRIVACY_NOTE,
  SUPPORT_TICKET_TRANSITIONS,
} from '@/features/support/support-filters';
import { useSupportTicketDetail } from '@/hooks/support/useSupportTickets';
import { useUpdateTicketStatus } from '@/hooks/support/useUpdateTicketStatus';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { humanizeAdminLabel, shortAdminId } from '@/platform/components/AdminWowSurface';
import { SupportTicketStatusBadge } from '@/platform/components/EntityStatusBadge';

const NOTE_MAX = 2000;

export type SupportTicketDetailSheetProps = {
  ticketId: string | null;
  /** Whether the signed-in operator may triage (`support:write`). */
  canTriage: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function TriageForm({ ticket }: { ticket: AdminSupportTicket }) {
  const options = SUPPORT_TICKET_TRANSITIONS[ticket.status];
  const { statusMutation, describeError } = useUpdateTicketStatus();
  const [status, setStatus] = useState<AdminSupportTicketStatus | ''>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setStatus('');
    setNote('');
    statusMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when the ticket's state changes
  }, [ticket.ticketId, ticket.status]);

  if (options.length === 0) {
    return <p className="admin-empty-note">This ticket is closed. Closed tickets are final.</p>;
  }

  const submitError = statusMutation.isError ? describeError(statusMutation.error) : null;

  return (
    <form
      className="admin-form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        if (!status) {
          return;
        }
        const trimmed = note.trim();
        statusMutation.mutate({
          ticketId: ticket.ticketId,
          status,
          ...(trimmed ? { note: trimmed } : {}),
        });
      }}
    >
      <AlSelect
        label="New status"
        placeholder="Choose a status"
        options={options.map((value) => ({ value, label: humanizeAdminLabel(value) }))}
        value={status}
        data-testid="support-ticket-status-select"
        onChange={(event) => {
          setStatus(event.target.value as AdminSupportTicketStatus);
        }}
        helperText={
          ticket.status === 'RESOLVED'
            ? 'Resolved tickets can be reopened (In progress) or closed. Closing is final.'
            : 'Closing is final.'
        }
      />
      <label className="admin-field admin-form-span" htmlFor="support-ticket-note">
        Ops note (optional)
        <textarea
          id="support-ticket-note"
          data-testid="support-ticket-note"
          rows={3}
          maxLength={NOTE_MAX}
          value={note}
          placeholder="What was done or decided"
          onChange={(event) => {
            setNote(event.target.value);
          }}
        />
        <span className="admin-field__hint">
          Replaces the current ops note. Stored encrypted; audited.
        </span>
      </label>
      {submitError ? (
        <p className="admin-form-error" role="alert" data-testid="support-ticket-status-error">
          {submitError}
        </p>
      ) : null}
      <div className="admin-modal-actions">
        <AlButton
          type="submit"
          size="sm"
          data-testid="support-ticket-status-submit"
          loading={statusMutation.isPending}
          disabled={statusMutation.isPending || !status}
        >
          Save status
        </AlButton>
      </div>
    </form>
  );
}

/** Ticket detail + triage. The customer's message is intentionally not shown (never decrypted). */
export function SupportTicketDetailSheet({
  ticketId,
  canTriage,
  onOpenChange,
}: SupportTicketDetailSheetProps) {
  const { ticket, isLoading, userErrorMessage } = useSupportTicketDetail(ticketId);
  const metadataEntries = ticket?.metadata ? Object.entries(ticket.metadata) : [];

  return (
    <AlModal
      open={ticketId !== null}
      onOpenChange={onOpenChange}
      size="lg"
      title={ticket?.subject ?? 'Support ticket'}
      description="Ticket context, ops note, and triage."
    >
      {isLoading ? <AdminPageLoader label="Loading ticket…" /> : null}
      {!isLoading && userErrorMessage ? (
        <p className="admin-form-error" role="alert">
          {userErrorMessage}
        </p>
      ) : null}
      {!isLoading && ticket ? (
        <AlStack gap="md">
          <AdminDetailSection title="Ticket">
            <AdminDetailGrid>
              <AdminDetailField
                label="Status"
                value={<SupportTicketStatusBadge status={ticket.status} />}
              />
              <AdminDetailField label="Type" value={humanizeAdminLabel(ticket.type)} />
              <AdminDetailField label="Account" value={shortAdminId(ticket.accountId)} mono />
              <AdminDetailField label="Ticket" value={shortAdminId(ticket.ticketId)} mono />
              <AdminDetailField label="Created" value={formatDateTime(ticket.createdAt)} />
              <AdminDetailField label="Updated" value={formatDateTime(ticket.updatedAt)} />
            </AdminDetailGrid>
          </AdminDetailSection>

          <AdminDetailSection title="Customer message">
            {/* `body` is always "" on the admin plane by privacy design — never render it as blank. */}
            <p className="admin-empty-note" data-testid="support-ticket-body-private">
              {SUPPORT_BODY_PRIVACY_NOTE}
            </p>
            {metadataEntries.length > 0 ? (
              <AdminDetailGrid>
                {metadataEntries.map(([key, value]) => (
                  <AdminDetailField
                    key={key}
                    label={humanizeAdminLabel(key)}
                    value={typeof value === 'string' ? value : JSON.stringify(value)}
                    mono
                  />
                ))}
              </AdminDetailGrid>
            ) : null}
          </AdminDetailSection>

          <AdminDetailSection title="Ops note">
            <AdminDetailGrid>
              <AdminDetailField
                label="Note"
                value={ticket.opsNote?.trim() ? ticket.opsNote : 'No ops note yet.'}
              />
              <AdminDetailField
                label="Last updated by"
                value={ticket.opsUpdatedByAdminId ? shortAdminId(ticket.opsUpdatedByAdminId) : '—'}
                mono
              />
            </AdminDetailGrid>
          </AdminDetailSection>

          {canTriage ? (
            <AdminDetailSection title="Triage" description="Move the ticket along its lifecycle.">
              <TriageForm ticket={ticket} />
            </AdminDetailSection>
          ) : null}
        </AlStack>
      ) : null}
    </AlModal>
  );
}
