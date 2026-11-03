import type { AdminGarageRequestInboxDto, AdminTaxiRequestInboxDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

import {
  useGarageBidColumns,
  useGarageRequestColumns,
  useTaxiBidColumns,
  useTaxiRequestColumns,
} from '@/features/partners/request-columns';
import {
  formatCityState,
  formatPartnersDateTime,
  formatRupees,
  GARAGE_REQUEST_STATUS_FILTERS,
  shortId,
  TAXI_REQUEST_STATUS_FILTERS,
} from '@/features/partners/partners-filters';
import { RequestPhotoGrid, SourceClipCard } from '@/features/partners/QuotesV4Blocks';
import { useGarageRequestDetail } from '@/hooks/partners/useGarageRequestDetail';
import { useGarageRequestsInbox } from '@/hooks/partners/useGarageRequestsInbox';
import { useTaxiRequestsInbox } from '@/hooks/partners/useTaxiRequestsInbox';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminReasonDialog } from '@/platform/components/AdminReasonDialog';
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
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

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
  value: ReactNode;
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

/**
 * Coordinates the server derived from the customer's Google place — opens the point on Google Maps
 * (a plain link, no API key involved). Pre-Places requests may have none.
 */
function MapPointLink({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return <>Not captured</>;
  const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  return (
    <a
      className="admin-link"
      href={`https://www.google.com/maps/search/?api=1&query=${String(lat)},${String(lng)}`}
      target="_blank"
      rel="noreferrer noopener"
    >
      {label}
    </a>
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
  const canCloseTaxi = useAdminPermission('taxi:write');
  const [closeOpen, setCloseOpen] = useState(false);
  const garageDetail = useGarageRequestDetail(selectedGarage?.id ?? null);
  // The detail read carries signed photo URLs; fall back to the list row while it loads.
  const garageView = garageDetail.detail ?? selectedGarage;

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

  const keepFilters = tab === 'taxi' && (taxi.hasFilters || taxi.inverted);
  if (active.userErrorMessage && !active.data && !keepFilters) {
    return (
      <RequirePermission permission="partners:read">
        <AlErrorState message={active.userErrorMessage} onRetry={active.refresh} />
      </RequirePermission>
    );
  }

  const sourceClip = selectedGarage
    ? (garageView?.sourceClip ?? null)
    : (selectedTaxi?.sourceClip ?? null);

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
              <>
                <AdminFilterField label="Status">
                  <AdminFilterChips
                    options={TAXI_REQUEST_STATUS_FILTERS}
                    value={taxi.status}
                    onChange={taxi.setStatus}
                    aria-label="Taxi request status"
                  />
                </AdminFilterField>
                <div className="partners-taxi-filters">
                  <AdminFilterField label="Pickup city">
                    <input
                      className="partners-filter-input"
                      data-testid="taxi-filter-city"
                      aria-label="Pickup city"
                      placeholder="e.g. Bengaluru"
                      value={taxi.pickupCity}
                      onChange={(event) => {
                        taxi.setPickupCity(event.target.value);
                      }}
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Pickup state">
                    <input
                      className="partners-filter-input"
                      data-testid="taxi-filter-state"
                      aria-label="Pickup state"
                      placeholder="e.g. Karnataka"
                      value={taxi.pickupState}
                      onChange={(event) => {
                        taxi.setPickupState(event.target.value);
                      }}
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Created from">
                    <input
                      type="date"
                      className="partners-filter-input"
                      data-testid="taxi-filter-from"
                      aria-label="Created from"
                      value={taxi.fromDay}
                      onChange={(event) => {
                        taxi.setFromDay(event.target.value);
                      }}
                    />
                  </AdminFilterField>
                  <AdminFilterField label="Created to (inclusive)">
                    <input
                      type="date"
                      className="partners-filter-input"
                      data-testid="taxi-filter-to"
                      aria-label="Created to"
                      value={taxi.toDay}
                      onChange={(event) => {
                        taxi.setToDay(event.target.value);
                      }}
                    />
                  </AdminFilterField>
                </div>
              </>
            }
          >
            {taxi.inverted ? (
              <p className="partners-filter-error" role="alert">
                The end date is before the start date.
              </p>
            ) : taxi.filterErrorMessage ? (
              <p className="partners-filter-error" role="alert" data-testid="taxi-filter-error">
                {taxi.filterErrorMessage}
              </p>
            ) : null}
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="partners-taxi-requests"
              columns={taxiColumns}
              data={taxi.requests}
              loading={taxi.isLoading}
              isRefreshing={taxi.isFetching && !taxi.isFetchingNextPage}
              error={
                taxi.filterErrorMessage
                  ? null
                  : taxi.userErrorMessage && (taxi.data || keepFilters)
                    ? taxi.userErrorMessage
                    : null
              }
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
              {garageView ? (
                <>
                  <DetailCard label="Request" value={shortAdminId(garageView.id)} mono />
                  <DetailCard label="Status" value={humanizeAdminLabel(garageView.status)} />
                  <DetailCard label="Urgency" value={humanizeAdminLabel(garageView.urgency)} />
                  <DetailCard
                    label="Category"
                    value={[garageView.category, garageView.subcategory]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                  <DetailCard
                    label="Location"
                    value={
                      [garageView.locality, garageView.city, garageView.state]
                        .filter(Boolean)
                        .join(', ') || '—'
                    }
                  />
                  <DetailCard label="Account" value={shortId(garageView.accountId)} mono />
                  <DetailCard
                    label="Vehicle"
                    value={
                      <>
                        {garageView.vehicle?.displayName ?? 'Vehicle'}
                        {garageView.vehicle?.plateMasked ? (
                          <span className="partners-cell-title__secondary">
                            {' '}
                            · {garageView.vehicle.plateMasked}
                          </span>
                        ) : null}
                      </>
                    }
                  />
                  {garageView.requestKind ? (
                    <DetailCard
                      label="Kind"
                      value={garageView.requestKind === 'PARTS' ? 'Parts (Store)' : 'Service'}
                    />
                  ) : null}
                  <DetailCard label="Place" value={garageView.locationLabel ?? 'Not captured'} />
                  <DetailCard
                    label="Place point"
                    value={<MapPointLink lat={garageView.lat} lng={garageView.lng} />}
                  />
                  <DetailCard
                    label="Photos"
                    value={String(garageView.photoCount ?? garageView.photos?.length ?? 0)}
                  />
                  <DetailCard label="Closes" value={formatPartnersDateTime(garageView.closesAt)} />
                  <DetailCard
                    label="Created"
                    value={formatPartnersDateTime(garageView.createdAt)}
                  />
                  {garageView.description ? (
                    <DetailCard label="Description" value={garageView.description} />
                  ) : null}
                </>
              ) : null}
              {selectedTaxi ? (
                <>
                  <DetailCard label="Request" value={shortAdminId(selectedTaxi.id)} mono />
                  <DetailCard label="Status" value={humanizeAdminLabel(selectedTaxi.status)} />
                  <DetailCard label="Pickup" value={selectedTaxi.pickupLabel} />
                  <DetailCard
                    label="Pickup city / state"
                    value={
                      formatCityState(selectedTaxi.pickupCity, selectedTaxi.pickupState) ??
                      'Not captured'
                    }
                  />
                  <DetailCard
                    label="Pickup point"
                    value={
                      <MapPointLink lat={selectedTaxi.pickupLat} lng={selectedTaxi.pickupLng} />
                    }
                  />
                  <DetailCard label="Drop-off" value={selectedTaxi.dropoffLabel} />
                  <DetailCard
                    label="Drop-off city / state"
                    value={
                      formatCityState(selectedTaxi.dropoffCity, selectedTaxi.dropoffState) ??
                      'Not captured'
                    }
                  />
                  <DetailCard
                    label="Drop-off point"
                    value={
                      <MapPointLink lat={selectedTaxi.dropoffLat} lng={selectedTaxi.dropoffLng} />
                    }
                  />
                  {typeof selectedTaxi.seats === 'number' ? (
                    <DetailCard label="Seats" value={String(selectedTaxi.seats)} />
                  ) : null}
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

            {garageView && selectedGarage ? (
              <section className="partners-v4-section" aria-label="Customer photos">
                <h3 className="partners-v4-section__title">Customer photos</h3>
                {garageDetail.isLoading ? (
                  <p className="admin-empty-note">Loading photos…</p>
                ) : garageDetail.userErrorMessage ? (
                  <p className="admin-form-error" role="alert">
                    {garageDetail.userErrorMessage}
                  </p>
                ) : garageView.photos && garageView.photos.length > 0 ? (
                  <RequestPhotoGrid photos={garageView.photos} />
                ) : (
                  <p className="admin-empty-note" data-testid="partners-request-no-photos">
                    No photos on this request.
                  </p>
                )}
              </section>
            ) : null}

            {sourceClip ? (
              <section className="partners-v4-section" aria-label="Source clip">
                <h3 className="partners-v4-section__title">Quoted from a clip</h3>
                <SourceClipCard clip={sourceClip} />
              </section>
            ) : null}

            {selectedTaxi && canCloseTaxi && selectedTaxi.status === 'OPEN' ? (
              <div className="partners-detail-actions">
                <AlButton
                  variant="secondary"
                  size="sm"
                  data-testid="taxi-request-close"
                  onClick={() => {
                    taxi.close.reset();
                    setCloseOpen(true);
                  }}
                >
                  Close request
                </AlButton>
              </div>
            ) : null}

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

        <AdminReasonDialog
          open={closeOpen && selectedTaxi !== null}
          onOpenChange={setCloseOpen}
          title="Close this taxi request?"
          description="The request stops taking bids (it becomes Expired) and every bidder is notified. Use for spam or abuse."
          confirmLabel="Close request"
          destructive
          loading={taxi.close.isPending}
          error={taxi.closeError}
          testIdPrefix="taxi-request-close"
          onConfirm={(reason) => {
            if (!selectedTaxi || !reason) return;
            taxi.close.mutate(
              { id: selectedTaxi.id, reason },
              {
                onSuccess: (updated) => {
                  setSelectedTaxi({
                    ...selectedTaxi,
                    ...updated,
                    bids: Array.isArray(updated.bids) ? updated.bids : selectedTaxi.bids,
                  });
                  setCloseOpen(false);
                },
              },
            );
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
