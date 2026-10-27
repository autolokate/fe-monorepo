import type { OwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, type ColumnDef } from '@autolokate/ui';
import { useMemo, type MouseEvent } from 'react';

export type OwnershipClaimsColumnHandlers = {
  onOpenDetail: (claim: OwnershipClaimDto) => void;
  onApprove: (claim: OwnershipClaimDto) => void;
  onReject: (claim: OwnershipClaimDto) => void;
  onMarkUnderReview: (claim: OwnershipClaimDto) => void;
  busyClaimId: string | null;
};

export function useOwnershipClaimsColumns(
  handlers: OwnershipClaimsColumnHandlers,
): ColumnDef<OwnershipClaimDto>[] {
  const { onOpenDetail, onApprove, onReject, onMarkUnderReview, busyClaimId } = handlers;

  return useMemo(
    () => [
      {
        id: 'id',
        header: 'Claim',
        accessorFn: (row) => row.id,
        cell: ({ row }) => row.original.id.slice(0, 8),
      },
      {
        id: 'vehicleId',
        header: 'Vehicle',
        accessorFn: (row) => row.vehicleId,
        cell: ({ row }) => row.original.vehicleId.slice(0, 8),
      },
      {
        id: 'claimant',
        header: 'Claimant',
        accessorFn: (row) => row.claimantAccountId,
        cell: ({ row }) => row.original.claimantAccountId.slice(0, 8),
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => row.status,
      },
      {
        id: 'reviewedAt',
        header: 'Reviewed',
        accessorFn: (row) => row.reviewedAt ?? '',
        cell: ({ row }) => row.original.reviewedAt?.slice(0, 10) ?? '—',
      },
      {
        id: 'createdAt',
        header: 'Submitted',
        accessorFn: (row) => row.createdAt,
      },
      {
        id: 'actions',
        header: 'Review',
        cell: ({ row }) => {
          const claim = row.original;
          const open = claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';
          const busy = busyClaimId === claim.id;
          const stopRowClick = (event: MouseEvent) => {
            event.stopPropagation();
          };
          return (
            <div className="admin-inline-actions">
              <AlButton
                size="sm"
                variant="secondary"
                data-testid={`ownership-claim-details-${claim.id}`}
                onClick={(event) => {
                  stopRowClick(event);
                  onOpenDetail(claim);
                }}
              >
                Details
              </AlButton>
              {open ? (
                <>
                  <AlButton
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    loading={busy}
                    onClick={(event) => {
                      stopRowClick(event);
                      onMarkUnderReview(claim);
                    }}
                  >
                    Under review
                  </AlButton>
                  <AlButton
                    size="sm"
                    disabled={busy}
                    loading={busy}
                    onClick={(event) => {
                      stopRowClick(event);
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
                    onClick={(event) => {
                      stopRowClick(event);
                      onReject(claim);
                    }}
                  >
                    Reject
                  </AlButton>
                </>
              ) : null}
            </div>
          );
        },
      },
    ],
    [busyClaimId, onApprove, onMarkUnderReview, onOpenDetail, onReject],
  );
}
