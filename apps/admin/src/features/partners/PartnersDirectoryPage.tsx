import type { AdminPartnerOrgDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlSearchInput,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminPartnerPath } from '@/app/routes/admin-paths';
import { usePartnersColumns } from '@/features/partners/partners-columns';
import { PARTNER_TYPE_FILTERS } from '@/features/partners/partners-filters';
import { usePartnersDirectory } from '@/hooks/partners/usePartnersDirectory';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './partners.css';

function partnerKpisFromPage(partners: AdminPartnerOrgDto[]) {
  const kindCounts = new Map<string, number>();
  let withStore = 0;
  let published = 0;
  for (const partner of partners) {
    kindCounts.set(partner.partnerKind, (kindCounts.get(partner.partnerKind) ?? 0) + 1);
    if (partner.storeId) withStore += 1;
    if (partner.storeStatus === 'PUBLISHED') published += 1;
  }
  const items = [
    { label: 'On this page', value: String(partners.length) },
    ...[...kindCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([kind, count]) => ({
        label: humanizeAdminLabel(kind),
        value: String(count),
      })),
  ];
  if (withStore > 0) {
    items.push({ label: 'With storefront', value: String(withStore) });
  }
  if (published > 0) {
    items.push({ label: 'Store published', value: String(published) });
  }
  return items;
}

export function PartnersDirectoryPage() {
  const navigate = useNavigate();
  const {
    partners,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    mayBeTruncated,
    userErrorMessage,
    type,
    setType,
    search,
    setSearch,
    refresh,
    data,
  } = usePartnersDirectory();

  const columns = usePartnersColumns();
  const kpiItems = useMemo(
    () => (partners.length > 0 ? partnerKpisFromPage(partners) : []),
    [partners],
  );

  const openDetail = useCallback(
    (partner: AdminPartnerOrgDto) => {
      void navigate(adminPartnerPath(partner.orgId));
    },
    [navigate],
  );

  const pageDescription = 'Partner organizations for Garage, Store, and Taxi.';

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="partners:read">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="partners:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Partners"
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

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <>
              <AdminFilterField label="Type">
                <AdminFilterChips
                  options={PARTNER_TYPE_FILTERS}
                  value={type}
                  onChange={setType}
                  aria-label="Partner type"
                />
              </AdminFilterField>
              <AdminFilterField label="Search">
                <AlSearchInput
                  compact
                  value={search}
                  onChange={setSearch}
                  placeholder="Search name or store…"
                  ariaLabel="Search partners"
                />
              </AdminFilterField>
            </>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="partners-directory"
            columns={columns}
            data={partners}
            loading={isLoading}
            isRefreshing={isFetching && !isFetchingNextPage}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            enableGlobalSearch={false}
            emptyTitle={type === 'TAXI' ? 'No taxi partners yet' : 'No partners found'}
            emptyDescription={
              type === 'TAXI'
                ? 'Taxi org directory returns empty until partners are provisioned.'
                : 'Change the type filter or search to find partners.'
            }
            getRowId={(row) => row.orgId}
            onRowClick={openDetail}
          />
        </AdminDataBlock>

        {hasNextPage ? (
          <div className="partners-load-more">
            <AlButton
              variant="secondary"
              size="sm"
              data-testid="partners-directory-load-more"
              loading={isFetchingNextPage}
              onClick={() => {
                void fetchNextPage();
              }}
            >
              Load more
            </AlButton>
          </div>
        ) : null}
        {mayBeTruncated ? (
          <AlText tone="muted" variant="caption">
            Showing the first page only. Narrow with search if you need a specific org.
          </AlText>
        ) : null}
      </AlStack>
    </RequirePermission>
  );
}
