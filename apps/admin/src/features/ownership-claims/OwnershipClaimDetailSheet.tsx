import type { OwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, AlModal, AlStack, AlText } from '@autolokate/ui';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { RcMediaPreview } from '@/features/ownership-claims/RcMediaPreview';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';

export type OwnershipClaimDetailSheetProps = {
  claim: OwnershipClaimDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy: boolean;
  onApprove: (claim: OwnershipClaimDto) => void;
  onReject: (claim: OwnershipClaimDto) => void;
  onMarkUnderReview: (claim: OwnershipClaimDto) => void;
};

function formatWhen(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function displayOrDash(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function claimStatusTone(status: OwnershipClaimDto['status']): AdminStatusChipTone {
  if (status === 'APPROVED') return 'active';
  if (status === 'REJECTED' || status === 'WITHDRAWN') return 'none';
  if (status === 'UNDER_REVIEW') return 'draft';
  return 'neutral';
}

export function OwnershipClaimDetailSheet({
  claim,
  open,
  onOpenChange,
  busy,
  onApprove,
  onReject,
  onMarkUnderReview,
}: OwnershipClaimDetailSheetProps) {
  if (!claim) {
    return null;
  }

  const openForReview = claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Ownership claim"
      description={`${humanizeAdminLabel(claim.status)} · ${shortAdminId(claim.id)}`}
    >
      <AlStack gap="md" data-testid="ownership-claim-detail-sheet">
        <AdminDetailSection title="Claim" description="Who is claiming this vehicle.">
          <div className="admin-status-row">
            <AdminStatusChip
              label={humanizeAdminLabel(claim.status)}
              tone={claimStatusTone(claim.status)}
            />
          </div>
          <AdminDetailGrid>
            <AdminDetailField label="Claim" value={shortAdminId(claim.id)} mono />
            <AdminDetailField label="Vehicle" value={shortAdminId(claim.vehicleId)} mono />
            <AdminDetailField label="Claimant" value={shortAdminId(claim.claimantAccountId)} mono />
            <AdminDetailField
              label="Coverage"
              value={claim.planSubscriptionId ? shortAdminId(claim.planSubscriptionId) : '—'}
              mono
            />
            <AdminDetailField label="Submitted" value={formatWhen(claim.createdAt)} />
            <AdminDetailField label="Updated" value={formatWhen(claim.updatedAt)} />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Notes" description="Claimant notes submitted with the claim.">
          <AlText data-testid="ownership-claim-notes">{displayOrDash(claim.notes)}</AlText>
        </AdminDetailSection>

        <AdminDetailSection
          title="Registration proof"
          description="Registration certificate submitted with this claim."
        >
          <RcMediaPreview claimId={claim.id} rcMediaAssetId={claim.rcMediaAssetId} />
        </AdminDetailSection>

        <AdminDetailSection title="Review" description="Decision recorded for this claim.">
          <AdminDetailGrid>
            <AdminDetailField
              label="Reviewed by"
              value={claim.reviewedByAdminId ? shortAdminId(claim.reviewedByAdminId) : '—'}
              mono
            />
            <AdminDetailField label="Reviewed at" value={formatWhen(claim.reviewedAt)} />
            <AdminDetailField
              label="Rejection reason"
              value={displayOrDash(claim.rejectionReason)}
            />
          </AdminDetailGrid>
          <AlText variant="caption" tone="muted" data-testid="ownership-claim-audit-hint">
            Approve, reject, and under-review decisions also appear in the{' '}
            <Link to={adminPaths.auditEvents}>Activity Log</Link>.
          </AlText>
        </AdminDetailSection>

        {openForReview ? (
          <AdminDetailSection title="Actions">
            <div className="admin-modal-actions">
              {claim.status === 'SUBMITTED' ? (
                <AlButton
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  loading={busy}
                  data-testid="ownership-claim-detail-under-review"
                  onClick={() => {
                    onMarkUnderReview(claim);
                  }}
                >
                  Under review
                </AlButton>
              ) : null}
              <AlButton
                size="sm"
                disabled={busy}
                loading={busy}
                data-testid="ownership-claim-detail-approve"
                onClick={() => {
                  onApprove(claim);
                }}
              >
                Approve
              </AlButton>
              <AlButton
                size="sm"
                variant="secondary"
                disabled={busy}
                loading={busy}
                data-testid="ownership-claim-detail-reject"
                onClick={() => {
                  onReject(claim);
                }}
              >
                Reject
              </AlButton>
            </div>
          </AdminDetailSection>
        ) : null}
      </AlStack>
    </AlModal>
  );
}
