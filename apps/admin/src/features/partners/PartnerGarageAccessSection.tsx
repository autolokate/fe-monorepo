import type { AdminGaragePassPurchaseDto } from '@autolokate/api-client';
import { AlButton, AlDataTable, AlText, type ColumnDef } from '@autolokate/ui';
import { useState } from 'react';

import { AdjustFreeBidsSheet, GrantPassSheet } from '@/features/garage/GarageEntitlementSheets';
import { useGarageAccess, useGaragePasses } from '@/hooks/garage/useGarageAccess';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { formatAdminDateTime, formatRupeeAmount } from '@/platform/utils/format-admin-date';

const STATE_LABEL: Record<string, string> = {
  Pass: 'Active pass — unlimited bids',
  FreeBids: 'On weekly free bids',
  Exhausted: 'Free bids used up',
};

const STATE_TONE: Record<string, AdminStatusChipTone> = {
  Pass: 'active',
  FreeBids: 'published',
  Exhausted: 'none',
};

const REASON_LABEL: Record<string, string> = {
  store_not_provisioned: 'No storefront provisioned',
  store_not_published: 'Storefront not published',
  business_not_submitted: 'Business details not submitted',
  exhausted_free_bids: 'Weekly free bids used up — needs a pass',
};

const PASS_KIND: Record<string, string> = { DAY: '24-hour pass', MONTH: 'Monthly pass' };
const PASS_SOURCE: Record<string, string> = { CHECKOUT: 'Purchased', ADMIN_GRANT: 'Admin grant' };

const PASS_COLUMNS: ColumnDef<AdminGaragePassPurchaseDto>[] = [
  {
    accessorKey: 'purchasedAt',
    header: 'Recorded',
    cell: ({ row }) => formatAdminDateTime(row.original.purchasedAt),
  },
  {
    accessorKey: 'kind',
    header: 'Pass',
    cell: ({ row }) => PASS_KIND[row.original.kind] ?? row.original.kind,
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => PASS_SOURCE[row.original.source] ?? row.original.source,
  },
  {
    accessorKey: 'amountRupees',
    header: 'Amount',
    cell: ({ row }) =>
      row.original.source === 'ADMIN_GRANT' ? 'Free' : formatRupeeAmount(row.original.amountRupees),
  },
  {
    id: 'window',
    header: 'Valid',
    accessorFn: (row) => row.startsAt,
    cell: ({ row }) =>
      `${formatAdminDateTime(row.original.startsAt)} → ${formatAdminDateTime(row.original.endsAt)}`,
  },
  {
    id: 'ref',
    header: 'Payment / invoice',
    accessorFn: (row) => row.paymentRef ?? '',
    cell: ({ row }) => (
      <span className="admin-mono">
        {[row.original.paymentRef, row.original.invoiceNumber].filter(Boolean).join(' · ') || '—'}
      </span>
    ),
  },
];

/** Flow v3 garage access: weekly free bids (shared by staff, reset Monday IST) + day/month passes. */
export function PartnerGarageAccessSection({ orgId }: { orgId: string }) {
  const { access, isLoading, notDeployed, userErrorMessage } = useGarageAccess(orgId);
  const passes = useGaragePasses(orgId);
  // Same permission as Garage commercial, where these actions also live (there the org id is typed).
  const canWrite = useAdminPermission('settings:write');
  const [grantOpen, setGrantOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  return (
    <>
      <section className="admin-panel" data-testid="partners-garage-access">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">Garage access</h2>
            <p className="admin-panel__subtitle">
              Whether this garage can bid right now — weekly free bids and any active pass.
            </p>
          </div>
          <div className="admin-panel__meta">
            {access ? (
              <AdminStatusChip
                label={STATE_LABEL[access.state] ?? humanizeAdminLabel(access.state)}
                tone={STATE_TONE[access.state] ?? 'neutral'}
              />
            ) : null}
            {access && canWrite ? (
              <>
                <AlButton
                  size="sm"
                  variant="secondary"
                  data-testid="partners-garage-grant-pass"
                  onClick={() => {
                    setGrantOpen(true);
                  }}
                >
                  Grant pass
                </AlButton>
                <AlButton
                  size="sm"
                  variant="secondary"
                  data-testid="partners-garage-adjust-free-bids"
                  onClick={() => {
                    setAdjustOpen(true);
                  }}
                >
                  Free-bid bonus
                </AlButton>
              </>
            ) : null}
          </div>
        </div>
        {isLoading ? <AlText tone="muted">Loading access…</AlText> : null}
        {notDeployed ? (
          <AlText tone="muted" data-testid="admin-not-deployed">
            Not available on this server yet (GET /admin/v1/garage/orgs/{'{orgId}'}/access).
          </AlText>
        ) : null}
        {userErrorMessage ? (
          <AlText tone="muted" role="alert">
            {userErrorMessage}
          </AlText>
        ) : null}
        {access ? (
          <AdminDetailGrid>
            <AdminDetailField label="Can bid" value={access.canBid ? 'Yes' : 'No'} />
            <AdminDetailField
              label="Why not"
              value={access.reason ? (REASON_LABEL[access.reason] ?? access.reason) : '—'}
            />
            <AdminDetailField
              label="Free bids this week"
              value={`${String(access.freeBidsUsedThisWeek)} used of ${String(
                access.freeBidsPerWeek + access.freeBidsBonusThisWeek,
              )}`}
            />
            <AdminDetailField label="Remaining" value={String(access.freeBidsRemaining)} />
            <AdminDetailField label="Weekly allowance" value={String(access.freeBidsPerWeek)} />
            <AdminDetailField
              label="Bonus this week"
              value={String(access.freeBidsBonusThisWeek)}
            />
            <AdminDetailField label="Resets" value={formatAdminDateTime(access.freeBidsResetAt)} />
            <AdminDetailField
              label="Active pass"
              value={
                access.activePass
                  ? `${PASS_KIND[access.activePass.kind] ?? access.activePass.kind}${
                      access.activePass.source
                        ? ` · ${PASS_SOURCE[access.activePass.source] ?? access.activePass.source}`
                        : ''
                    }`
                  : 'None'
              }
            />
            {access.activePass ? (
              <AdminDetailField
                label="Pass window"
                value={`${formatAdminDateTime(access.activePass.startsAt)} → ${formatAdminDateTime(
                  access.activePass.endsAt,
                )}`}
              />
            ) : null}
            <AdminDetailField
              label="Unlimited until"
              value={formatAdminDateTime(access.unlimitedUntil)}
            />
            <AdminDetailField label="Store eligible" value={access.storeEligible ? 'Yes' : 'No'} />
          </AdminDetailGrid>
        ) : null}
        {canWrite ? (
          <>
            <GrantPassSheet initialOrgId={orgId} open={grantOpen} onOpenChange={setGrantOpen} />
            <AdjustFreeBidsSheet
              weekly
              initialOrgId={orgId}
              open={adjustOpen}
              onOpenChange={setAdjustOpen}
            />
          </>
        ) : null}
      </section>

      <section className="admin-panel" data-testid="partners-garage-passes">
        <div className="admin-panel__header">
          <div>
            <h2 className="admin-panel__title">Pass history</h2>
            <p className="admin-panel__subtitle">Purchases and admin grants, newest first.</p>
          </div>
        </div>
        {passes.notDeployed ? (
          <AlText tone="muted">Not available on this server yet.</AlText>
        ) : (
          <>
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="partners-garage-passes"
              columns={PASS_COLUMNS}
              data={passes.rows}
              loading={passes.isLoading}
              error={passes.userErrorMessage}
              onRetry={passes.refresh}
              enableGlobalSearch={false}
              emptyTitle="No passes"
              emptyDescription="This garage has never bought or been granted a pass."
              getRowId={(row) => row.purchaseId}
            />
            <AdminLoadMore
              hasMore={passes.hasMore}
              loading={passes.isFetchingNextPage}
              onLoadMore={passes.loadMore}
              testId="partners-garage-passes-load-more"
            />
          </>
        )}
      </section>
    </>
  );
}
