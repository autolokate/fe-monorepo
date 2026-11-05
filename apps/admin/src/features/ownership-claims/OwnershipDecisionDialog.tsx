import type { AdminOwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, AlModal } from '@autolokate/ui';
import { useEffect, useId, useState } from 'react';

import {
  decisionRemarksError,
  OWNERSHIP_REMARKS_MAX,
  type OwnershipReviewErrorView,
} from '@/features/ownership-claims/ownership-claim-context';
import { notifyAdminStepUpRequired } from '@/platform/api/admin-api-client';

export type OwnershipDecision = 'APPROVED' | 'REJECTED';

export type OwnershipDecisionDialogProps = {
  claim: AdminOwnershipClaimDto | null;
  decision: OwnershipDecision | null;
  plate: string | null;
  claimantLabel: string;
  currentOwnerLabel: string | null;
  busy: boolean;
  error: OwnershipReviewErrorView | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (claim: AdminOwnershipClaimDto, decision: OwnershipDecision, remarks: string) => void;
};

/**
 * Approve or reject with mandatory remarks (both are recorded on the claim and the audit trail).
 * Never optimistic: the dialog stays open, with the remarks kept, when the server refuses.
 */
export function OwnershipDecisionDialog({
  claim,
  decision,
  plate,
  claimantLabel,
  currentOwnerLabel,
  busy,
  error,
  onOpenChange,
  onConfirm,
}: OwnershipDecisionDialogProps) {
  const open = claim !== null && decision !== null;
  const remarksId = useId();
  const [remarks, setRemarks] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      setRemarks('');
      setTouched(false);
    }
  }, [open]);

  const remarksError = decisionRemarksError(remarks);
  const approving = decision === 'APPROVED';

  return (
    <AlModal
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
      size="md"
      title={approving ? 'Approve and transfer ownership' : 'Reject ownership claim'}
      description={
        approving
          ? `${plate ?? 'This vehicle'} moves to ${claimantLabel} as its RC-verified owner.`
          : `${plate ?? 'This vehicle'} stays with ${currentOwnerLabel ?? 'its current owner'}.`
      }
      footer={
        <div className="admin-modal-actions">
          <AlButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            data-testid="ownership-decision-cancel"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </AlButton>
          <AlButton
            type="button"
            variant={approving ? 'primary' : 'destructive'}
            size="sm"
            loading={busy}
            disabled={busy}
            data-testid="ownership-decision-confirm"
            onClick={() => {
              if (!claim || !decision) return;
              setTouched(true);
              if (remarksError) return;
              onConfirm(claim, decision, remarks.trim());
            }}
          >
            {approving ? 'Approve and transfer' : 'Reject claim'}
          </AlButton>
        </div>
      }
    >
      {approving ? (
        <div className="ownership-decision-summary" data-testid="ownership-decision-summary">
          <dl className="ownership-decision-summary__parties">
            <div>
              <dt>Current owner (loses access)</dt>
              <dd>{currentOwnerLabel ?? 'No owner on record'}</dd>
            </div>
            <div>
              <dt>Claimant (becomes owner)</dt>
              <dd>{claimantLabel}</dd>
            </div>
          </dl>
          <ul className="ownership-decision-summary__effects">
            <li>The current owner is removed — not kept as a driver.</li>
            <li>Active drivers are suspended until the new owner re-approves them.</li>
            <li>Pending driver requests and invites are cancelled.</li>
            <li>Open taxi assignments for the vehicle are ended.</li>
            <li>Other open claims on this vehicle are rejected.</li>
            <li>Plans stay with their own accounts — nothing is refunded or moved.</li>
          </ul>
        </div>
      ) : null}
      <label className="admin-field" htmlFor={remarksId}>
        Remarks
        <textarea
          id={remarksId}
          data-testid="ownership-decision-remarks"
          rows={4}
          maxLength={OWNERSHIP_REMARKS_MAX}
          value={remarks}
          disabled={busy}
          autoComplete="off"
          placeholder={
            approving
              ? 'What you checked: RC name, plate, chassis/engine, registry result.'
              : 'Why the claim is rejected — the claimant sees this.'
          }
          aria-invalid={touched && remarksError ? true : undefined}
          onBlur={() => {
            setTouched(true);
          }}
          onChange={(event) => {
            setRemarks(event.target.value);
          }}
        />
        {touched && remarksError ? (
          <span
            className="admin-form-error"
            role="alert"
            data-testid="ownership-decision-remarks-error"
          >
            {remarksError}
          </span>
        ) : (
          <span className="admin-field__hint">
            Required. Saved on the claim and in the audit trail. Max {String(OWNERSHIP_REMARKS_MAX)}{' '}
            characters.
          </span>
        )}
      </label>
      {error ? (
        <div
          className="admin-form-error ownership-decision-error"
          role="alert"
          data-testid="ownership-decision-error"
        >
          <p>{error.message}</p>
          {error.stepUp ? (
            <AlButton size="sm" variant="primary" onClick={notifyAdminStepUpRequired}>
              Verify again
            </AlButton>
          ) : null}
        </div>
      ) : null}
    </AlModal>
  );
}
