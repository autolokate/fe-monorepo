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
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminPartnerPath } from '@/app/routes/admin-paths';
import { usePartnersColumns } from '@/features/partners/partners-columns';
import { PARTNER_TYPE_FILTERS } from '@/features/partners/partners-filters';
import { usePartnersDirectory } from '@/hooks/partners/usePartnersDirectory';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './partners.css';

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

  const openDetail = useCallback(
    (partner: AdminPartnerOrgDto) => {
      void navigate(adminPartnerPath(partner.orgId));
    },
    [navigate],
  );

  const pageDescription =
    'Garage, store, and taxi partner orgs from Nest. Open a row for store publish and ops links.';

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
                ? 'Taxi org directory returns empty until the backend ships a taxi partner directory.'
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
