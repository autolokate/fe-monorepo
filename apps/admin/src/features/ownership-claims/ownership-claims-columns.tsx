import type { OwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo, type MouseEvent } from 'react';

import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';

function claimStatusTone(status: OwnershipClaimDto['status']): AdminStatusChipTone {
  if (status === 'APPROVED') return 'active';
  if (status === 'REJECTED' || status === 'WITHDRAWN') return 'none';
  if (status === 'UNDER_REVIEW') return 'draft';
  return 'neutral';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : parsed.toLocaleDateString();
}

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
        id: 'claim',
        header: 'Claim',
        accessorFn: (row) => row.status,
        cell: ({ row }) => {
          const claim = row.original;
          return (
            <div className="admin-primary-cell">
              <span className="admin-primary-cell__title">
                <AdminStatusChip
                  label={humanizeAdminLabel(claim.status)}
                  tone={claimStatusTone(claim.status)}
                />
              </span>
              <AlText
                className="admin-primary-cell__meta"
                variant="mono"
                tone="muted"
                title={claim.id}
              >
                {shortAdminId(claim.id)}
              </AlText>
            </div>
          );
        },
      },
      {
        id: 'vehicleId',
        header: 'Vehicle',
        accessorFn: (row) => row.vehicleId,
        cell: ({ row }) => (
          <AlText variant="mono" tone="muted" title={row.original.vehicleId}>
            {shortAdminId(row.original.vehicleId)}
          </AlText>
        ),
      },
      {
        id: 'claimant',
        header: 'Claimant',
        accessorFn: (row) => row.claimantAccountId,
        cell: ({ row }) => (
          <AlText variant="mono" tone="muted" title={row.original.claimantAccountId}>
            {shortAdminId(row.original.claimantAccountId)}
          </AlText>
        ),
      },
      {
        id: 'reviewedAt',
        header: 'Reviewed',
        accessorFn: (row) => row.reviewedAt ?? '',
        cell: ({ row }) => formatDate(row.original.reviewedAt),
      },
      {
        id: 'createdAt',
        header: 'Submitted',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatDate(row.original.createdAt),
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
