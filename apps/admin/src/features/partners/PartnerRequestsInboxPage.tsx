import type { AdminGarageRequestInboxDto, AdminTaxiRequestInboxDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import {
  useGarageBidColumns,
  useGarageRequestColumns,
  useTaxiBidColumns,
  useTaxiRequestColumns,
} from '@/features/partners/request-columns';
import {
  formatPartnersDateTime,
  formatRupees,
  GARAGE_REQUEST_STATUS_FILTERS,
  shortId,
  TAXI_REQUEST_STATUS_FILTERS,
} from '@/features/partners/partners-filters';
import { useGarageRequestsInbox } from '@/hooks/partners/useGarageRequestsInbox';
import { useTaxiRequestsInbox } from '@/hooks/partners/useTaxiRequestsInbox';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminKpiStrip,
  AdminPanel,
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './partners.css';

type InboxTab = 'garage' | 'taxi';

const INBOX_TABS: { value: InboxTab; label: string }[] = [
  { value: 'garage', label: 'Garage' },
  { value: 'taxi', label: 'Taxi' },
];

function statusTone(status: string): AdminStatusChipTone {
  if (status === 'OPEN' || status === 'AWARDED') return 'active';
  if (status === 'DRAFT') return 'draft';
  if (status === 'CLOSED' || status === 'EXPIRED' || status === 'CANCELLED_BY_CUSTOMER') {
    return 'none';
  }
  return 'neutral';
}

function DetailCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="admin-detail-card">
      <span className="admin-detail-card__label">{label}</span>
      <span className={`admin-detail-card__value${mono ? ' admin-detail-card__value--mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function requestKpis(
  tab: InboxTab,
  garage: AdminGarageRequestInboxDto[],
  taxi: AdminTaxiRequestInboxDto[],
) {
  const rows = tab === 'garage' ? garage : taxi;
  if (rows.length === 0) return [];
  const statusCounts = new Map<string, number>();
  let bidTotal = 0;
  for (const row of rows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
    bidTotal += row.bids.length;
  }
  return [
    { label: 'On this page', value: String(rows.length) },
    ...[...statusCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([status, count]) => ({
        label: humanizeAdminLabel(status),
        value: String(count),
      })),
    { label: 'Bids on page', value: String(bidTotal) },
  ];
}

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
  const kpiItems = useMemo(
    () => requestKpis(tab, garage.requests, taxi.requests),
    [tab, garage.requests, taxi.requests],
  );

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

  const selectedTitle = selectedGarage
    ? (selectedGarage.title ?? humanizeAdminLabel(selectedGarage.category))
    : selectedTaxi
      ? selectedTaxi.pickupLabel
      : null;

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

        {!active.isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

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

        {(selectedGarage || selectedTaxi) && selectedTitle ? (
          <AdminPanel
            title={selectedTitle}
            subtitle={
              selectedGarage
                ? 'Garage service request detail and bids.'
                : 'Taxi trip request detail and bids.'
            }
            meta={
              <AdminStatusChip
                label={humanizeAdminLabel(
                  selectedGarage?.status ?? selectedTaxi?.status ?? 'Unknown',
                )}
                tone={statusTone(selectedGarage?.status ?? selectedTaxi?.status ?? '')}
              />
            }
          >
            <div className="admin-detail-card-grid" data-testid="partners-request-detail">
              {selectedGarage ? (
                <>
                  <DetailCard label="Request" value={shortAdminId(selectedGarage.id)} mono />
                  <DetailCard label="Status" value={humanizeAdminLabel(selectedGarage.status)} />
                  <DetailCard label="Urgency" value={humanizeAdminLabel(selectedGarage.urgency)} />
                  <DetailCard
                    label="Category"
                    value={[selectedGarage.category, selectedGarage.subcategory]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                  <DetailCard
                    label="Location"
                    value={
                      [selectedGarage.locality, selectedGarage.city, selectedGarage.state]
                        .filter(Boolean)
                        .join(', ') || '—'
                    }
                  />
                  <DetailCard label="Account" value={shortId(selectedGarage.accountId)} mono />
                  <DetailCard label="Vehicle" value={shortId(selectedGarage.vehicleId)} mono />
                  <DetailCard
                    label="Closes"
                    value={formatPartnersDateTime(selectedGarage.closesAt)}
                  />
                  <DetailCard
                    label="Created"
                    value={formatPartnersDateTime(selectedGarage.createdAt)}
                  />
                  {selectedGarage.description ? (
                    <DetailCard label="Description" value={selectedGarage.description} />
                  ) : null}
                </>
              ) : null}
              {selectedTaxi ? (
                <>
                  <DetailCard label="Request" value={shortAdminId(selectedTaxi.id)} mono />
                  <DetailCard label="Status" value={humanizeAdminLabel(selectedTaxi.status)} />
                  <DetailCard label="Pickup" value={selectedTaxi.pickupLabel} />
                  <DetailCard label="Drop-off" value={selectedTaxi.dropoffLabel} />
                  <DetailCard
                    label="Pickup at"
                    value={formatPartnersDateTime(selectedTaxi.pickupAt)}
                  />
                  <DetailCard
                    label="Est. fare"
                    value={formatRupees(selectedTaxi.estimatedFareRupees)}
                  />
                  <DetailCard label="Account" value={shortId(selectedTaxi.accountId)} mono />
                  <DetailCard
                    label="Closes"
                    value={formatPartnersDateTime(selectedTaxi.closesAt)}
                  />
                  <DetailCard
                    label="Created"
                    value={formatPartnersDateTime(selectedTaxi.createdAt)}
                  />
                  {selectedTaxi.notes ? (
                    <DetailCard label="Notes" value={selectedTaxi.notes} />
                  ) : null}
                </>
              ) : null}
            </div>

            <section
              className="admin-panel admin-panel--nested"
              data-testid="partners-bids-panel"
              aria-label="Embedded bids"
            >
              <header className="admin-panel__header">
                <div>
                  <h3 className="admin-panel__title">
                    Bids ({selectedBids.length.toLocaleString()})
                  </h3>
                  <p className="admin-panel__subtitle">Partner responses on this request.</p>
                </div>
              </header>
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
          </AdminPanel>
        ) : null}
      </AlStack>
    </RequirePermission>
  );
}
