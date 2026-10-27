import type { OwnershipClaimDto } from '@autolokate/api-client';
import {
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { OwnershipClaimDetailSheet } from '@/features/ownership-claims/OwnershipClaimDetailSheet';
import { RejectOwnershipClaimDialog } from '@/features/ownership-claims/RejectOwnershipClaimDialog';
import { useOwnershipClaimsColumns } from '@/features/ownership-claims/ownership-claims-columns';
import { OWNERSHIP_CLAIMS_STATUS_FILTERS } from '@/features/ownership-claims/ownership-claims-filters';
import { useOwnershipClaims } from '@/hooks/ownership-claims/useOwnershipClaims';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './ownership-claims.css';

/**
 * Admin M8 ownership-claim review — distinct from lost-QR ownership-transfers.
 * Approve atomically transfers vehicle ownership on BE (after migrate+deploy).
 */
export function OwnershipClaimsPage() {
  const {
    claims,
    isLoading,
    isFetching,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    reviewMutation,
    refresh,
  } = useOwnershipClaims('ALL');

  const [busyClaimId, setBusyClaimId] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<OwnershipClaimDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveClaim, setApproveClaim] = useState<OwnershipClaimDto | null>(null);
  const [rejectClaim, setRejectClaim] = useState<OwnershipClaimDto | null>(null);

  const openDetail = useCallback((claim: OwnershipClaimDto) => {
    setSelectedClaim(claim);
    setDetailOpen(true);
  }, []);

  const runReview = useCallback(
    async (
      claim: OwnershipClaimDto,
      decision: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW',
      rejectionReason?: string,
    ) => {
      setBusyClaimId(claim.id);
      try {
        const updated = await reviewMutation.mutateAsync({
          claimId: claim.id,
          body:
            decision === 'REJECTED'
              ? { decision, rejectionReason: rejectionReason ?? 'Rejected by Admin review' }
              : { decision },
        });
        setSelectedClaim(updated);
        if (decision === 'APPROVED') {
          setApproveClaim(null);
        }
        if (decision === 'REJECTED') {
          setRejectClaim(null);
        }
      } catch {
        // Toast via mutation onError.
      } finally {
        setBusyClaimId(null);
      }
    },
    [reviewMutation],
  );

  const columns = useOwnershipClaimsColumns({
    busyClaimId,
    onOpenDetail: openDetail,
    onApprove: (claim) => {
      setApproveClaim(claim);
    },
    onReject: (claim) => {
      setRejectClaim(claim);
    },
    onMarkUnderReview: (claim) => {
      void runReview(claim, 'UNDER_REVIEW');
    },
  });

  const pageDescription = useMemo(() => {
    if (isLoading) return 'Customer ownership claims for Admin review (M8).';
    const filterLabel =
      OWNERSHIP_CLAIMS_STATUS_FILTERS.find((option) => option.value === statusFilter)?.label ??
      statusFilter;
    return buildPageSummary([`${claims.length.toLocaleString()} claims`, `filter ${filterLabel}`]);
  }, [isLoading, claims.length, statusFilter]);

  if (userErrorMessage && claims.length === 0) {
    return (
      <RequirePermission permission="inventory:view">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  const busy = busyClaimId !== null && reviewMutation.isPending;

  return (
    <RequirePermission permission="inventory:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Ownership claims"
          description={pageDescription}
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

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
            globalSearchPlaceholder="Search claim…"
            emptyTitle="No ownership claims"
            emptyDescription={
              statusFilter === 'ALL'
                ? 'No claims on the Admin plane yet.'
                : 'Try the All filter or another status.'
            }
            getRowId={(row) => row.id}
            onRowClick={(row) => {
              openDetail(row);
            }}
          />
        </AdminDataBlock>

        <OwnershipClaimDetailSheet
          claim={selectedClaim}
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) setSelectedClaim(null);
          }}
          busy={busy && selectedClaim !== null && busyClaimId === selectedClaim.id}
          onApprove={(claim) => {
            setApproveClaim(claim);
          }}
          onReject={(claim) => {
            setRejectClaim(claim);
          }}
          onMarkUnderReview={(claim) => {
            void runReview(claim, 'UNDER_REVIEW');
          }}
        />

        <AlConfirmationDialog
          open={approveClaim !== null}
          onOpenChange={(open) => {
            if (!open) setApproveClaim(null);
          }}
          title="Approve ownership claim"
          description={
            approveClaim
              ? `Approving claim ${approveClaim.id} atomically transfers vehicle ${approveClaim.vehicleId} ownership to claimant ${approveClaim.claimantAccountId} and sets ownershipVerifiedAt on the vehicle. This cannot be undone from this screen.`
              : 'Approving atomically transfers vehicle ownership to the claimant.'
          }
          confirmLabel="Approve and transfer ownership"
          loading={busy && approveClaim !== null && busyClaimId === approveClaim.id}
          onConfirm={() => {
            if (!approveClaim) return;
            void runReview(approveClaim, 'APPROVED');
          }}
        />

        <RejectOwnershipClaimDialog
          claim={rejectClaim}
          busy={busy && rejectClaim !== null && busyClaimId === rejectClaim.id}
          onOpenChange={(open) => {
            if (!open) setRejectClaim(null);
          }}
          onConfirm={(claim, rejectionReason) => {
            void runReview(claim, 'REJECTED', rejectionReason);
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
