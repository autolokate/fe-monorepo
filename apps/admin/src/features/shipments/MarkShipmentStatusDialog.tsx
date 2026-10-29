import type {
  AdminShipmentStatus,
  AdminShipmentSummary,
  ManualShipmentStatus,
} from '@autolokate/api-client';
import { AlButton, AlModal, AlSelect } from '@autolokate/ui';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { useUpdateShipmentStatus } from '@/hooks/shipments/useUpdateShipmentStatus';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';

/**
 * Shipment reads are paid-only today; status mutation is product-blocked.
 * No forward milestones are offered in the UI.
 */
const MANUAL_STATUSES: readonly ManualShipmentStatus[] = [
  'SHIPPED',
  'IN_TRANSIT',
  'DELIVERED',
  'RETURNED',
  'CANCELLED',
  'LOST',
];

/** Always empty while status mutation is unavailable. */
export function forwardStatuses(_current: AdminShipmentStatus): ManualShipmentStatus[] {
  void _current;
  void MANUAL_STATUSES;
  return [];
}

export type MarkShipmentStatusDialogProps = {
  /** The shipment to mark; `null` closes the dialog. */
  shipment: AdminShipmentSummary | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Manually advance a shipment one milestone when courier updates don't land.
 * Delivered is consequential (sticker becomes scannable) — copy says so when available.
 */
export function MarkShipmentStatusDialog({
  shipment,
  onOpenChange,
}: MarkShipmentStatusDialogProps) {
  const open = shipment !== null;
  const abortRef = useRef<AbortController | null>(null);
  const { updateMutation, mapMutationError } = useUpdateShipmentStatus();

  const options = shipment ? forwardStatuses(shipment.status) : [];
  const blocked = options.length === 0;
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
    if (!shipment || !selected || blocked) {
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
        blocked
          ? 'Delivery status updates are not available yet.'
          : shipment
            ? `Order ${shipment.orderNumber} is currently ${humanizeAdminLabel(shipment.status)}. Marking Delivered makes the sticker scannable for the buyer.`
            : 'Manually advance this shipment.'
      }
      footer={
        <div className="admin-modal-actions">
          {blocked ? null : (
            <AlButton
              size="sm"
              data-testid="shipment-status-submit"
              loading={updateMutation.isPending}
              disabled={updateMutation.isPending || !selected}
              onClick={() => {
                void onConfirm();
              }}
            >
              Mark {selected ? humanizeAdminLabel(selected) : 'status'}
            </AlButton>
          )}
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={updateMutation.isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {blocked ? 'Close' : 'Cancel'}
          </AlButton>
        </div>
      }
    >
      {blocked ? (
        <p className="admin-panel__subtitle" role="status" data-testid="shipment-status-blocked">
          Manual milestones stay off until delivery tracking is enabled. Current status
          {shipment ? ` is ${humanizeAdminLabel(shipment.status)}` : ''} for this order.
        </p>
      ) : (
        <div className="admin-form-stack">
          <AlSelect
            label="New status"
            options={options.map((value) => ({
              value,
              label: humanizeAdminLabel(value),
            }))}
            value={selected}
            data-testid="shipment-status-select"
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              setStatus(event.target.value as ManualShipmentStatus);
            }}
            helperText="Only forward milestones are offered — a shipment never moves backwards."
          />
          {submitError ? <p className="admin-form-error">{submitError}</p> : null}
        </div>
      )}
    </AlModal>
  );
}
