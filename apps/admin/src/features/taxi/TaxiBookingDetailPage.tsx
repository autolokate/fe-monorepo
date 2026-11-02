import type {
  AdminTaxiBookingDetailDto,
  AdminTaxiDisputeResolution,
  CancelAdminTaxiBookingBody,
} from '@autolokate/api-client';
import {
  AlButton,
  AlErrorState,
  AlModal,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { adminPartnerPath, adminPaths } from '@/app/routes/admin-paths';
import {
  TAXI_REVENUE_KIND_LABELS,
  bookingCancelBlockedReason,
  customerAdvanceOf,
  depositReleaseBlockedReason,
  describeMoneyOutcome,
  describeRefundWindow,
  disputeResolveBlockedReason,
  formatMoneySide,
  holdsMoney,
  partnerDepositOf,
  taxiBookingStatusLabel,
  taxiCancelCodeLabel,
} from '@/features/taxi/taxi-ops-format';
import { useTaxiBooking } from '@/hooks/taxi/useTaxiOperations';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import {
  formatAdminDateTime,
  formatPaise,
  formatRupeeAmount,
  shortAdminId,
} from '@/platform/utils/format-admin-date';

import './taxi-policy.css';

const REASON_MAX = 500;

type Choice<T extends string> = { value: T; label: string; detail: string };

const ADVANCE_CHOICES: Choice<CancelAdminTaxiBookingBody['advanceOutcome']>[] = [
  { value: 'REFUND', label: 'Refund', detail: 'Provider refund of the booking fee in full.' },
  { value: 'FORFEIT', label: 'Forfeit', detail: 'Keep the booking fee as Autolokate revenue.' },
];
const DEPOSIT_CHOICES: Choice<CancelAdminTaxiBookingBody['depositOutcome']>[] = [
  { value: 'RELEASE', label: 'Return', detail: 'Provider refund of the deposit to the partner.' },
  { value: 'FORFEIT', label: 'Forfeit', detail: 'Keep the deposit as Autolokate revenue.' },
];
const RESOLVE_CHOICES: Choice<AdminTaxiDisputeResolution>[] = [
  {
    value: 'PARTNER_FAULT',
    label: 'Partner at fault',
    detail: 'Deposit forfeited; booking fee refunded to the customer.',
  },
  {
    value: 'CUSTOMER_FAULT',
    label: 'Customer at fault',
    detail: 'Booking fee forfeited; deposit returned to the partner.',
  },
  {
    value: 'NO_FAULT',
    label: 'No fault',
    detail:
      'Deposit returned; booking fee earned if the trip completed, otherwise per the refund window at dispute time.',
  },
];

function RadioGroup<T extends string>({
  name,
  legend,
  choices,
  value,
  onChange,
  disabled,
  note,
}: {
  name: string;
  legend: string;
  choices: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
  note?: ReactNode;
}) {
  return (
    <fieldset className="admin-field" data-testid={`${name}-choices`}>
      <legend>{legend}</legend>
      {note ? <span className="admin-field__hint">{note}</span> : null}
      {choices.map((choice) => (
        <label key={choice.value}>
          <input
            type="radio"
            name={name}
            value={choice.value}
            checked={value === choice.value}
            disabled={disabled}
            onChange={() => {
              onChange(choice.value);
            }}
          />{' '}
          <strong>{choice.label}</strong> — {choice.detail}
        </label>
      ))}
    </fieldset>
  );
}

function ReasonField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="admin-field" htmlFor={id}>
      Reason (required, recorded in the audit log)
      <textarea
        id={id}
        data-testid={id}
        rows={3}
        maxLength={REASON_MAX}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </label>
  );
}

function MoneyBlocks({ booking }: { booking: AdminTaxiBookingDetailDto }) {
  const advance = customerAdvanceOf(booking);
  const deposit = partnerDepositOf(booking);
  const policy = booking.policy ?? null;
  return (
    <AdminDetailSection
      title="Money"
      description="Server amounts and deadlines from the policy version bound to this booking."
    >
      <AdminDetailGrid>
        <AdminDetailField label="Booking fee (customer)" value={formatMoneySide(advance)} />
        <AdminDetailField label="Refundable until" value={describeRefundWindow(booking)} />
        <AdminDetailField label="Security deposit (partner)" value={formatMoneySide(deposit)} />
        <AdminDetailField
          label="Deposit due by"
          value={formatAdminDateTime(booking.deposit?.dueAt ?? null)}
        />
        <AdminDetailField
          label="Settles at (if no dispute)"
          value={formatAdminDateTime(
            booking.deposit?.releaseDueAt ?? booking.depositReleaseDueAt ?? null,
          )}
        />
        <AdminDetailField label="Settled" value={formatAdminDateTime(booking.settledAt ?? null)} />
        {booking.depositReleasedAt ? (
          <AdminDetailField
            label="Deposit returned"
            value={formatAdminDateTime(booking.depositReleasedAt)}
          />
        ) : null}
      </AdminDetailGrid>
      {policy ? (
        <AdminDetailGrid>
          <AdminDetailField label="Policy version" value={shortAdminId(policy.id)} mono />
          <AdminDetailField
            label="Fee / deposit"
            value={`${String(policy.customerAdvanceBps)} / ${String(policy.partnerDepositBps)} bps`}
          />
          <AdminDetailField
            label="Refund window"
            value={`${String(policy.customerAdvanceRefundWindowHours)} h`}
          />
          <AdminDetailField
            label="Deposit due"
            value={`${String(policy.partnerDepositDueMinutes)} min`}
          />
          <AdminDetailField
            label="Trip dispute window"
            value={`${String(policy.tripDisputeWindowHours)} h`}
          />
          <AdminDetailField
            label="Settlement window"
            value={
              policy.depositReleaseHoursAfterComplete === null
                ? '—'
                : `${String(policy.depositReleaseHoursAfterComplete)} h`
            }
          />
        </AdminDetailGrid>
      ) : (
        <AlText tone="muted" variant="caption">
          No policy version bound yet.
        </AlText>
      )}
    </AdminDetailSection>
  );
}

export function TaxiBookingDetailPage() {
  const { bookingId = '' } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const canWrite = useAdminPermission('taxi:write');
  const {
    booking,
    isLoading,
    isFetching,
    notDeployed,
    userErrorMessage,
    refresh,
    cancel,
    cancelError,
    resolve,
    resolveError,
    release,
    releaseError,
    lastOutcome,
    clearLastOutcome,
  } = useTaxiBooking(bookingId);

  const [dialog, setDialog] = useState<'cancel' | 'resolve' | 'release' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const [advanceOutcome, setAdvanceOutcome] = useState<
    CancelAdminTaxiBookingBody['advanceOutcome'] | null
  >(null);
  const [depositOutcome, setDepositOutcome] = useState<
    CancelAdminTaxiBookingBody['depositOutcome'] | null
  >(null);
  const [resolution, setResolution] = useState<AdminTaxiDisputeResolution | null>(null);

  const openDialog = (next: 'cancel' | 'resolve' | 'release') => {
    cancel.reset();
    resolve.reset();
    release.reset();
    setReason('');
    setAdvanceOutcome(null);
    setDepositOutcome(null);
    setResolution(null);
    setConfirming(false);
    setDialog(next);
  };
  const pending = cancel.isPending || resolve.isPending || release.isPending;
  const closeDialog = () => {
    if (!pending) setDialog(null);
  };

  const back = (
    <AlPageHeaderAction
      label="All bookings"
      variant="secondary"
      onClick={() => {
        void navigate(adminPaths.taxiBookings);
      }}
    />
  );

  if (notDeployed) {
    return (
      <AlStack gap="md">
        <AlPageHeader title="Taxi booking" actions={back} />
        <AdminNotDeployedState title="Taxi booking" endpoint="GET /admin/v1/taxi/bookings/{id}" />
      </AlStack>
    );
  }
  if (isLoading) {
    return <AdminPageLoader label="Loading booking…" />;
  }
  if (!booking) {
    return <AlErrorState message={userErrorMessage ?? 'Booking not found.'} onRetry={refresh} />;
  }

  const cancelBlocked = bookingCancelBlockedReason(booking.status);
  const resolveBlocked = disputeResolveBlockedReason(booking.status);
  const releaseBlocked = depositReleaseBlockedReason(booking);
  const advance = customerAdvanceOf(booking);
  const deposit = partnerDepositOf(booking);
  const reasonOk = reason.trim().length > 0;
  const cancelReady = reasonOk && advanceOutcome !== null && depositOutcome !== null;
  const resolveReady = reasonOk && resolution !== null;

  const actions: {
    key: 'cancel' | 'resolve' | 'release';
    label: string;
    blocked: string | null;
  }[] = [
    { key: 'cancel', label: 'Cancel booking', blocked: cancelBlocked },
    { key: 'resolve', label: 'Resolve dispute', blocked: resolveBlocked },
    { key: 'release', label: 'Return partner deposit now', blocked: releaseBlocked },
  ];

  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader
          title={`Booking ${shortAdminId(booking.id)}`}
          description={`${booking.pickupLabel ?? '—'} → ${booking.dropoffLabel ?? '—'}`}
          actions={
            <>
              {back}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
            </>
          }
        />

        {lastOutcome ? (
          <AdminDetailSection
            title={`Result of ${lastOutcome.action === 'release' ? 'deposit return' : lastOutcome.action}`}
            description="As returned by the server."
          >
            <div data-testid="taxi-booking-outcome">
              {describeMoneyOutcome(lastOutcome.result.outcome).map((line) => (
                <AlText key={line}>{line}</AlText>
              ))}
              <AlText tone="muted" variant="caption">
                Booking is now {taxiBookingStatusLabel(lastOutcome.result.status).toLowerCase()}.
                Provider refunds settle asynchronously — see Refunds below.
              </AlText>
              <AlButton size="sm" variant="secondary" onClick={clearLastOutcome}>
                Dismiss
              </AlButton>
            </div>
          </AdminDetailSection>
        ) : null}

        {booking.adminFlaggedAt ? (
          <AdminDetailSection title="Flagged for operator action">
            <AlText data-testid="taxi-booking-flag">
              {booking.adminFlagReason === 'NEVER_STARTED'
                ? 'Confirmed but never started, and nobody reported a problem within the dispute window. No money has moved — decide with Cancel booking.'
                : humanizeAdminLabel(booking.adminFlagReason ?? 'Flagged')}{' '}
              (flagged {formatAdminDateTime(booking.adminFlaggedAt)})
            </AlText>
          </AdminDetailSection>
        ) : null}

        <AdminDetailSection title="Booking">
          <AdminDetailGrid>
            <AdminDetailField label="Status" value={taxiBookingStatusLabel(booking.status)} />
            <AdminDetailField label="Booking id" value={booking.id} mono />
            <AdminDetailField label="Request" value={booking.requestId} mono />
            <AdminDetailField
              label="Route"
              value={
                booking.pickupLabel || booking.dropoffLabel
                  ? `${booking.pickupLabel ?? '—'} → ${booking.dropoffLabel ?? '—'}`
                  : '—'
              }
            />
            <AdminDetailField
              label="Partner org"
              value={
                <Link className="admin-link admin-mono" to={adminPartnerPath(booking.orgId)}>
                  {booking.orgId}
                </Link>
              }
            />
            <AdminDetailField label="Fleet vehicle (bid)" value={booking.vehicleId} mono />
            <AdminDetailField
              label="Assigned driver"
              value={booking.driverAccountId ?? 'Owner drives / not assigned'}
              mono={Boolean(booking.driverAccountId)}
            />
            <AdminDetailField label="Customer account" value={booking.accountId} mono />
            <AdminDetailField
              label="Contact shared"
              value={
                booking.contactUnlocked
                  ? 'Yes — both sides see each other’s details'
                  : 'No — unlocks once the deposit is paid'
              }
            />
            <AdminDetailField label="Pickup" value={formatAdminDateTime(booking.pickupAt)} />
            <AdminDetailField label="Fare" value={formatRupeeAmount(booking.selectedFareRupees)} />
            <AdminDetailField label="Started" value={formatAdminDateTime(booking.startedAt)} />
            <AdminDetailField label="Completed" value={formatAdminDateTime(booking.completedAt)} />
            <AdminDetailField label="Created" value={formatAdminDateTime(booking.createdAt)} />
            {booking.cancelledAt ? (
              <AdminDetailField
                label="Cancelled"
                value={`${formatAdminDateTime(booking.cancelledAt)}${booking.cancelledBy ? ` by ${humanizeAdminLabel(booking.cancelledBy)}` : ''}`}
              />
            ) : null}
            {booking.cancelCode ? (
              <AdminDetailField
                label="Cancel code"
                value={taxiCancelCodeLabel(booking.cancelCode)}
              />
            ) : null}
            {booking.cancelReason ? (
              <AdminDetailField label="Cancel reason" value={booking.cancelReason} />
            ) : null}
          </AdminDetailGrid>
        </AdminDetailSection>

        <MoneyBlocks booking={booking} />

        {booking.dispute ? (
          <AdminDetailSection title="Dispute">
            <AdminDetailGrid>
              <AdminDetailField
                label="Kind"
                value={booking.dispute.kind ? humanizeAdminLabel(booking.dispute.kind) : '—'}
              />
              <AdminDetailField label="Customer reason" value={booking.dispute.reason ?? '—'} />
              <AdminDetailField
                label="Opened"
                value={formatAdminDateTime(booking.dispute.openedAt)}
              />
              <AdminDetailField
                label="Status before dispute"
                value={
                  booking.dispute.priorStatus
                    ? taxiBookingStatusLabel(booking.dispute.priorStatus)
                    : '—'
                }
              />
              <AdminDetailField
                label="Resolution"
                value={
                  booking.dispute.resolution
                    ? humanizeAdminLabel(booking.dispute.resolution)
                    : 'Unresolved'
                }
              />
              <AdminDetailField
                label="Resolution reason"
                value={booking.dispute.resolutionReason ?? '—'}
              />
              <AdminDetailField
                label="Resolved"
                value={formatAdminDateTime(booking.dispute.resolvedAt)}
              />
            </AdminDetailGrid>
          </AdminDetailSection>
        ) : null}

        {booking.noShow ? (
          <AdminDetailSection title="Customer no-show report (partner)">
            <AdminDetailGrid>
              <AdminDetailField
                label="Reported"
                value={formatAdminDateTime(booking.noShow.reportedAt)}
              />
              <AdminDetailField
                label="Contact attempts"
                value={
                  booking.noShow.contactAttempts === null
                    ? '—'
                    : String(booking.noShow.contactAttempts)
                }
              />
              <AdminDetailField label="Note" value={booking.noShow.note ?? '—'} />
            </AdminDetailGrid>
          </AdminDetailSection>
        ) : null}

        <AdminDetailSection
          title="Actions"
          description="Money moves only through the server; every action is audited and shows its result."
        >
          {canWrite ? (
            <div className="taxi-ops__actions">
              {actions.map((action) => (
                <div key={action.key} className="taxi-ops__action">
                  <AlButton
                    variant="secondary"
                    size="sm"
                    data-testid={`taxi-booking-${action.key}`}
                    disabled={Boolean(action.blocked)}
                    onClick={() => {
                      openDialog(action.key);
                    }}
                  >
                    {action.label}
                  </AlButton>
                  {action.blocked ? (
                    <AlText tone="muted" variant="caption">
                      {action.blocked}
                    </AlText>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <AlText tone="muted">Read-only for your session.</AlText>
          )}
        </AdminDetailSection>

        <AdminDetailSection
          title="Checkouts"
          description="Booking-fee and deposit payment attempts."
        >
          {booking.checkouts.length === 0 ? (
            <AlText tone="muted">No checkout has been opened for this booking.</AlText>
          ) : (
            <div className="taxi-ops__table-wrap">
              <table className="taxi-policy__diff" data-testid="taxi-booking-checkouts">
                <thead>
                  <tr>
                    <th scope="col">Kind</th>
                    <th scope="col">Status</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Payment ref</th>
                    <th scope="col">Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.checkouts.map((checkout) => (
                    <tr key={checkout.id}>
                      <td>{humanizeAdminLabel(checkout.kind)}</td>
                      <td>{humanizeAdminLabel(checkout.status)}</td>
                      <td>{formatPaise(checkout.amountPaise)}</td>
                      <td className="admin-mono">{checkout.paymentRef}</td>
                      <td>{formatAdminDateTime(checkout.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminDetailSection>

        <AdminDetailSection
          title="Refunds"
          description="Provider refunds (pending ones settle later)."
        >
          {booking.refunds.length === 0 ? (
            <AlText tone="muted">No refunds recorded.</AlText>
          ) : (
            <div className="taxi-ops__table-wrap">
              <table className="taxi-policy__diff" data-testid="taxi-booking-refunds">
                <thead>
                  <tr>
                    <th scope="col">Kind</th>
                    <th scope="col">Status</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Provider ref</th>
                    <th scope="col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.refunds.map((refund) => (
                    <tr key={refund.id}>
                      <td>{humanizeAdminLabel(refund.kind)}</td>
                      <td>{humanizeAdminLabel(refund.status)}</td>
                      <td>{formatPaise(refund.amountPaise)}</td>
                      <td>{humanizeAdminLabel(refund.reason)}</td>
                      <td className="admin-mono">{refund.providerRefundId ?? '—'}</td>
                      <td>{formatAdminDateTime(refund.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminDetailSection>

        <AdminDetailSection
          title="Revenue"
          description="Autolokate revenue recorded for this booking."
        >
          {booking.revenue.length === 0 ? (
            <AlText tone="muted">No revenue recorded.</AlText>
          ) : (
            <div className="taxi-ops__table-wrap">
              <table className="taxi-policy__diff" data-testid="taxi-booking-revenue">
                <thead>
                  <tr>
                    <th scope="col">Kind</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Trigger</th>
                    <th scope="col">Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.revenue.map((row) => (
                    <tr key={row.id}>
                      <td>{TAXI_REVENUE_KIND_LABELS[row.kind] ?? humanizeAdminLabel(row.kind)}</td>
                      <td>{formatPaise(row.amountPaise)}</td>
                      <td>{humanizeAdminLabel(row.trigger)}</td>
                      <td>{formatAdminDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminDetailSection>

        <AlModal
          open={dialog === 'cancel'}
          onOpenChange={(next) => {
            if (!next) closeDialog();
          }}
          title={confirming ? 'Confirm cancellation' : 'Cancel this booking?'}
          description="The booking becomes Cancelled (admin). Choose explicitly what happens to each money side."
          footer={
            <div className="admin-modal-actions">
              <AlButton
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  if (confirming) setConfirming(false);
                  else closeDialog();
                }}
              >
                {confirming ? 'Back' : 'Keep booking'}
              </AlButton>
              {confirming ? (
                <AlButton
                  variant="destructive"
                  data-testid="taxi-booking-cancel-confirm"
                  loading={cancel.isPending}
                  disabled={!cancelReady || cancel.isPending}
                  onClick={() => {
                    if (!advanceOutcome || !depositOutcome) return;
                    cancel.mutate(
                      { reason: reason.trim(), advanceOutcome, depositOutcome },
                      {
                        onSuccess: () => {
                          setDialog(null);
                        },
                      },
                    );
                  }}
                >
                  Cancel booking
                </AlButton>
              ) : (
                <AlButton
                  data-testid="taxi-booking-cancel-review"
                  disabled={!cancelReady}
                  onClick={() => {
                    setConfirming(true);
                  }}
                >
                  Review
                </AlButton>
              )}
            </div>
          }
        >
          {confirming && advanceOutcome && depositOutcome ? (
            <AlStack gap="sm">
              <AlText>
                Booking fee ({formatMoneySide(advance)}):{' '}
                {holdsMoney(advance)
                  ? advanceOutcome === 'REFUND'
                    ? 'refund to the customer'
                    : 'forfeit to Autolokate'
                  : 'nothing held — choice ignored'}
                .
              </AlText>
              <AlText>
                Partner deposit ({formatMoneySide(deposit)}):{' '}
                {holdsMoney(deposit)
                  ? depositOutcome === 'RELEASE'
                    ? 'return to the partner'
                    : 'forfeit to Autolokate'
                  : 'nothing held — choice ignored'}
                .
              </AlText>
              <AlText tone="muted" variant="caption">
                Reason: {reason.trim()}
              </AlText>
              {cancelError ? (
                <p className="admin-form-error" role="alert">
                  {cancelError}
                </p>
              ) : null}
            </AlStack>
          ) : (
            <AlStack gap="md">
              <ReasonField
                id="taxi-booking-cancel-reason"
                value={reason}
                onChange={setReason}
                disabled={pending}
              />
              <RadioGroup
                name="taxi-cancel-advance"
                legend="Customer booking fee"
                note={`Now: ${formatMoneySide(advance)}${holdsMoney(advance) ? '' : ' — nothing held, the choice is ignored.'}`}
                choices={ADVANCE_CHOICES}
                value={advanceOutcome}
                onChange={setAdvanceOutcome}
                disabled={pending}
              />
              <RadioGroup
                name="taxi-cancel-deposit"
                legend="Partner security deposit"
                note={`Now: ${formatMoneySide(deposit)}${holdsMoney(deposit) ? '' : ' — nothing held, the choice is ignored.'}`}
                choices={DEPOSIT_CHOICES}
                value={depositOutcome}
                onChange={setDepositOutcome}
                disabled={pending}
              />
            </AlStack>
          )}
        </AlModal>

        <AlModal
          open={dialog === 'resolve'}
          onOpenChange={(next) => {
            if (!next) closeDialog();
          }}
          title={confirming ? 'Confirm ruling' : 'Resolve dispute'}
          description="Your ruling decides the booking fee and the deposit. It is final and audited."
          footer={
            <div className="admin-modal-actions">
              <AlButton
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  if (confirming) setConfirming(false);
                  else closeDialog();
                }}
              >
                {confirming ? 'Back' : 'Not now'}
              </AlButton>
              {confirming ? (
                <AlButton
                  data-testid="taxi-booking-resolve-confirm"
                  loading={resolve.isPending}
                  disabled={!resolveReady || resolve.isPending}
                  onClick={() => {
                    if (!resolution) return;
                    resolve.mutate(
                      { outcome: resolution, reason: reason.trim() },
                      {
                        onSuccess: () => {
                          setDialog(null);
                        },
                      },
                    );
                  }}
                >
                  Resolve
                </AlButton>
              ) : (
                <AlButton
                  data-testid="taxi-booking-resolve-review"
                  disabled={!resolveReady}
                  onClick={() => {
                    setConfirming(true);
                  }}
                >
                  Review
                </AlButton>
              )}
            </div>
          }
        >
          {confirming && resolution ? (
            <AlStack gap="sm">
              <AlText>
                {RESOLVE_CHOICES.find((c) => c.value === resolution)?.label}:{' '}
                {RESOLVE_CHOICES.find((c) => c.value === resolution)?.detail}
              </AlText>
              <AlText tone="muted" variant="caption">
                Booking fee: {formatMoneySide(advance)} · Deposit: {formatMoneySide(deposit)}
              </AlText>
              <AlText tone="muted" variant="caption">
                Reason: {reason.trim()}
              </AlText>
              {resolveError ? (
                <p className="admin-form-error" role="alert">
                  {resolveError}
                </p>
              ) : null}
            </AlStack>
          ) : (
            <AlStack gap="md">
              {booking.dispute?.reason ? (
                <AlText tone="muted">Customer said: “{booking.dispute.reason}”</AlText>
              ) : null}
              <RadioGroup
                name="taxi-resolve-outcome"
                legend="Ruling"
                choices={RESOLVE_CHOICES}
                value={resolution}
                onChange={setResolution}
                disabled={pending}
              />
              <ReasonField
                id="taxi-booking-resolve-reason"
                value={reason}
                onChange={setReason}
                disabled={pending}
              />
            </AlStack>
          )}
        </AlModal>

        <AlModal
          open={dialog === 'release'}
          onOpenChange={(next) => {
            if (!next) closeDialog();
          }}
          title="Return the partner deposit now?"
          description="Issues a real provider refund of the deposit payment now, instead of waiting for the settlement window. This ends the customer's chance to dispute affecting the deposit."
          footer={
            <div className="admin-modal-actions">
              <AlButton variant="secondary" disabled={pending} onClick={closeDialog}>
                Keep holding
              </AlButton>
              <AlButton
                data-testid="taxi-booking-release-confirm"
                loading={release.isPending}
                disabled={release.isPending}
                onClick={() => {
                  release.mutate(undefined, {
                    onSuccess: () => {
                      setDialog(null);
                    },
                  });
                }}
              >
                Return deposit
              </AlButton>
            </div>
          }
        >
          <AlText>Deposit: {formatMoneySide(deposit)}</AlText>
          {releaseError ? (
            <p className="admin-form-error" role="alert">
              {releaseError}
            </p>
          ) : null}
        </AlModal>
      </AlStack>
    </RequirePermission>
  );
}
