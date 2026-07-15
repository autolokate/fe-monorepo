import type { ReactNode } from 'react';
import {
  CreditCardIcon,
  ReceiptTextIcon,
  ScanLineIcon,
  ShieldCheckIcon,
  StoreIcon,
  UserIcon,
  UsersIcon,
} from '@autolokate/icons';
import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack } from '@autolokate/ui';
import { useNavigate } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { useDashboard } from '@/hooks/dashboard/useDashboard';
import { MetricSkeleton } from '@/platform/components/MetricSkeleton';
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

      <span className="dashboard-page-card__cta">Open module</span>
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
      <span className="dashboard-page-card__cta">Open module</span>
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { metrics, isLoading, isFetching, userErrorMessage, refresh } = useDashboard();

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

  const inventory = metrics?.inventory;
  const batchManagement = metrics?.batchManagement;
  const promos = metrics?.promos;
  const catalog = metrics?.catalog;

  return (
    <RequirePermission permission="dashboard:view">
      <AlStack gap="lg">
        <AlPageHeader
          title="Dashboard"
          description="Live counts from each module."
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
            {Array.from({ length: 8 }, (_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="dashboard-page-grid">
            <DashboardPageCard
              title="QR Inventory"
              description="Browse batches and sticker stock"
              icon={<ScanLineIcon size={20} aria-hidden />}
              primaryValue={inventory.totalBatches.toLocaleString()}
              primaryLabel="batches"
              stats={[
                {
                  label: 'Provisioned batches',
                  value: inventory.provisionedBatches.toLocaleString(),
                  tone: toneWhenPositive(inventory.provisionedBatches),
                },
                {
                  label: 'In distribution',
                  value: inventory.inDistributionBatches.toLocaleString(),
                  tone: toneWhenPositive(inventory.inDistributionBatches),
                },
                {
                  label: 'Sticker codes',
                  value: inventory.totalProvisionedCodes.toLocaleString(),
                  tone: 'neutral',
                },
              ]}
              onClick={() => {
                void navigate(adminPaths.inventory);
              }}
            />
            <DashboardPageCard
              title="QR Batch Management"
              description="Create batches and run lifecycle"
              icon={<ScanLineIcon size={20} aria-hidden />}
              primaryValue={batchManagement.draftBatches.toLocaleString()}
              primaryLabel="draft batches"
              primaryTone={toneWhenPendingWork(batchManagement.draftBatches)}
              stats={[
                {
                  label: 'In pipeline',
                  value: batchManagement.pipelineBatches.toLocaleString(),
                  tone: toneWhenPendingWork(batchManagement.pipelineBatches),
                },
                {
                  label: 'Provisioned',
                  value: batchManagement.provisionedBatches.toLocaleString(),
                  tone: toneWhenPositive(batchManagement.provisionedBatches),
                },
                {
                  label: 'Total batches',
                  value: batchManagement.totalBatches.toLocaleString(),
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
                icon={<StoreIcon size={20} aria-hidden />}
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
                icon={<StoreIcon size={20} aria-hidden />}
                onClick={() => {
                  void navigate(adminPaths.catalog);
                }}
              />
            )}
            <DashboardPageCard
              title="Promo Management"
              description="Campaigns and discount codes"
              icon={<CreditCardIcon size={20} aria-hidden />}
              primaryValue={promos.activePromos.toLocaleString()}
              primaryLabel="active promos"
              primaryTone={toneForActivePromos(promos.activePromos)}
              stats={[
                {
                  label: 'Total promos',
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
              title="Audit Events"
              description="Administrative activity timeline"
              icon={<ReceiptTextIcon size={20} aria-hidden />}
              primaryValue={metrics.auditLatestCount.toLocaleString()}
              primaryLabel="events in latest feed"
              onClick={() => {
                void navigate(adminPaths.auditEvents);
              }}
            />
            <DashboardLinkCard
              title="Finance Operations"
              description="Clawbacks and settlement batches"
              icon={<ShieldCheckIcon size={20} aria-hidden />}
              onClick={() => {
                void navigate(adminPaths.finance);
              }}
            />
            <DashboardLinkCard
              title="Ownership Transfers"
              description="Initiate and approve transfers"
              icon={<UserIcon size={20} aria-hidden />}
              onClick={() => {
                void navigate(adminPaths.ownershipTransfers);
              }}
            />
            <DashboardLinkCard
              title="Users & Roles"
              description="Grant or revoke ADMIN access"
              icon={<UsersIcon size={20} aria-hidden />}
              onClick={() => {
                void navigate(adminPaths.users);
              }}
            />
          </div>
        )}
      </AlStack>
    </RequirePermission>
  );
}
