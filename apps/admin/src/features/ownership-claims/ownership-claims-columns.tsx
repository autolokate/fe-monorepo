import type { OwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

export type OwnershipClaimsColumnHandlers = {
  onApprove: (claim: OwnershipClaimDto) => void;
  onReject: (claim: OwnershipClaimDto) => void;
  onMarkUnderReview: (claim: OwnershipClaimDto) => void;
  busyClaimId: string | null;
};

export function useOwnershipClaimsColumns(
  handlers: OwnershipClaimsColumnHandlers,
): ColumnDef<OwnershipClaimDto>[] {
  const { onApprove, onReject, onMarkUnderReview, busyClaimId } = handlers;

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
          if (!open) return null;
          const busy = busyClaimId === claim.id;
          return (
            <div className="admin-inline-actions">
              <AlButton
                size="sm"
                variant="secondary"
                disabled={busy}
                loading={busy}
                onClick={() => {
                  onMarkUnderReview(claim);
                }}
              >
                Under review
              </AlButton>
              <AlButton
                size="sm"
                disabled={busy}
                loading={busy}
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
                onClick={() => {
                  onReject(claim);
                }}
              >
                Reject
              </AlButton>
            </div>
          );
        },
      },
    ],
    [busyClaimId, onApprove, onMarkUnderReview, onReject],
  );
}
