import type { OwnershipClaimDto } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { useOwnershipClaimsColumns } from '@/features/ownership-claims/ownership-claims-columns';
import { OWNERSHIP_CLAIMS_STATUS_FILTERS } from '@/features/ownership-claims/ownership-claims-filters';
import { useOwnershipClaims } from '@/hooks/ownership-claims/useOwnershipClaims';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

/**
 * Admin M8 ownership-claim review — distinct from lost-QR ownership-transfers.
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

  const runReview = useCallback(
    async (claim: OwnershipClaimDto, decision: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW') => {
      setBusyClaimId(claim.id);
      try {
        await reviewMutation.mutateAsync({
          claimId: claim.id,
          body:
            decision === 'REJECTED'
              ? { decision, rejectionReason: 'Rejected by Admin review' }
              : { decision },
        });
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
    onApprove: (claim) => void runReview(claim, 'APPROVED'),
    onReject: (claim) => void runReview(claim, 'REJECTED'),
    onMarkUnderReview: (claim) => void runReview(claim, 'UNDER_REVIEW'),
  });

  const pageDescription = useMemo(() => {
    if (isLoading) return 'Customer ownership claims for Admin review (M8).';
    const filterLabel =
      OWNERSHIP_CLAIMS_STATUS_FILTERS.find((option) => option.value === statusFilter)?.label ??
      statusFilter;
    return buildPageSummary([
      `${claims.length.toLocaleString()} claims`,
      `filter ${filterLabel}`,
    ]);
  }, [isLoading, claims.length, statusFilter]);

  if (userErrorMessage && claims.length === 0) {
    return (
      <RequirePermission permission="inventory:view">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

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
          />
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
