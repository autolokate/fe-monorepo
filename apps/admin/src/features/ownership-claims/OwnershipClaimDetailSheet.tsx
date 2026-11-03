import type { OwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, AlModal, AlStack, AlText } from '@autolokate/ui';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import {
  claimAttempts,
  claimStatusTone,
  currentOwnerLabel,
  deriveClaimantRole,
} from '@/features/ownership-claims/ownership-claim-context';
import { RcMediaPreview } from '@/features/ownership-claims/RcMediaPreview';
import { useAllOwnershipClaims } from '@/hooks/ownership-claims/useOwnershipClaims';
import { useAdminVehicleDrivers } from '@/hooks/users/useAdminVehicleDrivers';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

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
  return Number.isNaN(parsed.getTime()) ? value : formatAdminDateTime(value);
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
  const roster = useAdminVehicleDrivers(open && claim ? claim.vehicleId : null);
  const allClaims = useAllOwnershipClaims(open && claim !== null);

  if (!claim) {
    return null;
  }

  const rosterData = roster.state.data;
  const plate = rosterData?.plate ?? null;
  const role = deriveClaimantRole(rosterData, claim.claimantAccountId);
  const otherOwner = currentOwnerLabel(rosterData, claim.claimantAccountId);
  const rosterUnavailable = roster.state.notDeployed || Boolean(roster.state.error);
  const attempts = claimAttempts(allClaims.claims, claim);
  const currentAttempt = attempts.find((row) => row.isCurrent)?.attempt ?? 1;

  const openForReview = claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Ownership claim"
      description={`${plate ? `${plate} · ` : ''}${humanizeAdminLabel(claim.status)} · ${shortAdminId(claim.id)}`}
    >
      <AlStack gap="md" data-testid="ownership-claim-detail-sheet">
        <AdminDetailSection
          title="Vehicle & claimant"
          description="The vehicle whose RC is under review and who submitted it."
        >
          <div className="admin-status-row" data-testid="ownership-claim-status-row">
            <AdminStatusChip
              label={humanizeAdminLabel(claim.status)}
              tone={claimStatusTone(claim.status)}
            />
            {role ? (
              <span data-testid="ownership-claim-role">
                <AdminStatusChip label={role.label} tone={role.tone} />
              </span>
            ) : null}
            {attempts.length > 1 ? (
              <span data-testid="ownership-claim-attempt">
                <AdminStatusChip
                  label={`Attempt ${String(currentAttempt)} of ${String(attempts.length)}`}
                  tone="neutral"
                />
              </span>
            ) : null}
          </div>
          <AdminDetailGrid>
            <AdminDetailField
              label="Registration"
              value={
                plate ??
                (roster.state.isLoading ? 'Loading…' : rosterUnavailable ? 'Unavailable' : '—')
              }
              mono
            />
            <AdminDetailField label="Vehicle" value={shortAdminId(claim.vehicleId)} mono />
            <AdminDetailField label="Claimant" value={shortAdminId(claim.claimantAccountId)} mono />
            <AdminDetailField
              label="Claim role (current)"
              value={
                role?.label ??
                (roster.state.isLoading ? 'Loading…' : rosterUnavailable ? 'Unavailable' : '—')
              }
            />
            {otherOwner ? <AdminDetailField label="Current owner" value={otherOwner} mono /> : null}
            <AdminDetailField label="Claim" value={shortAdminId(claim.id)} mono />
            <AdminDetailField
              label="Coverage"
              value={claim.planSubscriptionId ? shortAdminId(claim.planSubscriptionId) : '—'}
              mono
            />
            <AdminDetailField label="Submitted" value={formatWhen(claim.createdAt)} />
            <AdminDetailField label="Updated" value={formatWhen(claim.updatedAt)} />
          </AdminDetailGrid>
          {role ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-role-hint">
              {role.description}
            </AlText>
          ) : rosterUnavailable ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-role-unavailable">
              Vehicle registration and the claimant&apos;s role could not be loaded from the vehicle
              roster. Review the RC against the vehicle ID.
            </AlText>
          ) : null}
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

        <AdminDetailSection
          title="Submission history"
          description="Every RC this claimant submitted for this vehicle, oldest first."
        >
          {allClaims.errorMessage ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-history-error">
              History unavailable: {allClaims.errorMessage}
            </AlText>
          ) : allClaims.isLoading ? (
            <AlText variant="caption" tone="muted">
              Loading history…
            </AlText>
          ) : attempts.length <= 1 ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-history-first">
              First submission for this vehicle.
            </AlText>
          ) : (
            <ol className="ownership-claim-history" data-testid="ownership-claim-history">
              {attempts.map((row) => (
                <li
                  key={row.claim.id}
                  className={
                    row.isCurrent
                      ? 'ownership-claim-history__item ownership-claim-history__item--current'
                      : 'ownership-claim-history__item'
                  }
                  data-testid={`ownership-claim-history-${row.claim.id}`}
                >
                  <div className="ownership-claim-history__head">
                    <strong>
                      Attempt {row.attempt}
                      {row.isCurrent ? ' · this claim' : ''}
                    </strong>
                    <AdminStatusChip
                      label={humanizeAdminLabel(row.claim.status)}
                      tone={claimStatusTone(row.claim.status)}
                    />
                  </div>
                  <span className="ownership-claim-history__meta">
                    Submitted {formatWhen(row.claim.createdAt)}
                    {row.claim.reviewedAt ? ` · Reviewed ${formatWhen(row.claim.reviewedAt)}` : ''}
                  </span>
                  {row.claim.rejectionReason ? (
                    <span className="ownership-claim-history__reason">
                      Reason: {row.claim.rejectionReason}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
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
