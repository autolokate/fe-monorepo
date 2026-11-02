import { AlButton, AlCheckbox, AlPageHeader, AlStack, AlText } from '@autolokate/ui';
import { useMutation } from '@tanstack/react-query';
import { useState, type ChangeEvent, type ReactNode } from 'react';

import { AdminPanel } from '@/platform/components/AdminWowSurface';
import './experts-admin.css';
import { mapAdminApiError, resolveSubmitErrorMessage } from '@/platform/errors/admin-api-errors';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  confirmExpertBooking,
  publishExpertSlots,
  saveExpert,
  saveExpertSessionType,
} from '@/services/experts-admin-service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLOT_RE = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\s+(\S.*)$/;

function errorText(error: unknown): string {
  const mapped = mapAdminApiError(error);
  if (mapped.status === 404 && /^cannot /i.test(mapped.message)) {
    return 'Not available on this server yet.';
  }
  if (mapped.status === 404) return 'Not found — check the id.';
  if (mapped.status === 409 && mapped.message) return mapped.message;
  return resolveSubmitErrorMessage(error);
}

function Result({ testId, children }: { testId: string; children: ReactNode }) {
  return (
    <pre className="experts-admin__result" data-testid={testId}>
      {children}
    </pre>
  );
}

function Field({
  label,
  children,
  span = false,
}: {
  label: string;
  children: ReactNode;
  span?: boolean;
}) {
  return (
    <label className={`admin-field${span ? ' admin-form-span' : ''}`}>
      {label}
      {children}
    </label>
  );
}

/**
 * ADM-11 — Expert marketplace authorship. The BE exposes write routes only (no admin list/read),
 * so each form shows exactly what the server returned. Ids come from these responses or support.
 */
export function ExpertsAdminPage() {
  const canWrite = useAdminPermission('experts:write');

  const [expert, setExpert] = useState({
    id: '',
    name: '',
    designation: '',
    bio: '',
    expertise: '',
    channelUrl: '',
    rating: '',
    sessionsCompleted: '',
    photoAsset: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const isExpertUpdate = expert.id.trim().length > 0;
  const [replaceConfirmed, setReplaceConfirmed] = useState(false);
  const ratingValue = expert.rating.trim() === '' ? undefined : Number(expert.rating);
  const sessionsValue =
    expert.sessionsCompleted.trim() === '' ? undefined : Number(expert.sessionsCompleted);
  const expertNumbersValid =
    (ratingValue === undefined ||
      (Number.isFinite(ratingValue) && ratingValue >= 0 && ratingValue <= 5)) &&
    (sessionsValue === undefined || (Number.isInteger(sessionsValue) && sessionsValue >= 0));
  const expertMutation = useMutation({
    mutationFn: () =>
      saveExpert({
        ...(expert.id.trim() ? { id: expert.id.trim() } : {}),
        name: expert.name.trim(),
        ...(expert.designation.trim() ? { designation: expert.designation.trim() } : {}),
        ...(expert.bio.trim() ? { bio: expert.bio.trim() } : {}),
        expertise: expert.expertise
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        ...(expert.channelUrl.trim() ? { channelUrl: expert.channelUrl.trim() } : {}),
        ...(ratingValue !== undefined ? { rating: ratingValue } : {}),
        ...(sessionsValue !== undefined ? { sessionsCompleted: sessionsValue } : {}),
        ...(expert.photoAsset.trim() ? { photoAsset: expert.photoAsset.trim() } : {}),
        status: expert.status,
      }),
    onSuccess: (saved) => {
      setExpert((current) => ({ ...current, id: saved.id }));
      setReplaceConfirmed(false);
      setSessionExpertId(saved.id);
      setSlotExpertId(saved.id);
    },
  });

  const [sessionExpertId, setSessionExpertId] = useState('');
  const [session, setSession] = useState({
    id: '',
    code: '',
    title: '',
    durationMinutes: '15',
    priceInr: '',
    bookable: false,
  });
  const sessionMutation = useMutation({
    mutationFn: () =>
      saveExpertSessionType(sessionExpertId.trim(), {
        ...(session.id.trim() ? { id: session.id.trim() } : {}),
        code: session.code.trim(),
        title: session.title.trim(),
        durationMinutes: Number.parseInt(session.durationMinutes, 10),
        ...(session.priceInr.trim() ? { priceInr: Number.parseInt(session.priceInr, 10) } : {}),
        bookable: session.bookable,
      }),
  });

  const [slotExpertId, setSlotExpertId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotLines, setSlotLines] = useState('');
  const parsedSlots = slotLines
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => SLOT_RE.exec(line));
  const slotsValid = parsedSlots.length > 0 && parsedSlots.every(Boolean);
  const slotsMutation = useMutation({
    mutationFn: () =>
      publishExpertSlots(slotExpertId.trim(), {
        slotDate,
        slots: parsedSlots.map((match) => ({
          startTime: match?.[1] ?? '',
          endTime: match?.[2] ?? '',
          period: match?.[3] ?? '',
        })),
      }),
  });

  const [bookingId, setBookingId] = useState('');
  const confirmMutation = useMutation({
    mutationFn: () => confirmExpertBooking(bookingId.trim()),
  });

  const disabled = !canWrite;
  const sessionPriceMissing = session.bookable && session.priceInr.trim() === '';

  return (
    <RequirePermission permission="experts:write">
      <AlStack gap="md">
        <AlPageHeader
          title="Experts"
          description="Create expert profiles, session types and bookable slots, and confirm paid bookings. The server has no admin list for experts yet — keep the ids returned here."
        />

        <AdminPanel
          title="Expert profile"
          subtitle="PUT /admin/v1/experts — leave id blank to create."
        >
          <div className="admin-form-grid">
            <Field label="Expert id (to update)">
              <input
                value={expert.id}
                disabled={disabled}
                placeholder="Blank = new expert"
                onChange={(e) => {
                  setExpert({ ...expert, id: e.target.value });
                  setReplaceConfirmed(false);
                }}
              />
            </Field>
            <Field label="Name">
              <input
                data-testid="expert-name"
                value={expert.name}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, name: e.target.value });
                }}
              />
            </Field>
            <Field label="Designation">
              <input
                value={expert.designation}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, designation: e.target.value });
                }}
              />
            </Field>
            <Field label="Status">
              <select
                value={expert.status}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, status: e.target.value as 'ACTIVE' | 'INACTIVE' });
                }}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Field>
            <Field label="Expertise (comma separated)" span>
              <input
                value={expert.expertise}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, expertise: e.target.value });
                }}
              />
            </Field>
            <Field label="Bio" span>
              <textarea
                rows={3}
                value={expert.bio}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, bio: e.target.value });
                }}
              />
            </Field>
            <Field label="Channel URL">
              <input
                data-testid="expert-channel-url"
                value={expert.channelUrl}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, channelUrl: e.target.value });
                }}
              />
            </Field>
            <Field label="Photo asset (bundle name)">
              <input
                data-testid="expert-photo-asset"
                value={expert.photoAsset}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, photoAsset: e.target.value });
                }}
              />
            </Field>
            <Field label="Rating (0–5)">
              <input
                data-testid="expert-rating"
                inputMode="decimal"
                value={expert.rating}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, rating: e.target.value });
                }}
              />
            </Field>
            <Field label="Sessions completed">
              <input
                data-testid="expert-sessions-completed"
                inputMode="numeric"
                value={expert.sessionsCompleted}
                disabled={disabled}
                onChange={(e) => {
                  setExpert({ ...expert, sessionsCompleted: e.target.value });
                }}
              />
            </Field>
          </div>
          {isExpertUpdate ? (
            <div className="admin-inline-alert" data-testid="expert-replace-warning">
              <p>
                Saving an existing expert replaces the whole profile. Blank fields are cleared
                (rating becomes empty, sessions completed becomes 0, photo and channel are removed).
                The server has no admin read for experts, so re-enter every field.
              </p>
              <AlCheckbox
                label="I've re-entered every field — replace this profile"
                data-testid="expert-replace-confirm"
                checked={replaceConfirmed}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setReplaceConfirmed(event.target.checked);
                }}
              />
            </div>
          ) : null}
          {!expertNumbersValid ? (
            <AlText tone="muted" role="alert" data-testid="expert-number-error">
              Rating must be 0–5 and sessions completed a whole number.
            </AlText>
          ) : null}
          <AlButton
            size="sm"
            data-testid="expert-save"
            loading={expertMutation.isPending}
            disabled={
              disabled ||
              expert.name.trim().length < 2 ||
              !expertNumbersValid ||
              (isExpertUpdate && !replaceConfirmed)
            }
            onClick={() => {
              expertMutation.mutate();
            }}
          >
            Save expert
          </AlButton>
          {expertMutation.isError ? (
            <AlText tone="muted" role="alert">
              {errorText(expertMutation.error)}
            </AlText>
          ) : null}
          {expertMutation.data ? (
            <Result testId="expert-result">
              Saved {expertMutation.data.name} · id {expertMutation.data.id}
            </Result>
          ) : null}
        </AdminPanel>

        <AdminPanel
          title="Session type"
          subtitle="PUT /admin/v1/experts/{id}/session-types — a bookable session needs a price."
        >
          <div className="admin-form-grid">
            <Field label="Expert id">
              <input
                value={sessionExpertId}
                disabled={disabled}
                onChange={(e) => {
                  setSessionExpertId(e.target.value);
                }}
              />
            </Field>
            <Field label="Session type id (to update)">
              <input
                value={session.id}
                disabled={disabled}
                placeholder="Blank = new"
                onChange={(e) => {
                  setSession({ ...session, id: e.target.value });
                }}
              />
            </Field>
            <Field label="Code">
              <input
                value={session.code}
                disabled={disabled}
                onChange={(e) => {
                  setSession({ ...session, code: e.target.value });
                }}
              />
            </Field>
            <Field label="Title">
              <input
                value={session.title}
                disabled={disabled}
                onChange={(e) => {
                  setSession({ ...session, title: e.target.value });
                }}
              />
            </Field>
            <Field label="Duration (minutes, 1–480)">
              <input
                type="number"
                value={session.durationMinutes}
                disabled={disabled}
                onChange={(e) => {
                  setSession({ ...session, durationMinutes: e.target.value });
                }}
              />
            </Field>
            <Field label="Price (₹)">
              <input
                type="number"
                value={session.priceInr}
                disabled={disabled}
                onChange={(e) => {
                  setSession({ ...session, priceInr: e.target.value });
                }}
              />
            </Field>
          </div>
          <AlCheckbox
            label="Bookable by customers"
            checked={session.bookable}
            disabled={disabled}
            onChange={(e) => {
              setSession({ ...session, bookable: e.target.checked });
            }}
          />
          {sessionPriceMissing ? (
            <AlText tone="muted" variant="caption">
              Set a price before making a session bookable.
            </AlText>
          ) : null}
          <AlButton
            size="sm"
            loading={sessionMutation.isPending}
            disabled={
              disabled ||
              !UUID_RE.test(sessionExpertId.trim()) ||
              !session.code.trim() ||
              !session.title.trim() ||
              sessionPriceMissing
            }
            onClick={() => {
              sessionMutation.mutate();
            }}
          >
            Save session type
          </AlButton>
          {sessionMutation.isError ? (
            <AlText tone="muted" role="alert">
              {errorText(sessionMutation.error)}
            </AlText>
          ) : null}
          {sessionMutation.data ? (
            <Result testId="expert-session-result">
              Saved {sessionMutation.data.title} · id {sessionMutation.data.id} ·{' '}
              {sessionMutation.data.bookable ? 'bookable' : 'not bookable'}
            </Result>
          ) : null}
        </AdminPanel>

        <AdminPanel
          title="Publish slots"
          subtitle="POST /admin/v1/experts/{id}/slots — one line per window: 10:00-10:15 Morning"
        >
          <div className="admin-form-grid">
            <Field label="Expert id">
              <input
                value={slotExpertId}
                disabled={disabled}
                onChange={(e) => {
                  setSlotExpertId(e.target.value);
                }}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={slotDate}
                disabled={disabled}
                onChange={(e) => {
                  setSlotDate(e.target.value);
                }}
              />
            </Field>
            <Field label="Windows" span>
              <textarea
                rows={4}
                value={slotLines}
                disabled={disabled}
                placeholder={'10:00-10:15 Morning\n16:00-16:15 Evening'}
                onChange={(e) => {
                  setSlotLines(e.target.value);
                }}
              />
            </Field>
          </div>
          {slotLines.trim() && !slotsValid ? (
            <AlText tone="muted" variant="caption" role="alert">
              Each line must look like “10:00-10:15 Morning”.
            </AlText>
          ) : null}
          <AlButton
            size="sm"
            loading={slotsMutation.isPending}
            disabled={disabled || !UUID_RE.test(slotExpertId.trim()) || !slotDate || !slotsValid}
            onClick={() => {
              slotsMutation.mutate();
            }}
          >
            Publish slots
          </AlButton>
          {slotsMutation.isError ? (
            <AlText tone="muted" role="alert">
              {errorText(slotsMutation.error)}
            </AlText>
          ) : null}
          {slotsMutation.data ? (
            <Result testId="expert-slots-result">
              {slotsMutation.data.length} slot(s) on {slotDate}:{' '}
              {slotsMutation.data.map((slot) => `${slot.startLabel}–${slot.endLabel}`).join(', ')}
            </Result>
          ) : null}
        </AdminPanel>

        <AdminPanel
          title="Confirm booking"
          subtitle="POST /admin/v1/expert-bookings/{id}/confirm — PENDING → CONFIRMED only. The server does not verify payment on confirm yet; check the payment first."
        >
          <div className="admin-form-grid">
            <Field label="Booking id" span>
              <input
                data-testid="expert-booking-id"
                value={bookingId}
                disabled={disabled}
                onChange={(e) => {
                  setBookingId(e.target.value);
                }}
              />
            </Field>
          </div>
          <AlButton
            size="sm"
            data-testid="expert-booking-confirm"
            loading={confirmMutation.isPending}
            disabled={disabled || !UUID_RE.test(bookingId.trim())}
            onClick={() => {
              confirmMutation.mutate();
            }}
          >
            Confirm booking
          </AlButton>
          {confirmMutation.isError ? (
            <AlText tone="muted" role="alert">
              {errorText(confirmMutation.error)}
            </AlText>
          ) : null}
          {confirmMutation.data ? (
            <Result testId="expert-booking-result">
              {confirmMutation.data.status} · {confirmMutation.data.dateKey}{' '}
              {confirmMutation.data.startLabel} · payment {confirmMutation.data.paymentStatus} · ₹
              {confirmMutation.data.amountInr}
            </Result>
          ) : null}
        </AdminPanel>
      </AlStack>
    </RequirePermission>
  );
}
