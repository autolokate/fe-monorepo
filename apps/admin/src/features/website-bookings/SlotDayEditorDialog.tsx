import type { AdminBookingSlotDto } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useState } from 'react';

import {
  draftFromSlots,
  draftToInput,
  validateSlotDraft,
  type SlotDraftRow,
} from '@/features/website-bookings/slot-draft';
import {
  describeWebsiteBookingError,
  usePublishBookingSlots,
} from '@/hooks/website-bookings/useWebsiteBookings';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

export type SlotDayEditorDialogProps = {
  /** The day being edited (YYYY-MM-DD); `null` closes the dialog. */
  date: string | null;
  /** The day's currently published slots (empty = unpublished). */
  slots: readonly AdminBookingSlotDto[];
  onOpenChange: (open: boolean) => void;
};

function nextRow(rows: readonly SlotDraftRow[]): SlotDraftRow {
  const last = [...rows].sort((a, b) => a.endTime.localeCompare(b.endTime)).at(-1);
  const start = last?.endTime ?? '10:00';
  const [h, m] = start.split(':').map(Number);
  const endMinutes = Math.min((h ?? 10) * 60 + (m ?? 0) + 30, 23 * 60 + 59);
  const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
  return {
    key: `new-${String(Date.now())}-${String(rows.length)}`,
    startTime: start,
    endTime: end,
    available: true,
    locked: false,
    bookingStatus: null,
  };
}

/**
 * Edit one day's published slots. Saving PUTs the FULL set (it replaces the day). Slots holding a
 * live booking can only be opened/closed — their times can't change and they can't be removed.
 */
export function SlotDayEditorDialog({ date, slots, onOpenChange }: SlotDayEditorDialogProps) {
  const publish = usePublishBookingSlots();
  const [rows, setRows] = useState<SlotDraftRow[]>([]);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  useEffect(() => {
    if (date) {
      setRows(draftFromSlots(slots));
    }
    setConfirmUnpublish(false);
    publish.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-seed only when the edited day changes
  }, [date]);

  const validationError = validateSlotDraft(rows);
  const submitError = publish.isError ? describeWebsiteBookingError(publish.error) : null;
  const hasLive = rows.some((row) => row.locked);

  const update = (key: string, patch: Partial<SlotDraftRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const save = async (unpublish: boolean) => {
    if (!date) return;
    try {
      await publish.mutateAsync({ date, slots: unpublish ? [] : draftToInput(rows) });
      onOpenChange(false);
    } catch {
      // Shown inline.
    }
  };

  return (
    <AlModal
      open={date !== null}
      onOpenChange={(open) => {
        if (!publish.isPending) onOpenChange(open);
      }}
      size="lg"
      title={date ? `Slots for ${date}` : 'Slots'}
      description="Saving replaces the whole day. Customers only see published, open slots."
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="button"
            size="sm"
            data-testid="website-slots-save"
            loading={publish.isPending}
            disabled={publish.isPending || validationError !== null || rows.length === 0}
            onClick={() => {
              void save(false);
            }}
          >
            Publish {rows.length} slot{rows.length === 1 ? '' : 's'}
          </AlButton>
          {slots.length > 0 ? (
            confirmUnpublish ? (
              <AlButton
                type="button"
                size="sm"
                variant="destructive"
                data-testid="website-slots-unpublish-confirm"
                disabled={publish.isPending}
                onClick={() => {
                  void save(true);
                }}
              >
                Confirm unpublish day
              </AlButton>
            ) : (
              <AlButton
                type="button"
                size="sm"
                variant="secondary"
                disabled={publish.isPending || hasLive}
                title={hasLive ? 'A slot on this day holds a live booking.' : undefined}
                onClick={() => {
                  setConfirmUnpublish(true);
                }}
              >
                Unpublish day
              </AlButton>
            )
          ) : null}
          <AlButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={publish.isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
        </div>
      }
    >
      <div className="admin-form-stack">
        {rows.length === 0 ? (
          <p className="admin-empty-note">No slots yet. Add one to publish this day.</p>
        ) : null}
        {rows.map((row) => (
          <div key={row.key} className="admin-form-grid" data-testid="website-slot-row">
            <label className="admin-field">
              Start
              <input
                type="time"
                value={row.startTime}
                disabled={row.locked}
                onChange={(event) => {
                  update(row.key, { startTime: event.target.value });
                }}
              />
            </label>
            <label className="admin-field">
              End
              <input
                type="time"
                value={row.endTime}
                disabled={row.locked}
                onChange={(event) => {
                  update(row.key, { endTime: event.target.value });
                }}
              />
            </label>
            <label className="admin-field">
              <span>
                <input
                  type="checkbox"
                  checked={row.available}
                  onChange={(event) => {
                    update(row.key, { available: event.target.checked });
                  }}
                />{' '}
                Open for booking
              </span>
              <span className="admin-field__hint">
                {row.locked && row.bookingStatus
                  ? `Held by a ${humanizeAdminLabel(row.bookingStatus).toLowerCase()} booking — times locked.`
                  : row.available
                    ? 'Customers can book this slot.'
                    : 'Published but closed to new bookings.'}
              </span>
            </label>
            <div className="admin-page-actions">
              <AlButton
                type="button"
                size="sm"
                variant="secondary"
                disabled={row.locked}
                onClick={() => {
                  setRows((current) => current.filter((r) => r.key !== row.key));
                }}
              >
                Remove
              </AlButton>
            </div>
          </div>
        ))}
        <div className="admin-page-actions">
          <AlButton
            type="button"
            size="sm"
            variant="secondary"
            data-testid="website-slots-add"
            onClick={() => {
              setRows((current) => [...current, nextRow(current)]);
            }}
          >
            Add slot
          </AlButton>
        </div>
        {validationError && rows.length > 0 ? (
          <p className="admin-form-error" role="alert">
            {validationError}
          </p>
        ) : null}
        {submitError ? (
          <p className="admin-form-error" role="alert" data-testid="website-slots-error">
            {submitError}
          </p>
        ) : null}
      </div>
    </AlModal>
  );
}
