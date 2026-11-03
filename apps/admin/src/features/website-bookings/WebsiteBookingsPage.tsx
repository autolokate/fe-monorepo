import type {
  AdminWebsiteBookingAction,
  AdminWebsiteBookingDto,
  AdminWebsiteBookingStatus,
} from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlModal,
  AlPageHeader,
  AlStack,
  AlText,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import { SlotDayEditorDialog } from '@/features/website-bookings/SlotDayEditorDialog';
import {
  bookingActionsFor,
  dateRange,
  isLiveBooking,
  toYmd,
} from '@/features/website-bookings/slot-draft';
import {
  describeWebsiteBookingError,
  useBookingSlots,
  useTransitionWebsiteBooking,
  useWebsiteBookingsList,
} from '@/hooks/website-bookings/useWebsiteBookings';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import {
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

const WEEK_DAYS = 7;

type StatusFilter = AdminWebsiteBookingStatus | 'ALL';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const ACTION_LABELS: Record<AdminWebsiteBookingAction, string> = {
  confirm: 'Confirm',
  complete: 'Mark completed',
  cancel: 'Cancel booking',
};

function statusTone(status: AdminWebsiteBookingStatus) {
  if (status === 'CONFIRMED') return 'active' as const;
  if (status === 'PENDING') return 'draft' as const;
  return 'none' as const;
}

function shiftYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return toYmd(new Date(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + days));
}

/** Publish slots one day at a time over a 7-day window. */
function SlotsPanel({ canWrite }: { canWrite: boolean }) {
  const [from, setFrom] = useState(() => toYmd(new Date()));
  const [editDate, setEditDate] = useState<string | null>(null);
  const { slots, isLoading, isFetching, notDeployed, userErrorMessage, refresh } = useBookingSlots(
    from,
    WEEK_DAYS,
  );
  const days = useMemo(() => dateRange(from, WEEK_DAYS), [from]);
  const byDay = useMemo(() => {
    const map = new Map<string, typeof slots>();
    for (const slot of slots) {
      map.set(slot.slotDate, [...(map.get(slot.slotDate) ?? []), slot]);
    }
    return map;
  }, [slots]);

  if (notDeployed) {
    return (
      <AdminNotDeployedState title="Session slots" endpoint="GET /admin/v1/website/booking-slots" />
    );
  }

  return (
    <AdminPanel
      title="Session slots"
      subtitle="Customers can only book published, open slots. Edit a day to publish or change it."
    >
      <div className="admin-page-actions">
        <AlButton
          size="sm"
          variant="secondary"
          onClick={() => {
            setFrom(shiftYmd(from, -WEEK_DAYS));
          }}
        >
          Previous week
        </AlButton>
        <label className="admin-field">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => {
              if (event.target.value) setFrom(event.target.value);
            }}
          />
        </label>
        <AlButton
          size="sm"
          variant="secondary"
          onClick={() => {
            setFrom(shiftYmd(from, WEEK_DAYS));
          }}
        >
          Next week
        </AlButton>
        <AlButton size="sm" variant="secondary" loading={isFetching} onClick={refresh}>
          Refresh
        </AlButton>
      </div>

      {userErrorMessage ? <AlErrorState message={userErrorMessage} onRetry={refresh} /> : null}
      {isLoading ? <AlText tone="muted">Loading slots…</AlText> : null}

      {!isLoading && !userErrorMessage ? (
        <AlStack gap="sm">
          {days.map((day) => {
            const daySlots = byDay.get(day) ?? [];
            const open = daySlots.filter((s) => s.available && !isLiveBooking(s.bookingStatus));
            const held = daySlots.filter((s) => isLiveBooking(s.bookingStatus));
            return (
              <div key={day} className="admin-detail-card" data-testid={`website-slots-day-${day}`}>
                <span className="admin-detail-card__label">
                  {new Date(`${day}T00:00:00`).toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="admin-detail-card__value">
                  {daySlots.length === 0
                    ? 'Not published'
                    : `${String(daySlots.length)} slots · ${String(open.length)} open · ${String(held.length)} booked`}
                </span>
                {daySlots.length > 0 ? (
                  <AlText variant="caption" tone="muted">
                    {daySlots
                      .map(
                        (s) =>
                          `${s.startTime}–${s.endTime}${
                            s.bookingStatus && isLiveBooking(s.bookingStatus)
                              ? ` (${humanizeAdminLabel(s.bookingStatus)})`
                              : s.available
                                ? ''
                                : ' (closed)'
                          }`,
                      )
                      .join(', ')}
                  </AlText>
                ) : null}
                {canWrite ? (
                  <div className="admin-page-actions">
                    <AlButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditDate(day);
                      }}
                    >
                      {daySlots.length === 0 ? 'Publish slots' : 'Edit day'}
                    </AlButton>
                  </div>
                ) : null}
              </div>
            );
          })}
        </AlStack>
      ) : null}

      <SlotDayEditorDialog
        date={editDate}
        slots={editDate ? (byDay.get(editDate) ?? []) : []}
        onOpenChange={(open) => {
          if (!open) setEditDate(null);
        }}
      />
    </AdminPanel>
  );
}

type PendingAction = { booking: AdminWebsiteBookingDto; action: AdminWebsiteBookingAction };

function BookingActionDialog({
  pending,
  onClose,
}: {
  pending: PendingAction | null;
  onClose: () => void;
}) {
  const transition = useTransitionWebsiteBooking();
  const [reason, setReason] = useState('');
  const submitError = transition.isError ? describeWebsiteBookingError(transition.error) : null;

  const close = () => {
    setReason('');
    transition.reset();
    onClose();
  };

  return (
    <AlModal
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open && !transition.isPending) close();
      }}
      size="sm"
      title={pending ? `${ACTION_LABELS[pending.action]}?` : 'Update booking'}
      description={
        pending
          ? `${pending.booking.slotDate} ${pending.booking.startTime}–${pending.booking.endTime}, currently ${humanizeAdminLabel(pending.booking.status).toLowerCase()}.${
              pending.action === 'cancel'
                ? ' Cancelling frees the slot. No payment is involved.'
                : ''
            }`
          : undefined
      }
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="button"
            size="sm"
            variant={pending?.action === 'cancel' ? 'destructive' : 'primary'}
            data-testid="website-booking-action-confirm"
            loading={transition.isPending}
            disabled={transition.isPending}
            onClick={() => {
              if (!pending) return;
              const trimmed = reason.trim();
              transition.mutate(
                {
                  bookingId: pending.booking.bookingId,
                  action: pending.action,
                  ...(pending.action === 'cancel' && trimmed ? { reason: trimmed } : {}),
                },
                { onSuccess: close },
              );
            }}
          >
            {pending ? ACTION_LABELS[pending.action] : 'Confirm'}
          </AlButton>
          <AlButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={transition.isPending}
            onClick={close}
          >
            Back
          </AlButton>
        </div>
      }
    >
      <div className="admin-form-stack">
        {pending?.action === 'cancel' ? (
          <label className="admin-field admin-form-span" htmlFor="website-booking-cancel-reason">
            Reason (optional, audited)
            <textarea
              id="website-booking-cancel-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
              }}
            />
          </label>
        ) : null}
        {submitError ? (
          <p className="admin-form-error" role="alert">
            {submitError}
          </p>
        ) : null}
      </div>
    </AlModal>
  );
}

function BookingsPanel({ canWrite }: { canWrite: boolean }) {
  const [statusFilter, setStatusFilter] = useUrlFilterState<StatusFilter>('status', 'PENDING');
  const [dateFilter, setDateFilter] = useState('');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const list = useWebsiteBookingsList(
    statusFilter === 'ALL' ? undefined : statusFilter,
    dateFilter || undefined,
  );

  const columns = useMemo<ColumnDef<AdminWebsiteBookingDto>[]>(
    () => [
      {
        accessorKey: 'slotDate',
        header: 'Slot',
        cell: ({ row }) =>
          `${row.original.slotDate} ${row.original.startTime}–${row.original.endTime}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <AdminStatusChip
            label={humanizeAdminLabel(row.original.status)}
            tone={statusTone(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'bookingType',
        header: 'Type',
        cell: ({ row }) => humanizeAdminLabel(row.original.bookingType),
      },
      {
        accessorKey: 'accountId',
        header: 'Account',
        cell: ({ row }) => shortAdminId(row.original.accountId),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatAdminDateTime(row.original.updatedAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          canWrite ? (
            <div className="admin-page-actions">
              {bookingActionsFor(row.original.status).map((action) => (
                <AlButton
                  key={action}
                  size="sm"
                  variant={action === 'cancel' ? 'secondary' : 'primary'}
                  data-testid={`website-booking-${action}-${row.original.bookingId}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPending({ booking: row.original, action });
                  }}
                >
                  {ACTION_LABELS[action]}
                </AlButton>
              ))}
            </div>
          ) : null,
      },
    ],
    [canWrite],
  );

  if (list.notDeployed) {
    return (
      <AdminNotDeployedState title="Session bookings" endpoint="GET /admin/v1/website/bookings" />
    );
  }

  return (
    <AdminPanel title="Session bookings" subtitle="Requests from the website. No payment is taken.">
      <AdminDataBlock
        filters={
          <>
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Booking status"
              />
            </AdminFilterField>
            <AdminFilterField label="Date">
              <input
                type="date"
                value={dateFilter}
                aria-label="Booking date"
                onChange={(event) => {
                  setDateFilter(event.target.value);
                }}
              />
            </AdminFilterField>
          </>
        }
      >
        <AlDataTable
          {...ADMIN_LIST_TABLE_PROPS}
          tableId="website-bookings"
          columns={columns}
          data={list.bookings}
          loading={list.isLoading}
          isRefreshing={list.isFetching && !list.isFetchingNextPage}
          error={list.userErrorMessage}
          onRetry={list.refresh}
          emptyTitle="No bookings"
          emptyDescription="No bookings match these filters."
          getRowId={(row) => row.bookingId}
        />
        {list.hasMore ? (
          <div className="admin-page-actions">
            <AlButton
              size="sm"
              variant="secondary"
              loading={list.isFetchingNextPage}
              disabled={list.isFetchingNextPage}
              onClick={list.loadMore}
            >
              Load more
            </AlButton>
          </div>
        ) : null}
      </AdminDataBlock>
      <BookingActionDialog
        pending={pending}
        onClose={() => {
          setPending(null);
        }}
      />
    </AdminPanel>
  );
}

/** Website "book a session" ops: publish per-day slots and move bookings along their lifecycle. */
export function WebsiteBookingsPage() {
  const canWrite = useAdminPermission('website-bookings:write');
  return (
    <RequirePermission permission="website-bookings:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Session bookings"
          description="Publish founder-call slots and manage website session bookings."
        />
        <SlotsPanel canWrite={canWrite} />
        <BookingsPanel canWrite={canWrite} />
      </AlStack>
    </RequirePermission>
  );
}
