import type { AdminSosResolution, AdminSosSummary } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { Ambulance, CheckCircle2, NotebookPen, PhoneCall, Users } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import { sosErrorView, type SosErrorView } from '@/features/sos/sos-errors';
import {
  sosActionAvailability,
  sosNoteError,
  SOS_NOTE_MAX,
  type SosActionKey,
} from '@/features/sos/sos-model';
import { useSosAction } from '@/hooks/sos/useSosIncidents';
import { notifyAdminStepUpRequired } from '@/platform/api/admin-api-client';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import type { SosOperatorAction } from '@/services/sos/sos-service';

type DialogKind = SosActionKey;

const COPY: Record<
  DialogKind,
  { title: string; description: string; confirm: string; success: string; destructive?: boolean }
> = {
  'notify-family': {
    title: 'Notify family now?',
    description:
      'Starts a new round: every emergency contact gets an IVR voice call and a WhatsApp with the live-location link.',
    confirm: 'Call + WhatsApp family',
    success: 'Family notification round started.',
  },
  'request-ambulance': {
    title: 'Request an ambulance?',
    description:
      'Releases the ambulance leg to the dispatch flow (Medulance → backup → 112) using the latest location. This cannot be recalled from here.',
    confirm: 'Request ambulance',
    success: 'Ambulance requested.',
    destructive: true,
  },
  'call-user': {
    title: 'Call the user again?',
    description:
      'Places another Autolokate safety call. If the user presses 2 on it, family + ambulance activate automatically.',
    confirm: 'Place safety call',
    success: 'Safety call requested.',
  },
  resolve: {
    title: 'Close this emergency',
    description:
      'Resolves the incident and stops any further automatic step. Choose False alarm when nobody needed help.',
    confirm: 'Close incident',
    success: 'Incident closed.',
  },
  note: {
    title: 'Add a note',
    description: 'Notes are encrypted and shown on the incident timeline to every operator.',
    confirm: 'Add note',
    success: 'Note added.',
  },
};

function ActionError({ view }: { view: SosErrorView }) {
  return (
    <div className="admin-form-error sos-action-error" role="alert" data-testid="sos-action-error">
      <p>{view.message}</p>
      {view.stepUp ? (
        <AlButton size="sm" variant="primary" onClick={notifyAdminStepUpRequired}>
          Sign in again
        </AlButton>
      ) : null}
    </div>
  );
}

function ActionButton({
  label,
  icon,
  testId,
  enabled,
  reason,
  variant = 'secondary',
  onClick,
}: {
  label: string;
  icon: ReactNode;
  testId: string;
  enabled: boolean;
  reason: string | null;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  onClick: () => void;
}) {
  return (
    <AlButton
      size="sm"
      variant={variant}
      icon={icon}
      disabled={!enabled}
      title={reason ?? undefined}
      data-testid={testId}
      onClick={onClick}
    >
      {label}
    </AlButton>
  );
}

/**
 * Operator actions for one SOS. Buttons mirror the server's state guards; every action asks for
 * confirmation, is never optimistic (the view refetches after), and keeps the dialog open on error.
 */
export function SosActionBar({
  incident,
}: {
  incident: Pick<AdminSosSummary, 'incidentId' | 'state' | 'ambulanceReleasedAt' | 'resolution'>;
}) {
  const canWrite = useAdminPermission('sos:write');
  const mutation = useSosAction(incident.incidentId);
  const [open, setOpen] = useState<DialogKind | null>(null);
  const [outcome, setOutcome] = useState<AdminSosResolution>('RESOLVED');
  const [note, setNote] = useState('');
  const [noteTouched, setNoteTouched] = useState(false);
  const noteId = useId();
  const availability = sosActionAvailability(incident);

  const openDialog = (kind: DialogKind) => {
    mutation.reset();
    setOutcome('RESOLVED');
    setNote('');
    setNoteTouched(false);
    setOpen(kind);
  };

  const confirm = () => {
    if (!open) return;
    let action: SosOperatorAction;
    if (open === 'resolve') action = { kind: 'resolve', outcome };
    else if (open === 'note') {
      if (sosNoteError(note)) {
        setNoteTouched(true);
        return;
      }
      action = { kind: 'note', text: note.trim() };
    } else action = { kind: open };
    const success = COPY[open].success;
    mutation.mutate(action, {
      onSuccess: () => {
        setOpen(null);
        showSuccessToast(success);
      },
    });
  };

  const gate = (key: SosActionKey) =>
    canWrite ? availability[key] : { enabled: false, reason: 'Read-only session.' };

  const copy = open ? COPY[open] : null;
  const noteError = sosNoteError(note);
  const errorView = mutation.isError ? sosErrorView(mutation.error) : null;

  return (
    <>
      <div className="sos-action-bar" role="toolbar" aria-label="Emergency actions">
        <ActionButton
          label="Notify family"
          icon={<Users size={15} aria-hidden />}
          testId="sos-action-notify-family"
          {...gate('notify-family')}
          onClick={() => {
            openDialog('notify-family');
          }}
        />
        <ActionButton
          label={incident.ambulanceReleasedAt ? 'Ambulance released' : 'Request ambulance'}
          icon={<Ambulance size={15} aria-hidden />}
          testId="sos-action-request-ambulance"
          variant="destructive"
          {...gate('request-ambulance')}
          onClick={() => {
            openDialog('request-ambulance');
          }}
        />
        <ActionButton
          label="Call user again"
          icon={<PhoneCall size={15} aria-hidden />}
          testId="sos-action-call-user"
          {...gate('call-user')}
          onClick={() => {
            openDialog('call-user');
          }}
        />
        <ActionButton
          label="Resolve / false alarm"
          icon={<CheckCircle2 size={15} aria-hidden />}
          testId="sos-action-resolve"
          {...gate('resolve')}
          onClick={() => {
            openDialog('resolve');
          }}
        />
        <ActionButton
          label="Add note"
          icon={<NotebookPen size={15} aria-hidden />}
          testId="sos-action-note"
          variant="outline"
          {...gate('note')}
          onClick={() => {
            openDialog('note');
          }}
        />
      </div>

      <AlModal
        open={open !== null}
        onOpenChange={(next) => {
          if (!next && mutation.isPending) return;
          if (!next) setOpen(null);
        }}
        title={copy?.title ?? ''}
        description={copy?.description ?? ''}
        footer={
          <div className="admin-modal-actions">
            <AlButton
              variant="secondary"
              disabled={mutation.isPending}
              data-testid="sos-dialog-cancel"
              onClick={() => {
                setOpen(null);
              }}
            >
              Cancel
            </AlButton>
            <AlButton
              variant={copy?.destructive ? 'destructive' : 'primary'}
              loading={mutation.isPending}
              disabled={mutation.isPending || (open === 'note' && noteError !== null)}
              data-testid="sos-dialog-confirm"
              onClick={confirm}
            >
              {open === 'resolve' && outcome === 'FALSE_ALARM' ? 'Mark false alarm' : copy?.confirm}
            </AlButton>
          </div>
        }
      >
        {open === 'resolve' ? (
          <fieldset className="sos-outcome" data-testid="sos-resolve-outcome">
            <legend className="sos-outcome__legend">Outcome</legend>
            {(
              [
                ['RESOLVED', 'Resolved', 'The situation was handled — help reached or not needed.'],
                ['FALSE_ALARM', 'False alarm', 'Triggered by mistake; flags the incident.'],
              ] as const
            ).map(([value, label, hint]) => (
              <label key={value} className="sos-outcome__option" htmlFor={`${noteId}-${value}`}>
                <input
                  id={`${noteId}-${value}`}
                  type="radio"
                  name="sos-outcome"
                  value={value}
                  checked={outcome === value}
                  data-testid={`sos-outcome-${value}`}
                  onChange={() => {
                    setOutcome(value);
                  }}
                />
                {label}
                <span className="admin-muted"> — {hint}</span>
              </label>
            ))}
          </fieldset>
        ) : null}
        {open === 'note' ? (
          <label className="admin-field" htmlFor={noteId}>
            Note
            <textarea
              id={noteId}
              rows={4}
              maxLength={SOS_NOTE_MAX}
              value={note}
              data-testid="sos-note-text"
              placeholder="What you did, who you spoke to, what happens next"
              aria-invalid={noteTouched && noteError !== null ? true : undefined}
              onBlur={() => {
                setNoteTouched(true);
              }}
              onChange={(event) => {
                setNote(event.target.value);
              }}
            />
            <span className="admin-field__hint">
              {noteTouched && noteError
                ? noteError
                : `${String(note.trim().length)}/${String(SOS_NOTE_MAX)}`}
            </span>
          </label>
        ) : null}
        {errorView ? <ActionError view={errorView} /> : null}
      </AlModal>
    </>
  );
}
