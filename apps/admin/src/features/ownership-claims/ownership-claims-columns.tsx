import type { AdminOwnershipClaimDto } from '@autolokate/api-client';
import { AlButton, AlText, type ColumnDef } from '@autolokate/ui';
import { useMemo } from 'react';

import {
  claimStatusTone,
  isOpenClaim,
  PRECHECK_COPY,
} from '@/features/ownership-claims/ownership-claim-context';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
} from '@/platform/components/AdminWowSurface';
import { formatAdminDate } from '@/platform/utils/format-admin-date';

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : formatAdminDate(value);
}

export type OwnershipClaimsColumnHandlers = {
  onOpenDetail: (claim: AdminOwnershipClaimDto) => void;
  /** Attempt number per claim (same claimant + vehicle) among the loaded rows; >1 = resubmission. */
  attemptByClaimId?: ReadonlyMap<string, number>;
};

/**
 * Queue columns. There is deliberately no Approve / Reject here (ADM-OWN-04): a decision needs the
 * claim opened, the RC viewed and the owner comparison read, so the row only offers "Review".
 */
export function useOwnershipClaimsColumns(
  handlers: OwnershipClaimsColumnHandlers,
): ColumnDef<AdminOwnershipClaimDto>[] {
  const { onOpenDetail, attemptByClaimId } = handlers;

  return useMemo(
    () => [
      {
        id: 'claim',
        header: 'Claim',
        accessorFn: (row) => row.status,
        cell: ({ row }) => {
          const claim = row.original;
          const attempt = attemptByClaimId?.get(claim.id) ?? 1;
          return (
            <div className="admin-primary-cell">
              <span className="admin-primary-cell__title ownership-claim-title-chips">
                <AdminStatusChip
                  label={humanizeAdminLabel(claim.status)}
                  tone={claimStatusTone(claim.status)}
                />
                {attempt > 1 ? (
                  <span data-testid={`ownership-claim-resubmission-${claim.id}`}>
                    <AdminStatusChip label={`Resubmission #${String(attempt)}`} tone="draft" />
                  </span>
                ) : null}
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
        id: 'registration',
        header: 'Vehicle',
        accessorFn: (row) => row.registration ?? row.vehicleId,
        cell: ({ row }) => {
          const claim = row.original;
          const conflict = claim.plateConflict;
          return (
            <div className="admin-primary-cell">
              <AlText variant="mono" title={claim.vehicleId}>
                {claim.registration ?? shortAdminId(claim.vehicleId)}
              </AlText>
              {conflict && conflict.otherRows > 0 ? (
                <span data-testid={`ownership-claim-plate-conflict-${claim.id}`}>
                  <AdminStatusChip
                    label={
                      conflict.verifiedElsewhere
                        ? 'Duplicate plate · verified elsewhere'
                        : `Duplicate plate · ${String(conflict.otherRows)} other`
                    }
                    tone="draft"
                  />
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'claimant',
        header: 'Claimant',
        accessorFn: (row) => row.claimantUsername ?? row.claimantAccountId,
        cell: ({ row }) => (
          <AlText
            variant={row.original.claimantUsername ? 'body' : 'mono'}
            tone="muted"
            title={row.original.claimantAccountId}
          >
            {row.original.claimantUsername
              ? `@${row.original.claimantUsername}`
              : shortAdminId(row.original.claimantAccountId)}
          </AlText>
        ),
      },
      {
        id: 'precheck',
        header: 'Registry check',
        accessorFn: (row) => row.precheck ?? '',
        cell: ({ row }) => {
          const precheck = row.original.precheck;
          return precheck ? (
            <AdminStatusChip
              label={PRECHECK_COPY[precheck].label}
              tone={PRECHECK_COPY[precheck].tone}
            />
          ) : (
            <AlText tone="muted">—</AlText>
          );
        },
      },
      {
        id: 'createdAt',
        header: 'Submitted',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'reviewedAt',
        header: 'Reviewed',
        accessorFn: (row) => row.reviewedAt ?? '',
        cell: ({ row }) => formatDate(row.original.reviewedAt),
      },
      {
        id: 'actions',
        header: 'Review',
        cell: ({ row }) => {
          const claim = row.original;
          return (
            <AlButton
              size="sm"
              variant={isOpenClaim(claim) ? 'primary' : 'secondary'}
              data-testid={`ownership-claim-details-${claim.id}`}
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetail(claim);
              }}
            >
              {isOpenClaim(claim) ? 'Review' : 'Details'}
            </AlButton>
          );
        },
      },
    ],
    [attemptByClaimId, onOpenDetail],
  );
}
