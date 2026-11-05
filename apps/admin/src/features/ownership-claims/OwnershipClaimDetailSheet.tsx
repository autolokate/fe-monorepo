import type {
  AdminOwnershipClaimDto,
  OwnershipTransferSummary,
  AdminVehicleDriversDto,
  OwnershipClaimPrecheckField,
} from '@autolokate/api-client';
import { AlButton, AlModal, AlStack, AlText } from '@autolokate/ui';
import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import type { OwnershipDecision } from '@/features/ownership-claims/OwnershipDecisionDialog';
import {
  approveBlocker,
  claimAttempts,
  claimStatusTone,
  conflictingPlateClaims,
  deriveClaimantRole,
  HISTORY_REASON_LABEL,
  isOpenClaim,
  PRECHECK_COPY,
  PRECHECK_FIELD_COPY,
  transferOutcome,
} from '@/features/ownership-claims/ownership-claim-context';
import { RcMediaPreview } from '@/features/ownership-claims/RcMediaPreview';
import { adminUserAccountPath } from '@/features/vehicles/plate-vehicle-columns';
import {
  useRecentOwnershipClaims,
  useVehicleOwnershipHistory,
  type OwnershipReviewAccess,
} from '@/hooks/ownership-claims/useOwnershipClaims';
import { useAdminVehicleDrivers } from '@/hooks/users/useAdminVehicleDrivers';
import { useVehiclePlateSearch } from '@/hooks/vehicles/useVehiclePlateSearch';
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
  claim: AdminOwnershipClaimDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy: boolean;
  reviewAccess: OwnershipReviewAccess;
  /** True right after this reviewer approved the claim (shows the outcome summary first). */
  justApproved: boolean;
  /** `transferSummary` from this session's approve response, when the API sent one. */
  transferSummary: OwnershipTransferSummary | null;
  /** Set when a decision on this claim was interrupted by step-up; its remarks draft is kept. */
  resumedDecision: OwnershipDecision | null;
  onRequestDecision: (
    claim: AdminOwnershipClaimDto,
    decision: OwnershipDecision,
    context: { plate: string | null; claimantLabel: string; currentOwnerLabel: string | null },
  ) => void;
  onMarkUnderReview: (claim: AdminOwnershipClaimDto) => void;
};

function formatWhen(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatAdminDateTime(value);
}

function displayOrDash(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function AccountLink({
  accountId,
  username,
  testId,
}: {
  accountId: string | null;
  username?: string | null;
  testId?: string;
}) {
  if (!accountId) return <span className="admin-muted">—</span>;
  return (
    <Link
      className="admin-link"
      to={adminUserAccountPath(accountId)}
      title={accountId}
      data-testid={testId}
    >
      {username ? `@${username}` : <span className="admin-mono">{shortAdminId(accountId)}</span>}
    </Link>
  );
}

function CheckChip({ value }: { value: OwnershipClaimPrecheckField | undefined }) {
  if (!value) return <span className="admin-muted">—</span>;
  const copy = PRECHECK_FIELD_COPY[value];
  return <AdminStatusChip label={copy.label} tone={copy.tone} />;
}

function Callout({
  tone,
  testId,
  children,
}: {
  tone: 'warning' | 'danger' | 'info' | 'success';
  testId: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`ownership-callout ownership-callout--${tone}`}
      role="note"
      data-testid={testId}
    >
      {children}
    </div>
  );
}

function ownerRoleLabel(roster: AdminVehicleDriversDto | null): string {
  if (!roster?.owner) return 'No owner';
  return roster.owner.role === 'OWNER' ? 'Owner (plan confirmed)' : 'Provisional owner';
}

export function OwnershipClaimDetailSheet({
  claim,
  open,
  onOpenChange,
  busy,
  reviewAccess,
  justApproved,
  transferSummary,
  resumedDecision,
  onRequestDecision,
  onMarkUnderReview,
}: OwnershipClaimDetailSheetProps) {
  const active = open && claim !== null;
  const roster = useAdminVehicleDrivers(active ? claim.vehicleId : null);
  const history = useVehicleOwnershipHistory(active ? claim.vehicleId : null);
  const recent = useRecentOwnershipClaims(active);
  const plateForSearch = claim?.registration ?? roster.state.data?.plate ?? '';
  const plateRows = useVehiclePlateSearch(active ? plateForSearch : '');
  const [rcViewedFor, setRcViewedFor] = useState<string | null>(null);
  const claimId = claim?.id ?? null;
  const onRcViewed = useCallback(
    (viewed: boolean) => {
      setRcViewedFor(viewed ? claimId : null);
    },
    [claimId],
  );

  if (!claim) {
    return null;
  }

  const rosterData = roster.state.data;
  const plate = claim.registration ?? rosterData?.plate ?? null;
  const role = deriveClaimantRole(rosterData, claim.claimantAccountId);
  const owner = rosterData?.owner ?? null;
  const ownerIsClaimant = owner?.accountId === claim.claimantAccountId;
  const currentOwner = owner && !ownerIsClaimant ? owner : null;
  const rosterUnavailable = roster.state.notDeployed || Boolean(roster.state.error);
  const attempts = claimAttempts(recent.claims, claim);
  const currentAttempt = attempts.find((row) => row.isCurrent)?.attempt ?? 1;
  const otherClaims = conflictingPlateClaims(recent.claims, claim, plate);
  const otherOpenClaims = otherClaims.filter(isOpenClaim);
  const otherRows = plateRows.vehicles.filter((row) => row.vehicleId !== claim.vehicleId);
  const verifiedOwnerOnOtherRow = otherRows.some((row) => row.ownershipVerified);
  const conflict = claim.plateConflict ?? null;
  const details = claim.precheckDetails ?? null;
  const openForReview = isOpenClaim(claim);
  const rcViewed = rcViewedFor === claim.id;
  const blocker = approveBlocker({ claim, rcViewed, verifiedOwnerOnOtherRow });
  const outcome =
    claim.status === 'APPROVED' ? transferOutcome(history.rows, claim.id, transferSummary) : null;
  const claimantLabel = claim.claimantUsername
    ? `@${claim.claimantUsername}`
    : shortAdminId(claim.claimantAccountId);
  const currentOwnerLabel = currentOwner
    ? currentOwner.username
      ? `@${currentOwner.username}`
      : shortAdminId(currentOwner.accountId)
    : null;
  const decisionContext = { plate, claimantLabel, currentOwnerLabel };
  const reviewRemarks = claim.reviewRemarks ?? claim.rejectionReason ?? null;

  return (
    <AlModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Ownership claim"
      description={`${plate ? `${plate} · ` : ''}${humanizeAdminLabel(claim.status)} · ${shortAdminId(claim.id)}`}
    >
      <AlStack gap="md" data-testid="ownership-claim-detail-sheet">
        {resumedDecision && openForReview ? (
          <Callout tone="info" testId="ownership-claim-resume">
            You were asked to verify again before your{' '}
            {resumedDecision === 'APPROVED' ? 'approval' : 'rejection'} was sent. Your remarks were
            kept —{' '}
            {resumedDecision === 'APPROVED'
              ? 'view the RC, then choose Approve…'
              : 'choose Reject…'}{' '}
            to finish.
          </Callout>
        ) : null}
        {justApproved && claim.status === 'APPROVED' ? (
          <TransferOutcomePanel
            outcome={outcome}
            loading={history.isLoading}
            unavailable={history.notDeployed || Boolean(history.errorMessage)}
          />
        ) : null}

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
          {claim.precheck ? (
            <span data-testid="ownership-claim-precheck">
              <AdminStatusChip
                label={`${PRECHECK_COPY[claim.precheck].label} (advisory)`}
                tone={PRECHECK_COPY[claim.precheck].tone}
              />
            </span>
          ) : null}
        </div>

        <AdminDetailSection
          title="Claimant vs current owner"
          description="Who asks for the vehicle and who would lose it."
        >
          <div className="ownership-compare" data-testid="ownership-claim-comparison">
            <table className="ownership-compare__table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="ax-visually-hidden">Field</span>
                  </th>
                  <th scope="col">Claimant</th>
                  <th scope="col">Current owner</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Account</th>
                  <td>
                    <AccountLink
                      accountId={claim.claimantAccountId}
                      username={claim.claimantUsername}
                      testId="ownership-claim-claimant-link"
                    />
                  </td>
                  <td data-testid="ownership-claim-current-owner">
                    {roster.state.isLoading ? (
                      'Loading…'
                    ) : rosterUnavailable ? (
                      'Unavailable'
                    ) : currentOwner ? (
                      <AccountLink
                        accountId={currentOwner.accountId}
                        username={currentOwner.username}
                      />
                    ) : ownerIsClaimant ? (
                      'The claimant'
                    ) : (
                      'No owner'
                    )}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Role on this vehicle</th>
                  <td>{role?.label ?? '—'}</td>
                  <td>{currentOwner ? ownerRoleLabel(rosterData) : '—'}</td>
                </tr>
                <tr>
                  <th scope="row">RC verified</th>
                  <td>
                    {owner !== null && ownerIsClaimant && owner.ownershipVerified ? 'Yes' : 'No'}
                  </td>
                  <td data-testid="ownership-claim-owner-verified">
                    {currentOwner
                      ? currentOwner.ownershipVerified
                        ? `Yes · ${formatWhen(currentOwner.ownershipVerifiedAt)}`
                        : 'No'
                      : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {currentOwner?.ownershipVerified ? (
            <Callout tone="warning" testId="ownership-claim-contested">
              The current owner is already RC-verified. This claim contests them: approve only if
              the claimant&apos;s RC clearly supersedes theirs (for example a newer RC after a
              sale).
            </Callout>
          ) : null}
          {rosterUnavailable ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-role-unavailable">
              The vehicle roster could not be loaded, so the current owner is unknown. Review the RC
              against the vehicle ID {shortAdminId(claim.vehicleId)}.
            </AlText>
          ) : role ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-role-hint">
              {role.description}
            </AlText>
          ) : null}
        </AdminDetailSection>

        <AdminDetailSection
          title="RC details and automated checks"
          description="Values typed from the RC by the claimant, and the registry pre-check per field."
        >
          <div className="ownership-compare" data-testid="ownership-claim-rc-checks">
            <table className="ownership-compare__table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="ax-visually-hidden">Field</span>
                  </th>
                  <th scope="col">On the RC</th>
                  <th scope="col">Automated check</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Registration</th>
                  <td className="admin-mono">
                    {displayOrDash(claim.rcRegistration)}
                    {plate ? <span className="admin-muted"> (vehicle {plate})</span> : null}
                  </td>
                  <td>
                    <CheckChip value={details?.registration} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Name on RC</th>
                  <td className="admin-muted">
                    Compared only, not stored — read it on the RC below
                  </td>
                  <td>
                    <CheckChip value={details?.ownerName} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Claimant&apos;s name vs RC owner(s)</th>
                  <td className="admin-muted">Profile name of the claimant</td>
                  <td data-testid="ownership-claim-check-claimant-name">
                    <CheckChip value={details?.claimantName} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Chassis (last 5)</th>
                  <td className="admin-mono">{displayOrDash(claim.rcChassisLast5)}</td>
                  <td>
                    <CheckChip value={details?.chassis} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">Engine (last 5)</th>
                  <td className="admin-mono">{displayOrDash(claim.rcEngineLast5)}</td>
                  <td>
                    <CheckChip value={details?.engine} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <AlText variant="caption" tone="muted" data-testid="ownership-claim-advisory-note">
            Automated checks are advisory only
            {details?.registry ? ` (source: ${humanizeAdminLabel(details.registry)})` : ''}
            {claim.precheckMismatchCode
              ? ` · first mismatch: ${humanizeAdminLabel(claim.precheckMismatchCode)}`
              : ''}
            . They never approve or reject — decide from the RC itself.
          </AlText>
          <AlText variant="caption" tone="muted" data-testid="ownership-claim-joint-rc-note">
            Joint RC: any person named on the RC may claim, and the name check accepts any listed
            owner. Confirm the claimant is one of the names printed on the RC.
          </AlText>
        </AdminDetailSection>

        <AdminDetailSection
          title="Same plate"
          description="Other vehicle rows and other claimants for this registration."
        >
          {conflict?.verifiedElsewhere || verifiedOwnerOnOtherRow ? (
            <Callout tone="danger" testId="ownership-claim-verified-elsewhere">
              Another vehicle row for this plate already has an RC-verified owner. Approval is
              blocked until the duplicate plate is resolved (see{' '}
              <Link to={`${adminPaths.plateScanning}?tab=collisions`}>plate collisions</Link>).
            </Callout>
          ) : conflict && conflict.otherRows > 0 ? (
            <Callout tone="warning" testId="ownership-claim-duplicate-rows">
              {String(conflict.otherRows)} other vehicle row(s) carry this plate (legacy
              duplicates). None has a verified owner.
            </Callout>
          ) : null}
          {otherRows.length > 0 ? (
            <ul className="ownership-list" data-testid="ownership-claim-plate-rows">
              {otherRows.map((row) => (
                <li key={row.vehicleId} className="ownership-list__item">
                  <span className="admin-mono" title={row.vehicleId}>
                    {row.registration} · {shortAdminId(row.vehicleId)}
                  </span>
                  <span>
                    Owner <AccountLink accountId={row.ownerAccountId} />
                  </span>
                  <AdminStatusChip
                    label={row.ownershipVerified ? 'RC verified' : 'Not verified'}
                    tone={row.ownershipVerified ? 'active' : 'none'}
                  />
                </li>
              ))}
            </ul>
          ) : plateRows.isLoading ? (
            <AlText variant="caption" tone="muted">
              Checking other rows for this plate…
            </AlText>
          ) : plateRows.notDeployed || plateRows.error ? (
            <AlText
              variant="caption"
              tone="muted"
              data-testid="ownership-claim-plate-rows-unavailable"
            >
              Other rows for this plate could not be loaded
              {plateRows.error ? `: ${plateRows.error}` : ''}.
            </AlText>
          ) : (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-plate-rows-none">
              No other vehicle row carries this plate.
            </AlText>
          )}
          {otherClaims.length > 0 ? (
            <ul className="ownership-list" data-testid="ownership-claim-conflicting-claims">
              {otherClaims.map((row) => (
                <li
                  key={row.id}
                  className="ownership-list__item"
                  data-testid={`ownership-claim-conflict-${row.id}`}
                >
                  <span>
                    Claim by{' '}
                    <AccountLink
                      accountId={row.claimantAccountId}
                      username={row.claimantUsername}
                    />
                  </span>
                  <span className="admin-muted">{formatWhen(row.createdAt)}</span>
                  <AdminStatusChip
                    label={humanizeAdminLabel(row.status)}
                    tone={claimStatusTone(row.status)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {otherOpenClaims.length > 0 ? (
            <AlText variant="caption" tone="muted">
              Approving this claim rejects the other open claim(s) on this vehicle.
            </AlText>
          ) : null}
          {recent.truncated ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-window-note">
              Other claims are matched within the 100 most recent claims.
            </AlText>
          ) : null}
        </AdminDetailSection>

        <AdminDetailSection title="Notes" description="Claimant notes submitted with the claim.">
          <AlText data-testid="ownership-claim-notes">{displayOrDash(claim.notes)}</AlText>
        </AdminDetailSection>

        <AdminDetailSection
          title="Registration certificate"
          description="Read the names, plate, chassis and engine on the RC before deciding."
        >
          <RcMediaPreview
            claimId={claim.id}
            rcMediaAssetId={claim.rcMediaAssetId}
            onViewedChange={onRcViewed}
          />
        </AdminDetailSection>

        <AdminDetailSection
          title="Vehicle ownership history"
          description="Every ownership change of this vehicle, newest first."
        >
          <OwnershipHistoryList history={history} />
        </AdminDetailSection>

        <AdminDetailSection
          title="Claimant's submissions"
          description="Every RC this claimant submitted for this vehicle, oldest first."
        >
          {recent.errorMessage ? (
            <AlText variant="caption" tone="muted" data-testid="ownership-claim-history-error">
              Submissions unavailable: {recent.errorMessage}
            </AlText>
          ) : recent.isLoading ? (
            <AlText variant="caption" tone="muted">
              Loading submissions…
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
                      Remarks: {row.claim.rejectionReason}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </AdminDetailSection>

        <AdminDetailSection title="Decision" description="Recorded for this claim.">
          <AdminDetailGrid>
            <AdminDetailField
              label="Reviewed by"
              value={
                claim.reviewedByAdminId ? <AccountLink accountId={claim.reviewedByAdminId} /> : '—'
              }
            />
            <AdminDetailField label="Reviewed at" value={formatWhen(claim.reviewedAt)} />
            <AdminDetailField label="Submitted" value={formatWhen(claim.createdAt)} />
          </AdminDetailGrid>
          <AlText data-testid="ownership-claim-review-remarks">
            Remarks: {displayOrDash(reviewRemarks)}
          </AlText>
          {claim.status === 'APPROVED' && !justApproved ? (
            <TransferOutcomePanel
              outcome={outcome}
              loading={history.isLoading}
              unavailable={history.notDeployed || Boolean(history.errorMessage)}
            />
          ) : null}
          <AlText variant="caption" tone="muted" data-testid="ownership-claim-audit-hint">
            Every decision and RC view is also in the{' '}
            <Link to={adminPaths.auditEvents}>Activity Log</Link>.
          </AlText>
        </AdminDetailSection>

        {openForReview ? (
          <AdminDetailSection title="Decide">
            <ReviewActions
              claim={claim}
              access={reviewAccess}
              busy={busy}
              blockerReason={blocker?.reason ?? null}
              onApprove={() => {
                onRequestDecision(claim, 'APPROVED', decisionContext);
              }}
              onReject={() => {
                onRequestDecision(claim, 'REJECTED', decisionContext);
              }}
              onMarkUnderReview={() => {
                onMarkUnderReview(claim);
              }}
            />
          </AdminDetailSection>
        ) : null}
      </AlStack>
    </AlModal>
  );
}

function ReviewActions({
  claim,
  access,
  busy,
  blockerReason,
  onApprove,
  onReject,
  onMarkUnderReview,
}: {
  claim: AdminOwnershipClaimDto;
  access: OwnershipReviewAccess;
  busy: boolean;
  blockerReason: string | null;
  onApprove: () => void;
  onReject: () => void;
  onMarkUnderReview: () => void;
}) {
  const underReview =
    claim.status === 'SUBMITTED' ? (
      <AlButton
        size="sm"
        variant="secondary"
        disabled={busy}
        loading={busy}
        data-testid="ownership-claim-detail-under-review"
        onClick={onMarkUnderReview}
      >
        Mark under review
      </AlButton>
    ) : null;

  if (access.state === 'loading') {
    return (
      <AlText variant="caption" tone="muted" data-testid="ownership-claim-access-loading">
        Checking whether you can decide ownership claims…
      </AlText>
    );
  }

  if (access.state === 'denied') {
    return (
      <AlStack gap="sm">
        <Callout tone="info" testId="ownership-claim-not-reviewer">
          <strong>You&apos;re not an authorized ownership reviewer.</strong> Only operators on the
          server&apos;s reviewer list can approve or reject ownership claims. You can still read the
          claim.
          {access.errorMessage ? (
            <span className="ownership-callout__detail"> ({access.errorMessage})</span>
          ) : null}
        </Callout>
      </AlStack>
    );
  }

  return (
    <AlStack gap="sm">
      <div className="admin-modal-actions">
        {underReview}
        <AlButton
          size="sm"
          disabled={busy || blockerReason !== null}
          loading={busy}
          title={blockerReason ?? undefined}
          data-testid="ownership-claim-detail-approve"
          onClick={onApprove}
        >
          Approve…
        </AlButton>
        <AlButton
          size="sm"
          variant="destructive"
          disabled={busy}
          loading={busy}
          data-testid="ownership-claim-detail-reject"
          onClick={onReject}
        >
          Reject…
        </AlButton>
      </div>
      {blockerReason ? (
        <AlText variant="caption" tone="muted" data-testid="ownership-claim-approve-blocker">
          {blockerReason}
        </AlText>
      ) : null}
      <AlText variant="caption" tone="muted">
        Both decisions need remarks and a step-up verified session.
      </AlText>
    </AlStack>
  );
}

function OwnershipHistoryList({
  history,
}: {
  history: ReturnType<typeof useVehicleOwnershipHistory>;
}) {
  if (history.isLoading) {
    return (
      <AlText variant="caption" tone="muted">
        Loading ownership history…
      </AlText>
    );
  }
  if (history.notDeployed || history.errorMessage) {
    return (
      <AlText variant="caption" tone="muted" data-testid="ownership-history-unavailable">
        Ownership history unavailable{history.errorMessage ? `: ${history.errorMessage}` : ''}.
      </AlText>
    );
  }
  if (history.rows.length === 0) {
    return (
      <AlText variant="caption" tone="muted" data-testid="ownership-history-empty">
        No ownership change recorded for this vehicle yet.
      </AlText>
    );
  }
  return (
    <ol className="ownership-claim-history" data-testid="ownership-history">
      {history.rows.map((row) => (
        <li
          key={row.id}
          className="ownership-claim-history__item"
          data-testid={`ownership-history-${row.id}`}
        >
          <div className="ownership-claim-history__head">
            <strong>{HISTORY_REASON_LABEL[row.reason]}</strong>
            <span className="ownership-claim-history__meta">{formatWhen(row.createdAt)}</span>
          </div>
          <span className="ownership-claim-history__meta">
            From <AccountLink accountId={row.fromAccountId} /> to{' '}
            {row.toAccountId ? <AccountLink accountId={row.toAccountId} /> : 'nobody (released)'}
            {' · '}
            {row.decidedByAdminId ? (
              <>
                decided by <AccountLink accountId={row.decidedByAdminId} />
              </>
            ) : (
              'automatic'
            )}
            {' · '}
            {String(row.removedDriverCount)} driver(s) suspended
          </span>
          {row.remarks ? (
            <span className="ownership-claim-history__reason">Remarks: {row.remarks}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** A reported count, or what the contract guarantees when the API sent no count. */
function countText(value: number | null | undefined, loading: boolean, fallback = 'not reported') {
  if (value != null) return String(value);
  return loading ? 'loading…' : fallback;
}

function TransferOutcomePanel({
  outcome,
  loading,
  unavailable,
}: {
  outcome: ReturnType<typeof transferOutcome>;
  loading: boolean;
  unavailable: boolean;
}) {
  return (
    <Callout tone="success" testId="ownership-transfer-outcome">
      <strong>Ownership transferred.</strong>
      <ul className="ownership-callout__list">
        <li data-testid="ownership-outcome-previous-owner">
          Previous owner removed:{' '}
          {outcome?.previousOwnerId ? (
            <AccountLink accountId={outcome.previousOwnerId} />
          ) : outcome?.previousOwnerRemoved === 0 ? (
            'none (the vehicle had no other owner)'
          ) : outcome?.previousOwnerRemoved != null ? (
            'yes'
          ) : outcome ? (
            'none (the vehicle had no other owner)'
          ) : loading ? (
            'loading…'
          ) : (
            'see ownership history'
          )}
        </li>
        <li data-testid="ownership-outcome-drivers">
          Drivers suspended until the new owner re-approves:{' '}
          {countText(outcome?.suspendedDrivers, loading)}
        </li>
        <li data-testid="ownership-outcome-invites">
          Pending driver requests and invites cancelled:{' '}
          {countText(outcome?.invitesCancelled, false, 'yes')}
        </li>
        <li data-testid="ownership-outcome-taxi">
          Open taxi assignments ended (previous owner&apos;s fleet card unlinked):{' '}
          {countText(outcome?.taxiAssignmentsEnded, false, 'yes')}
        </li>
        <li data-testid="ownership-outcome-claims">
          Other open claims auto-rejected:{' '}
          {countText(outcome?.otherClaimsAutoRejected, false, 'yes')}
        </li>
      </ul>
      {unavailable ? (
        <span className="ownership-callout__detail">
          The ownership history could not be loaded.
        </span>
      ) : null}
    </Callout>
  );
}
