import {
  AlButton,
  AlCheckbox,
  AlErrorState,
  AlModal,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import {
  bookingCancelBlockedReason,
  customerAdvanceOf,
  depositReleaseBlockedReason,
  formatMoneySide,
  partnerDepositOf,
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

function newIdempotencyKey(): string {
  return crypto.randomUUID();
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
    release,
    releaseError,
  } = useTaxiBooking(bookingId);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [refundAdvance, setRefundAdvance] = useState(true);
  const [cancelKey, setCancelKey] = useState(newIdempotencyKey);
  const [releaseKey, setReleaseKey] = useState(newIdempotencyKey);

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
  const releaseBlocked = depositReleaseBlockedReason(booking);
  const advance = customerAdvanceOf(booking);

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

        <AdminDetailSection title="Booking">
          <AdminDetailGrid>
            <AdminDetailField label="Status" value={humanizeAdminLabel(booking.status)} />
            <AdminDetailField label="Booking id" value={booking.id} mono />
            <AdminDetailField label="Request" value={booking.requestId} mono />
            <AdminDetailField label="Partner org" value={booking.orgId} mono />
            <AdminDetailField label="Customer account" value={booking.accountId} mono />
            <AdminDetailField label="Pickup" value={formatAdminDateTime(booking.pickupAt)} />
            <AdminDetailField label="Fare" value={formatRupeeAmount(booking.selectedFareRupees)} />
            <AdminDetailField label="Customer advance" value={formatMoneySide(advance)} />
            <AdminDetailField
              label="Partner deposit"
              value={formatMoneySide(partnerDepositOf(booking))}
            />
            <AdminDetailField label="Policy version" value={booking.policyVersionId ?? '—'} mono />
            <AdminDetailField label="Created" value={formatAdminDateTime(booking.createdAt)} />
            {booking.cancelledAt ? (
              <AdminDetailField
                label="Cancelled"
                value={`${formatAdminDateTime(booking.cancelledAt)}${booking.cancelledBy ? ` by ${humanizeAdminLabel(booking.cancelledBy)}` : ''}`}
              />
            ) : null}
            {booking.depositReleaseDueAt || booking.depositReleasedAt ? (
              <AdminDetailField
                label={booking.depositReleasedAt ? 'Deposit released' : 'Deposit release due'}
                value={formatAdminDateTime(
                  booking.depositReleasedAt ?? booking.depositReleaseDueAt,
                )}
              />
            ) : null}
            {booking.cancelReason ? (
              <AdminDetailField label="Cancel reason" value={booking.cancelReason} />
            ) : null}
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection
          title="Actions"
          description="Money moves only through the server; amounts shown are the server's."
        >
          {canWrite ? (
            <div className="taxi-ops__actions">
              <div className="taxi-ops__action">
                <AlButton
                  variant="secondary"
                  size="sm"
                  data-testid="taxi-booking-cancel"
                  disabled={Boolean(cancelBlocked)}
                  onClick={() => {
                    cancel.reset();
                    setReason('');
                    setRefundAdvance(true);
                    setCancelKey(newIdempotencyKey());
                    setCancelOpen(true);
                  }}
                >
                  Cancel booking
                </AlButton>
                {cancelBlocked ? (
                  <AlText tone="muted" variant="caption">
                    {cancelBlocked}
                  </AlText>
                ) : null}
              </div>
              <div className="taxi-ops__action">
                <AlButton
                  variant="secondary"
                  size="sm"
                  data-testid="taxi-booking-release-deposit"
                  disabled={Boolean(releaseBlocked)}
                  onClick={() => {
                    release.reset();
                    setReleaseKey(newIdempotencyKey());
                    setReleaseOpen(true);
                  }}
                >
                  Release partner deposit
                </AlButton>
                {releaseBlocked ? (
                  <AlText tone="muted" variant="caption">
                    {releaseBlocked}
                  </AlText>
                ) : null}
              </div>
            </div>
          ) : null}
        </AdminDetailSection>

        <AdminDetailSection title="Checkouts" description="Advance and deposit payment attempts.">
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

        <AdminDetailSection title="Refunds">
          {booking.refunds.length === 0 ? (
            <AlText tone="muted">No refunds recorded.</AlText>
          ) : (
            <div className="taxi-ops__table-wrap">
              <table className="taxi-policy__diff" data-testid="taxi-booking-refunds">
                <thead>
                  <tr>
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

        <AlModal
          open={cancelOpen}
          onOpenChange={(next) => {
            if (!cancel.isPending) setCancelOpen(next);
          }}
          title="Cancel this booking?"
          description="The booking moves to a cancelled state. The server computes any refund amount."
          footer={
            <div className="admin-modal-actions">
              <AlButton
                variant="secondary"
                disabled={cancel.isPending}
                onClick={() => {
                  setCancelOpen(false);
                }}
              >
                Keep booking
              </AlButton>
              <AlButton
                data-testid="taxi-booking-cancel-confirm"
                loading={cancel.isPending}
                disabled={reason.trim().length < 3}
                onClick={() => {
                  cancel.mutate(
                    { reason: reason.trim(), refundAdvance, idempotencyKey: cancelKey },
                    {
                      onSuccess: () => {
                        setCancelOpen(false);
                      },
                    },
                  );
                }}
              >
                Cancel booking
              </AlButton>
            </div>
          }
        >
          <AlStack gap="md">
            <label className="admin-field">
              Reason (recorded in the audit log)
              <textarea
                data-testid="taxi-booking-cancel-reason"
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                }}
              />
            </label>
            <AlCheckbox
              label={`Refund the customer advance${
                typeof advance?.amountPaise === 'number'
                  ? ` (${formatPaise(advance.amountPaise)})`
                  : ''
              }`}
              checked={refundAdvance}
              onChange={(event) => {
                setRefundAdvance(event.target.checked);
              }}
            />
            {cancelError ? (
              <AlText tone="muted" role="alert">
                {cancelError}
              </AlText>
            ) : null}
          </AlStack>
        </AlModal>

        <AlModal
          open={releaseOpen}
          onOpenChange={(next) => {
            if (!release.isPending) setReleaseOpen(next);
          }}
          title="Release the partner deposit?"
          description="Returns the held deposit to the partner now instead of waiting for the policy release window."
          footer={
            <div className="admin-modal-actions">
              <AlButton
                variant="secondary"
                disabled={release.isPending}
                onClick={() => {
                  setReleaseOpen(false);
                }}
              >
                Keep holding
              </AlButton>
              <AlButton
                data-testid="taxi-booking-release-confirm"
                loading={release.isPending}
                onClick={() => {
                  release.mutate(releaseKey, {
                    onSuccess: () => {
                      setReleaseOpen(false);
                    },
                  });
                }}
              >
                Release deposit
              </AlButton>
            </div>
          }
        >
          <AlText>Deposit: {formatMoneySide(partnerDepositOf(booking))}</AlText>
          {releaseError ? (
            <AlText tone="muted" role="alert">
              {releaseError}
            </AlText>
          ) : null}
        </AlModal>
      </AlStack>
    </RequirePermission>
  );
}
