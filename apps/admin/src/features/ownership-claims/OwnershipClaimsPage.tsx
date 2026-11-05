import type { AdminOwnershipClaimDto } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { OwnershipClaimDetailSheet } from '@/features/ownership-claims/OwnershipClaimDetailSheet';
import {
  OwnershipDecisionDialog,
  type OwnershipDecision,
} from '@/features/ownership-claims/OwnershipDecisionDialog';
import {
  claimAttempts,
  ownershipReviewErrorView,
  type OwnershipReviewErrorView,
} from '@/features/ownership-claims/ownership-claim-context';
import { useOwnershipClaimsColumns } from '@/features/ownership-claims/ownership-claims-columns';
import { OWNERSHIP_CLAIMS_STATUS_FILTERS } from '@/features/ownership-claims/ownership-claims-filters';
import {
  useOwnershipClaims,
  useOwnershipReviewAccess,
} from '@/hooks/ownership-claims/useOwnershipClaims';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { showSuccessToast } from '@/platform/feedback/toast';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './ownership-claims.css';

function statusCountsFromLoaded(claims: AdminOwnershipClaimDto[]) {
  const counts = new Map<string, number>();
  for (const claim of claims) {
    counts.set(claim.status, (counts.get(claim.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, count]) => ({
      label: `${humanizeAdminLabel(status)} (loaded)`,
      value: String(count),
    }));
}

type PendingDecision = {
  claim: AdminOwnershipClaimDto;
  decision: OwnershipDecision;
  plate: string | null;
  claimantLabel: string;
  currentOwnerLabel: string | null;
};

/**
 * Ownership-claim review. Ownership moves ONLY here (the lost-QR transfer is retired, D-8).
 * Decisions are made from the claim detail after viewing the RC; only operators the server lists
 * as ownership reviewers see Approve / Reject (D-13), and both need remarks.
 */
export function OwnershipClaimsPage() {
  const {
    claims,
    isLoading,
    isFetching,
    hasMore,
    isFetchingNextPage,
    loadMore,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    reviewMutation,
    refresh,
  } = useOwnershipClaims('ALL');
  const reviewAccess = useOwnershipReviewAccess();

  const [selectedClaim, setSelectedClaim] = useState<AdminOwnershipClaimDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [justApprovedId, setJustApprovedId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [decisionError, setDecisionError] = useState<OwnershipReviewErrorView | null>(null);

  const openDetail = useCallback((claim: AdminOwnershipClaimDto) => {
    setSelectedClaim(claim);
    setJustApprovedId(null);
    setDetailOpen(true);
  }, []);

  const markUnderReview = useCallback(
    (claim: AdminOwnershipClaimDto) => {
      reviewMutation.mutate(
        { claimId: claim.id, body: { decision: 'UNDER_REVIEW' } },
        {
          onSuccess: (updated) => {
            setSelectedClaim((current) =>
              current?.id === updated.id ? { ...current, ...updated } : current,
            );
            showSuccessToast('Claim marked under review.');
          },
          onError: (error) => {
            reportAdminApiError(error, { context: 'ownership-claims-review', toast: true });
          },
        },
      );
    },
    [reviewMutation],
  );

  const confirmDecision = useCallback(
    (claim: AdminOwnershipClaimDto, decision: OwnershipDecision, remarks: string) => {
      setDecisionError(null);
      reviewMutation.mutate(
        { claimId: claim.id, body: { decision, remarks } },
        {
          onSuccess: (updated) => {
            setSelectedClaim((current) =>
              current?.id === updated.id
                ? { ...current, ...updated, reviewRemarks: remarks }
                : current,
            );
            setPending(null);
            if (decision === 'APPROVED') {
              setJustApprovedId(updated.id);
              showSuccessToast('Ownership transferred to the claimant.');
            } else {
              showSuccessToast('Claim rejected. Ownership is unchanged.');
            }
          },
          onError: (error) => {
            const view = ownershipReviewErrorView(error);
            setDecisionError(view);
            if (view.stale) refresh();
          },
        },
      );
    },
    [refresh, reviewMutation],
  );

  const attemptByClaimId = useMemo(() => {
    const map = new Map<string, number>();
    for (const claim of claims) {
      const attempt = claimAttempts(claims, claim).find((row) => row.isCurrent)?.attempt ?? 1;
      map.set(claim.id, attempt);
    }
    return map;
  }, [claims]);

  const columns = useOwnershipClaimsColumns({ attemptByClaimId, onOpenDetail: openDetail });

  const kpiItems = useMemo(
    () => (claims.length > 0 ? statusCountsFromLoaded(claims) : []),
    [claims],
  );

  if (userErrorMessage && claims.length === 0) {
    return (
      <RequirePermission permission="ownership:review">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  const busy = reviewMutation.isPending;

  return (
    <RequirePermission permission="ownership:review">
      <AlStack gap="md">
        <AlPageHeader
          title="Ownership claims"
          description="Approving moves the vehicle to the claimant as its RC-verified owner and removes the previous owner. Open a claim, read the RC, then decide."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        {reviewAccess.state === 'denied' ? (
          <div
            className="ownership-callout ownership-callout--info"
            role="note"
            data-testid="ownership-claims-not-reviewer"
          >
            <strong>You&apos;re not an authorized ownership reviewer.</strong> You can read claims
            and mark them under review; only operators on the server&apos;s reviewer list can
            approve or reject.
          </div>
        ) : null}

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={OWNERSHIP_CLAIMS_STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Ownership claim status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="ownership-claims"
            columns={columns}
            data={claims}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && claims.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search plate, claimant or claim…"
            emptyTitle="No ownership claims"
            emptyDescription={
              statusFilter === 'ALL' ? 'No claims yet.' : 'Try the All filter or another status.'
            }
            getRowId={(row) => row.id}
            onRowClick={(row) => {
              openDetail(row);
            }}
          />
          <AdminLoadMore
            hasMore={hasMore}
            loading={isFetchingNextPage}
            onLoadMore={loadMore}
            testId="ownership-claims-load-more"
          />
        </AdminDataBlock>

        <OwnershipClaimDetailSheet
          claim={selectedClaim}
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) {
              setSelectedClaim(null);
              setJustApprovedId(null);
            }
          }}
          busy={busy}
          reviewAccess={reviewAccess}
          justApproved={selectedClaim !== null && justApprovedId === selectedClaim.id}
          onRequestDecision={(claim, decision, context) => {
            reviewMutation.reset();
            setDecisionError(null);
            setPending({ claim, decision, ...context });
          }}
          onMarkUnderReview={markUnderReview}
        />

        <OwnershipDecisionDialog
          claim={pending?.claim ?? null}
          decision={pending?.decision ?? null}
          plate={pending?.plate ?? null}
          claimantLabel={pending?.claimantLabel ?? ''}
          currentOwnerLabel={pending?.currentOwnerLabel ?? null}
          busy={busy}
          error={decisionError}
          onOpenChange={(open) => {
            if (!open) {
              setPending(null);
              setDecisionError(null);
            }
          }}
          onConfirm={confirmDecision}
        />
      </AlStack>
    </RequirePermission>
  );
}
