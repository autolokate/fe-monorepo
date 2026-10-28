import type { AdminGarageRequestInboxDto, AdminTaxiRequestInboxDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useCallback, useState } from 'react';

import {
  useGarageBidColumns,
  useGarageRequestColumns,
  useTaxiBidColumns,
  useTaxiRequestColumns,
} from '@/features/partners/request-columns';
import {
  GARAGE_REQUEST_STATUS_FILTERS,
  TAXI_REQUEST_STATUS_FILTERS,
} from '@/features/partners/partners-filters';
import { useGarageRequestsInbox } from '@/hooks/partners/useGarageRequestsInbox';
import { useTaxiRequestsInbox } from '@/hooks/partners/useTaxiRequestsInbox';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './partners.css';

type InboxTab = 'garage' | 'taxi';

const INBOX_TABS: { value: InboxTab; label: string }[] = [
  { value: 'garage', label: 'Garage' },
  { value: 'taxi', label: 'Taxi' },
];

export function PartnerRequestsInboxPage() {
  const [tab, setTab] = useState<InboxTab>('garage');
  const [selectedGarage, setSelectedGarage] = useState<AdminGarageRequestInboxDto | null>(null);
  const [selectedTaxi, setSelectedTaxi] = useState<AdminTaxiRequestInboxDto | null>(null);

  const garage = useGarageRequestsInbox();
  const taxi = useTaxiRequestsInbox();

  const garageColumns = useGarageRequestColumns();
  const garageBidColumns = useGarageBidColumns();
  const taxiColumns = useTaxiRequestColumns();
  const taxiBidColumns = useTaxiBidColumns();

  const active = tab === 'garage' ? garage : taxi;
  const selectedBids = tab === 'garage' ? (selectedGarage?.bids ?? []) : (selectedTaxi?.bids ?? []);

  const openGarage = useCallback((row: AdminGarageRequestInboxDto) => {
    setSelectedGarage(row);
    setSelectedTaxi(null);
  }, []);

  const openTaxi = useCallback((row: AdminTaxiRequestInboxDto) => {
    setSelectedTaxi(row);
    setSelectedGarage(null);
  }, []);

  const pageDescription =
    tab === 'garage'
      ? 'Garage service requests and partner bids.'
      : 'Taxi trip requests and partner bids.';

  if (active.userErrorMessage && !active.data) {
    return (
      <RequirePermission permission="partners:read">
        <AlErrorState message={active.userErrorMessage} onRetry={active.refresh} />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="partners:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Requests & bids"
          description={pageDescription}
          actions={
            <AlPageHeaderAction
              label={active.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={active.isFetching}
              variant="secondary"
              onClick={active.refresh}
            />
          }
        />

        <div className="partners-inbox-tabs" role="tablist" aria-label="Request inbox">
          <AdminFilterChips
            options={INBOX_TABS}
            value={tab}
            onChange={(next) => {
              setTab(next);
              setSelectedGarage(null);
              setSelectedTaxi(null);
            }}
            aria-label="Inbox channel"
          />
        </div>

        {tab === 'garage' ? (
          <AdminDataBlock
            filters={
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={GARAGE_REQUEST_STATUS_FILTERS}
                  value={garage.status}
                  onChange={garage.setStatus}
                  aria-label="Garage request status"
                />
              </AdminFilterField>
            }
          >
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="partners-garage-requests"
              columns={garageColumns}
              data={garage.requests}
              loading={garage.isLoading}
              isRefreshing={garage.isFetching && !garage.isFetchingNextPage}
              error={garage.userErrorMessage && garage.data ? garage.userErrorMessage : null}
              onRetry={garage.refresh}
              enableGlobalSearch={false}
              emptyTitle="No garage requests"
              emptyDescription="Change the status filter or wait for new consumer RFQs."
              getRowId={(row) => row.id}
              onRowClick={openGarage}
            />
          </AdminDataBlock>
        ) : (
          <AdminDataBlock
            filters={
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={TAXI_REQUEST_STATUS_FILTERS}
                  value={taxi.status}
                  onChange={taxi.setStatus}
                  aria-label="Taxi request status"
                />
              </AdminFilterField>
            }
          >
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="partners-taxi-requests"
              columns={taxiColumns}
              data={taxi.requests}
              loading={taxi.isLoading}
              isRefreshing={taxi.isFetching && !taxi.isFetchingNextPage}
              error={taxi.userErrorMessage && taxi.data ? taxi.userErrorMessage : null}
              onRetry={taxi.refresh}
              enableGlobalSearch={false}
              emptyTitle="No taxi requests"
              emptyDescription="Change the status filter or wait for new consumer trip RFQs."
              getRowId={(row) => row.id}
              onRowClick={openTaxi}
            />
          </AdminDataBlock>
        )}

        {active.hasNextPage ? (
          <div className="partners-load-more">
            <AlButton
              variant="secondary"
              size="sm"
              data-testid="partners-requests-load-more"
              loading={active.isFetchingNextPage}
              onClick={() => {
                void active.fetchNextPage();
              }}
            >
              Load more
            </AlButton>
          </div>
        ) : null}

        {(selectedGarage || selectedTaxi) && (
          <section
            className="partners-bid-panel"
            data-testid="partners-bids-panel"
            aria-label="Embedded bids"
          >
            <h2 className="partners-section__heading">
              Bids ({selectedBids.length.toLocaleString()})
              {selectedGarage ? (
                <AlText as="span" tone="muted" variant="caption">
                  {' '}
                  · garage {selectedGarage.id}
                </AlText>
              ) : null}
              {selectedTaxi ? (
                <AlText as="span" tone="muted" variant="caption">
                  {' '}
                  · taxi {selectedTaxi.id}
                </AlText>
              ) : null}
            </h2>
            {tab === 'garage' ? (
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="partners-garage-bids"
                columns={garageBidColumns}
                data={selectedGarage?.bids ?? []}
                enableGlobalSearch={false}
                emptyTitle="No bids on this request"
                emptyDescription="No bids have been submitted for this request yet."
                getRowId={(row) => row.id}
              />
            ) : (
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="partners-taxi-bids"
                columns={taxiBidColumns}
                data={selectedTaxi?.bids ?? []}
                enableGlobalSearch={false}
                emptyTitle="No bids on this request"
                emptyDescription="No bids have been submitted for this request yet."
                getRowId={(row) => row.id}
              />
            )}
          </section>
        )}
      </AlStack>
    </RequirePermission>
  );
}
