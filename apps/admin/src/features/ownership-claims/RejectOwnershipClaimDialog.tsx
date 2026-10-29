import type { OwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useState } from 'react';

import { shortAdminId } from '@/platform/components/AdminWowSurface';

export type RejectOwnershipClaimDialogProps = {
  claim: OwnershipClaimDto | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (claim: OwnershipClaimDto, rejectionReason: string) => void;
};

/** Editable rejection reason — never hardcodes the only allowed text. */
export function RejectOwnershipClaimDialog({
  claim,
  busy,
  onOpenChange,
  onConfirm,
}: RejectOwnershipClaimDialogProps) {
  const open = claim !== null;
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
    }
  }, [open]);

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Reject ownership claim"
      description={
        claim
          ? `Reject claim ${shortAdminId(claim.id)}. Ownership stays with the current owner.`
          : 'Reject this ownership claim.'
      }
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="button"
            variant="destructive"
            size="sm"
            data-testid="ownership-claim-reject-confirm"
            loading={busy}
            disabled={busy}
            onClick={() => {
              if (!claim) return;
              const trimmed = reason.trim();
              if (!trimmed) {
                setError('Enter a rejection reason.');
                return;
              }
              if (trimmed.length > 2000) {
                setError('Reason must be at most 2000 characters.');
                return;
              }
              setError(null);
              onConfirm(claim, trimmed);
            }}
          >
            Reject claim
          </AlButton>
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
        </div>
      }
    >
      <div className={error ? 'admin-field al-field--error' : 'admin-field'}>
        <label
          className="admin-field__label al-field__label"
          htmlFor="ownership-claim-reject-reason"
        >
          Rejection reason
        </label>
        <div className="al-field__control">
          <textarea
            id="ownership-claim-reject-reason"
            className="al-field__input"
            data-testid="ownership-claim-reject-reason"
            rows={4}
            maxLength={2000}
            value={reason}
            disabled={busy}
            autoComplete="off"
            onChange={(event) => {
              setReason(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Explain why this claim is rejected."
            aria-invalid={error ? true : undefined}
          />
        </div>
        {error ? (
          <span className="al-field__error" role="alert" data-testid="ownership-claim-reject-error">
            {error}
          </span>
        ) : (
          <span className="admin-field__hint">Required. Max 2000 characters.</span>
        )}
      </div>
    </AlModal>
  );
}
