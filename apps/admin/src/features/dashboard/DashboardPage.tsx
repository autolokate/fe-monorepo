import type { ReactNode } from 'react';
import {
  CameraIcon,
  CreditCardIcon,
  ReceiptTextIcon,
  ScanLineIcon,
  ShieldCheckIcon,
  StoreIcon,
  UsersIcon,
} from '@autolokate/icons';
import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { useDashboard } from '@/hooks/dashboard/useDashboard';
import { MetricSkeleton } from '@/platform/components/MetricSkeleton';
import { AdminKpiStrip, AdminPanel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './dashboard.css';

import {
  toneForActivePromos,
  toneForCatalogSkus,
  toneWhenIssue,
  toneWhenPendingWork,
  toneWhenPositive,
  type DashboardTone,
} from '@/features/dashboard/dashboard-tones';

type DashboardTileStat = {
  label: string;
  value: string;
  tone?: DashboardTone;
};

type DashboardPageCardProps = {
  title: string;
  description: string;
  primaryValue: string;
  primaryLabel: string;
  primaryTone?: DashboardTone;
  stats?: DashboardTileStat[];
  icon: ReactNode;
  onClick: () => void;
};

function toneClass(prefix: string, tone: DashboardTone = 'neutral'): string {
  return tone === 'neutral' ? '' : `${prefix}--${tone}`;
}

function DashboardPageCard({
  title,
  description,
  primaryValue,
  primaryLabel,
  primaryTone = 'neutral',
  stats,
  icon,
  onClick,
}: DashboardPageCardProps) {
  return (
    <button type="button" className="dashboard-page-card" onClick={onClick}>
      <div className="dashboard-page-card__head">
        <div className="dashboard-page-card__icon">{icon}</div>
        <div className="dashboard-page-card__titles">
          <span className="dashboard-page-card__title">{title}</span>
          <span className="dashboard-page-card__description">{description}</span>
        </div>
      </div>

      <div
        className={`dashboard-page-card__hero ${toneClass('dashboard-page-card__hero', primaryTone)}`}
      >
        <span className="dashboard-page-card__hero-value">{primaryValue}</span>
        <span className="dashboard-page-card__hero-label">{primaryLabel}</span>
      </div>

      {stats && stats.length > 0 ? (
        <div className="dashboard-page-card__tiles">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`dashboard-page-card__tile ${toneClass('dashboard-page-card__tile', stat.tone)}`}
            >
              <span className="dashboard-page-card__tile-value">{stat.value}</span>
              <span className="dashboard-page-card__tile-label">{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
}

type DashboardLinkCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
};

function DashboardLinkCard({ title, description, icon, onClick }: DashboardLinkCardProps) {
  return (
    <button
      type="button"
      className="dashboard-page-card dashboard-page-card--link"
      onClick={onClick}
    >
      <div className="dashboard-page-card__head">
        <div className="dashboard-page-card__icon">{icon}</div>
        <div className="dashboard-page-card__titles">
          <span className="dashboard-page-card__title">{title}</span>
          <span className="dashboard-page-card__description">{description}</span>
        </div>
      </div>
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { metrics, isLoading, isFetching, userErrorMessage, refresh } = useDashboard();

  const inventory = metrics?.inventory;
  const batchManagement = metrics?.batchManagement;
  const promos = metrics?.promos;
  const catalog = metrics?.catalog;

  const snapshotKpis = useMemo(() => {
    if (!inventory || !batchManagement || !promos) return [];
    const items = [
      { label: 'QR batches', value: inventory.totalBatches.toLocaleString() },
      { label: 'Draft batches', value: batchManagement.draftBatches.toLocaleString() },
      { label: 'Active promos', value: promos.activePromos.toLocaleString() },
      {
        label: 'Audit page',
        value: metrics.auditLatestCount.toLocaleString(),
      },
    ];
    if (catalog) {
      items.splice(2, 0, { label: 'Catalog SKUs', value: catalog.skus.toLocaleString() });
    }
    return items;
  }, [batchManagement, catalog, inventory, metrics?.auditLatestCount, promos]);

  if (userErrorMessage && !metrics) {
    return (
      <RequirePermission permission="dashboard:view">
        <AlErrorState
          message={userErrorMessage}
          onRetry={() => {
            refresh();
          }}
        />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="dashboard:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Dashboard"
          description="Operations snapshot and shortcuts across Admin."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        {isLoading || !metrics || !inventory || !batchManagement || !promos ? (
          <div className="dashboard-page-grid dashboard-page-grid--loading">
            {Array.from({ length: 6 }, (_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {snapshotKpis.length > 0 ? <AdminKpiStrip items={snapshotKpis} /> : null}

            <AdminPanel
              title="Operations"
              subtitle="Stock, catalog, promos, and recent audit activity."
            >
              <div className="dashboard-page-grid">
                <DashboardPageCard
                  title="QR stickers"
                  description="Stock and batch lifecycle"
                  icon={<ScanLineIcon size={18} aria-hidden />}
                  primaryValue={inventory.totalBatches.toLocaleString()}
                  primaryLabel="batches"
                  stats={[
                    {
                      label: 'Draft',
                      value: batchManagement.draftBatches.toLocaleString(),
                      tone: toneWhenPendingWork(batchManagement.draftBatches),
                    },
                    {
                      label: 'Provisioned',
                      value: inventory.provisionedBatches.toLocaleString(),
                      tone: toneWhenPositive(inventory.provisionedBatches),
                    },
                    {
                      label: 'Codes',
                      value: inventory.totalProvisionedCodes.toLocaleString(),
                      tone: 'neutral',
                    },
                  ]}
                  onClick={() => {
                    void navigate(adminPaths.qrBatches);
                  }}
                />
                {catalog ? (
                  <DashboardPageCard
                    title="Catalog"
                    description="Plan versions and SKU shelves"
                    icon={<StoreIcon size={18} aria-hidden />}
                    primaryValue={catalog.skus.toLocaleString()}
                    primaryLabel="SKUs"
                    primaryTone={toneForCatalogSkus(catalog.skus, catalog.emptyShelves)}
                    stats={[
                      {
                        label: 'Plan versions',
                        value: catalog.planVersions.toLocaleString(),
                        tone: 'neutral',
                      },
                      {
                        label: 'Live plans',
                        value: catalog.livePlans.toLocaleString(),
                        tone: catalog.livePlans > 0 ? 'success' : 'warning',
                      },
                      {
                        label: 'Empty shelves',
                        value: catalog.emptyShelves.toLocaleString(),
                        tone: toneWhenIssue(catalog.emptyShelves),
                      },
                    ]}
                    onClick={() => {
                      void navigate(adminPaths.catalog);
                    }}
                  />
                ) : (
                  <DashboardLinkCard
                    title="Catalog"
                    description="Plan versions and SKU shelves"
                    icon={<StoreIcon size={18} aria-hidden />}
                    onClick={() => {
                      void navigate(adminPaths.catalog);
                    }}
                  />
                )}
                <DashboardPageCard
                  title="Promos"
                  description="Campaigns and discount codes"
                  icon={<CreditCardIcon size={18} aria-hidden />}
                  primaryValue={promos.activePromos.toLocaleString()}
                  primaryLabel="active"
                  primaryTone={toneForActivePromos(promos.activePromos)}
                  stats={[
                    {
                      label: 'Total',
                      value: promos.totalPromos.toLocaleString(),
                      tone: 'neutral',
                    },
                    {
                      label: 'Upcoming',
                      value: promos.upcomingPromos.toLocaleString(),
                      tone: promos.upcomingPromos > 0 ? 'warning' : 'neutral',
                    },
                    {
                      label: 'Expired',
                      value: promos.expiredPromos.toLocaleString(),
                      tone: toneWhenIssue(promos.expiredPromos),
                    },
                  ]}
                  onClick={() => {
                    void navigate(adminPaths.promos);
                  }}
                />
                <DashboardPageCard
                  title="Activity"
                  description="Latest audit feed page"
                  icon={<ReceiptTextIcon size={18} aria-hidden />}
                  primaryValue={metrics.auditLatestCount.toLocaleString()}
                  primaryLabel="events on latest page"
                  onClick={() => {
                    void navigate(adminPaths.auditEvents);
                  }}
                />
              </div>
            </AdminPanel>

            <AdminPanel title="Jump to" subtitle="Common operator destinations.">
              <div className="dashboard-page-grid">
                <DashboardLinkCard
                  title="Customers"
                  description="Phone lookup and vehicle care"
                  icon={<UsersIcon size={18} aria-hidden />}
                  onClick={() => {
                    void navigate(adminPaths.users);
                  }}
                />
                <DashboardLinkCard
                  title="Partners"
                  description="Garage, store, and taxi orgs"
                  icon={<StoreIcon size={18} aria-hidden />}
                  onClick={() => {
                    void navigate(adminPaths.partners);
                  }}
                />
                <DashboardLinkCard
                  title="Discovery"
                  description="Q&A, reels, Daily Drive, Academy"
                  icon={<CameraIcon size={18} aria-hidden />}
                  onClick={() => {
                    void navigate(adminPaths.discovery);
                  }}
                />
                <DashboardLinkCard
                  title="Settlements"
                  description="Clawbacks and settlement batches"
                  icon={<ShieldCheckIcon size={18} aria-hidden />}
                  onClick={() => {
                    void navigate(adminPaths.finance);
                  }}
                />
              </div>
            </AdminPanel>
          </>
        )}
      </AlStack>
    </RequirePermission>
  );
}
