import type { OwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, AlModal, AlStack, AlStatusBadge, AlText } from '@autolokate/ui';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { RcMediaPreview } from '@/features/ownership-claims/RcMediaPreview';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';

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
      description={`Status ${claim.status}`}
    >
      <AlStack gap="md" data-testid="ownership-claim-detail-sheet">
        <AdminDetailSection title="Claim">
          <div className="admin-modal-actions">
            <AlStatusBadge
              label={claim.status}
              status={
                claim.status === 'APPROVED'
                  ? 'active'
                  : claim.status === 'REJECTED' || claim.status === 'WITHDRAWN'
                    ? 'inactive'
                    : 'pending'
              }
            />
          </div>
          <AdminDetailGrid>
            <AdminDetailField label="Claim id" value={claim.id} mono />
            <AdminDetailField label="Status" value={claim.status} />
            <AdminDetailField label="Vehicle id" value={claim.vehicleId} mono />
            <AdminDetailField label="Claimant account id" value={claim.claimantAccountId} mono />
            <AdminDetailField
              label="Plan subscription id"
              value={displayOrDash(claim.planSubscriptionId)}
              mono
            />
            <AdminDetailField label="Submitted" value={formatWhen(claim.createdAt)} />
            <AdminDetailField label="Updated" value={formatWhen(claim.updatedAt)} />
          </AdminDetailGrid>
        </AdminDetailSection>

        <AdminDetailSection title="Notes">
          <AlText data-testid="ownership-claim-notes">{displayOrDash(claim.notes)}</AlText>
        </AdminDetailSection>

        <AdminDetailSection
          title="RC proof"
          description="Signed download prefers GET /admin/v1/ownership-claims/{id}/rc-proof (OPERATOR). 403/404 surfaces an honest ACL / endpoint blocker."
        >
          <RcMediaPreview claimId={claim.id} rcMediaAssetId={claim.rcMediaAssetId} />
        </AdminDetailSection>

        <AdminDetailSection title="Review audit">
          <AdminDetailGrid>
            <AdminDetailField
              label="Reviewed by admin id"
              value={displayOrDash(claim.reviewedByAdminId)}
              mono
            />
            <AdminDetailField label="Reviewed at" value={formatWhen(claim.reviewedAt)} />
            <AdminDetailField
              label="Rejection reason"
              value={displayOrDash(claim.rejectionReason)}
            />
          </AdminDetailGrid>
          <AlText variant="caption" tone="muted" data-testid="ownership-claim-audit-hint">
            Claim review also writes <code>OWNERSHIP_CLAIM_APPROVED</code> /{' '}
            <code>OWNERSHIP_CLAIM_REJECTED</code> / <code>OWNERSHIP_CLAIM_UNDER_REVIEW</code> to the
            activity log. Filter those actions on{' '}
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
