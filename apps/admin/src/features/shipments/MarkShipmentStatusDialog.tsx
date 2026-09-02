import type {
  AdminShipmentStatus,
  AdminShipmentSummary,
  ManualShipmentStatus,
} from '@autolokate/api-client';
import { AlButton, AlModal, AlSelect } from '@autolokate/ui';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { useUpdateShipmentStatus } from '@/hooks/shipments/useUpdateShipmentStatus';

/** The fulfilment FSM rank — mirrors the backend guard: a manual mark must go strictly forward. */
const FSM_RANK: Record<AdminShipmentStatus, number> = {
  PAID: 0,
  ALLOCATED: 1,
  SHIPPED: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  RETURNED: 4,
  CANCELLED: 4,
  LOST: 4,
};

const MANUAL_STATUSES: readonly ManualShipmentStatus[] = [
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
  'RETURNED',
  'CANCELLED',
  'LOST',
];

/** The milestones an admin may still mark from `current` — empty on a terminal shipment. */
export function forwardStatuses(current: AdminShipmentStatus): ManualShipmentStatus[] {
  return MANUAL_STATUSES.filter((status) => FSM_RANK[status] > FSM_RANK[current]);
}

export type MarkShipmentStatusDialogProps = {
  /** The shipment to mark; `null` closes the dialog. */
  shipment: AdminShipmentSummary | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Manually advance a shipment one milestone — the ops override for parcels the courier webhook doesn't
 * drive. DELIVERED is the consequential one (it makes the sticker scannable), so the copy says so.
 */
export function MarkShipmentStatusDialog({
  shipment,
  onOpenChange,
}: MarkShipmentStatusDialogProps) {
  const open = shipment !== null;
  const abortRef = useRef<AbortController | null>(null);
  const { updateMutation, mapMutationError } = useUpdateShipmentStatus();

  const options = shipment ? forwardStatuses(shipment.status) : [];
  const [status, setStatus] = useState<ManualShipmentStatus | ''>('');

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      setStatus('');
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog closes
  }, [open]);

  const selected = status || options[0] || '';
  const submitError = updateMutation.isError
    ? mapMutationError(updateMutation.error).userMessage
    : null;

  const onConfirm = async () => {
    if (!shipment || !selected) {
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await updateMutation.mutateAsync({
        orderId: shipment.orderId,
        status: selected,
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
      title="Update delivery status"
      description={
        shipment
          ? `Order ${shipment.orderNumber} is currently ${shipment.status}. Marking a milestone here does what the courier webhook would — DELIVERED makes the sticker scannable for the buyer.`
          : 'Manually advance this shipment.'
      }
      footer={
        <div className="admin-modal-actions">
          <AlButton
            size="sm"
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending || !selected}
            onClick={() => {
              void onConfirm();
            }}
          >
            Mark {selected || 'status'}
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={updateMutation.isPending}
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
        <AlSelect
          label="New status"
          options={options.map((value) => ({ value, label: value }))}
          value={selected}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setStatus(event.target.value as ManualShipmentStatus);
          }}
          helperText="Only forward milestones are offered — a shipment never moves backwards."
        />
        {submitError ? <p className="admin-form-error">{submitError}</p> : null}
      </div>
    </AlModal>
  );
}
