import type { AdminPartnerKycItemDto, GarageGstVerification } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlModal,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminPartnerPath } from '@/app/routes/admin-paths';
import { usePartnersKyc, type KycQueueStatus } from '@/hooks/partners/usePartnersKyc';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './partners.css';

const STATUS_FILTERS: { value: KycQueueStatus; label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'Awaiting review' },
  { value: 'NEEDS_ATTENTION', label: 'Needs attention' },
  { value: 'PENDING', label: 'Pending vendor' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'NOT_SUBMITTED', label: 'Not submitted' },
];

type Pending = { row: AdminPartnerKycItemDto; decision: GarageGstVerification } | null;

export function PartnersKycPage() {
  const navigate = useNavigate();
  const canWrite = useAdminPermission('partners:write');
  const {
    items,
    status,
    setStatus,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    notDeployed,
    userErrorMessage,
    refresh,
    data,
    decide,
    decideError,
  } = usePartnersKyc();
  const [pending, setPending] = useState<Pending>(null);

  const columns = useMemo<ColumnDef<AdminPartnerKycItemDto>[]>(
    () => [
      {
        id: 'org',
        header: 'Partner',
        accessorFn: (row) => row.orgName,
        cell: ({ row }) => (
          <div className="partners-cell-title">
            <span className="partners-cell-title__primary">{row.original.orgName}</span>
            <span className="partners-cell-title__secondary">
              {row.original.storeName ?? '—'} · {humanizeAdminLabel(row.original.surfaceType)}
            </span>
          </div>
        ),
      },
      { id: 'gstin', header: 'GSTIN', accessorFn: (row) => row.gstin ?? '—' },
      {
        id: 'legal',
        header: 'Legal / trade name',
        accessorFn: (row) => [row.legalName, row.tradeName].filter(Boolean).join(' · ') || '—',
      },
      {
        id: 'registration',
        header: 'Registration',
        accessorFn: (row) => humanizeAdminLabel(row.registrationKind),
      },
      {
        id: 'gst',
        header: 'GST status',
        accessorFn: (row) => humanizeAdminLabel(row.gstVerification),
      },
      { id: 'updated', header: 'Updated', accessorFn: (row) => formatAdminDateTime(row.updatedAt) },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          canWrite ? (
            <div className="partners-links">
              {row.original.gstVerification !== 'VERIFIED' ? (
                <AlButton
                  size="sm"
                  data-testid={`kyc-verify-${row.original.orgId}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    decide.reset();
                    setPending({ row: row.original, decision: 'VERIFIED' });
                  }}
                >
                  Verify
                </AlButton>
              ) : null}
              {row.original.gstVerification !== 'NEEDS_ATTENTION' ? (
                <AlButton
                  size="sm"
                  variant="secondary"
                  data-testid={`kyc-reject-${row.original.orgId}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    decide.reset();
                    setPending({ row: row.original, decision: 'NEEDS_ATTENTION' });
                  }}
                >
                  Needs attention
                </AlButton>
              ) : null}
            </div>
          ) : null,
      },
    ],
    [canWrite, decide],
  );

  return (
    <RequirePermission permission="partners:read">
      <AlStack gap="md">
        <AlPageHeader
          title="KYC review"
          description="Storefront GST checks. Sandbox self-verification never marks a partner verified — an operator decides here."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />
        {notDeployed ? (
          <AdminNotDeployedState title="KYC review" endpoint="GET /admin/v1/partners/kyc" />
        ) : userErrorMessage && !data ? (
          <AlErrorState message={userErrorMessage} onRetry={refresh} />
        ) : (
          <>
            <AdminDataBlock
              filters={
                <AdminFilterField label="GST status">
                  <AdminFilterChips
                    options={STATUS_FILTERS}
                    value={status}
                    onChange={setStatus}
                    aria-label="GST status"
                  />
                </AdminFilterField>
              }
            >
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="partners-kyc"
                columns={columns}
                data={items}
                loading={isLoading}
                isRefreshing={isFetching && !isFetchingNextPage}
                error={userErrorMessage}
                onRetry={refresh}
                enableGlobalSearch={false}
                emptyTitle="Queue is empty"
                emptyDescription="No storefront has this GST status."
                getRowId={(row) => row.storeId}
                onRowClick={(row) => {
                  void navigate(adminPartnerPath(row.orgId));
                }}
              />
            </AdminDataBlock>
            {hasNextPage ? (
              <div className="partners-load-more">
                <AlButton
                  variant="secondary"
                  size="sm"
                  loading={isFetchingNextPage}
                  onClick={() => {
                    void fetchNextPage();
                  }}
                >
                  Load more
                </AlButton>
              </div>
            ) : null}
          </>
        )}

        <AlModal
          open={pending !== null}
          onOpenChange={(next) => {
            if (!next && !decide.isPending) setPending(null);
          }}
          title={
            pending?.decision === 'VERIFIED' ? 'Mark GST verified?' : 'Mark GST needs attention?'
          }
          description={
            pending
              ? `${pending.row.orgName} · GSTIN ${pending.row.gstin ?? 'not provided'}. Recorded in the audit log.`
              : undefined
          }
          footer={
            <div className="admin-modal-actions">
              <AlButton
                variant="secondary"
                disabled={decide.isPending}
                onClick={() => {
                  setPending(null);
                }}
              >
                Cancel
              </AlButton>
              <AlButton
                data-testid="kyc-decision-confirm"
                loading={decide.isPending}
                onClick={() => {
                  if (!pending) return;
                  decide.mutate(
                    { orgId: pending.row.orgId, decision: pending.decision },
                    {
                      onSuccess: () => {
                        setPending(null);
                      },
                    },
                  );
                }}
              >
                Confirm
              </AlButton>
            </div>
          }
        >
          {pending?.decision === 'VERIFIED' ? (
            <AlText tone="muted">
              Only verify after checking the GSTIN and legal name against the government record.
            </AlText>
          ) : null}
          {decideError ? (
            <AlText tone="muted" role="alert">
              {decideError}
            </AlText>
          ) : null}
        </AlModal>
      </AlStack>
    </RequirePermission>
  );
}
