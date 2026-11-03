import { useQueryClient } from '@tanstack/react-query';
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
import { ArrowUpRight, CircleCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { useDashboard } from '@/hooks/dashboard/useDashboard';
import {
  useDashboardAttention,
  useDashboardTaxiRevenue,
  type AttentionItem,
} from '@/hooks/dashboard/useDashboardAttention';
import {
  attentionTone,
  formatAttentionCount,
  formatPaiseAsRupees,
  REVENUE_PAGE_LIMIT,
} from '@/services/dashboard/dashboard-attention';
import { MetricSkeleton } from '@/platform/components/MetricSkeleton';
import { AdminPanel } from '@/platform/components/AdminWowSurface';
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
  testId?: string;
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
  testId,
}: DashboardPageCardProps) {
  return (
    <button type="button" className="dashboard-page-card" onClick={onClick} data-testid={testId}>
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

function AttentionTile({ item }: { item: AttentionItem }) {
  const tone = item.value ? attentionTone(item.value, item.urgent) : 'calm';
  return (
    <Link
      to={item.to}
      className={`ax-attention ax-attention--${tone}`}
      data-testid={`dashboard-attention-${item.id}`}
      aria-busy={item.isLoading || undefined}
    >
      <span className="ax-attention__top">
        <span className="ax-attention__label">{item.label}</span>
        <ArrowUpRight size={15} aria-hidden className="ax-attention__arrow" />
      </span>
      {item.isLoading ? (
        <span className="ax-attention__value">
          <span className="al-skeleton ax-attention__skeleton" />
        </span>
      ) : item.error ? (
        <span className="ax-attention__value ax-attention__value--muted" title={item.error}>
          —
        </span>
      ) : (
        <span className="ax-attention__value ax-num">
          {item.value ? formatAttentionCount(item.value) : '—'}
        </span>
      )}
      <span className="ax-attention__hint">{item.error ?? item.hint}</span>
    </Link>
  );
}

function AttentionPanel() {
  const { items, source } = useDashboardAttention();
  const visible = items.filter((item) => item.allowed);
  const settled = visible.filter((item) => !item.isLoading && !item.error && item.value);
  const allClear =
    settled.length === visible.length && settled.every((item) => item.value?.count === 0);
  if (visible.length === 0) return null;
  return (
    <AdminPanel
      title="Needs attention"
      subtitle={
        source === 'exact'
          ? 'Live queue counts from the admin API — open one to work it.'
          : 'Live queues from the admin list routes — open one to work it. Counts above 50 show as 50+.'
      }
      meta={
        allClear ? (
          <span className="ax-all-clear">
            <CircleCheck size={15} aria-hidden /> All clear
          </span>
        ) : null
      }
    >
      <div className="ax-attention-grid" data-testid="dashboard-attention">
        {visible.map((item) => (
          <AttentionTile key={item.id} item={item} />
        ))}
      </div>
    </AdminPanel>
  );
}

function TaxiRevenuePanel() {
  const { allowed, summary, isLoading, error, refetch } = useDashboardTaxiRevenue();
  if (!allowed) return null;
  return (
    <AdminPanel
      title="Taxi revenue"
      subtitle={
        summary?.partial
          ? `Autolokate's share from the newest ${String(REVENUE_PAGE_LIMIT)} ledger entries — open Revenue for the full ledger.`
          : 'Autolokate’s share from the taxi revenue ledger (booking fees + forfeits).'
      }
      meta={
        <Link className="admin-link" to={adminPaths.taxiRevenue}>
          Open ledger
        </Link>
      }
    >
      {error ? (
        <AlErrorState message={error} onRetry={refetch} />
      ) : isLoading || !summary ? (
        <div className="ax-stat-row" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="ax-stat">
              <span className="al-skeleton" style={{ width: '60%', height: 22 }} />
              <span className="al-skeleton" style={{ width: '40%', height: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="ax-stat-row" data-testid="dashboard-taxi-revenue">
          <div className="ax-stat ax-stat--lead">
            <span className="ax-stat__value">{formatPaiseAsRupees(summary.totalPaise)}</span>
            <span className="ax-stat__label">
              Total{summary.partial ? ' (newest entries)' : ''} ·{' '}
              {summary.entries.toLocaleString('en-IN')} entries
            </span>
          </div>
          <div className="ax-stat">
            <span className="ax-stat__value">
              {formatPaiseAsRupees(summary.advanceEarnedPaise)}
            </span>
            <span className="ax-stat__label">Booking fees earned</span>
          </div>
          <div className="ax-stat">
            <span className="ax-stat__value">
              {formatPaiseAsRupees(summary.advanceForfeitedPaise)}
            </span>
            <span className="ax-stat__label">Booking fees forfeited</span>
          </div>
          <div className="ax-stat">
            <span className="ax-stat__value">
              {formatPaiseAsRupees(summary.depositForfeitedPaise)}
            </span>
            <span className="ax-stat__label">Partner deposits forfeited</span>
          </div>
        </div>
      )}
    </AdminPanel>
  );
}

/** A count from a capped list reads "100+" so it never claims to be the full total. */
function cappedCount(value: number, capped: boolean): string {
  return capped ? `${value.toLocaleString()}+` : value.toLocaleString();
}

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { metrics, isLoading, isFetching, userErrorMessage, refresh } = useDashboard();

  const inventory = metrics?.inventory;
  const batchManagement = metrics?.batchManagement;
  const promos = metrics?.promos;
  const catalog = metrics?.catalog;

  return (
    <RequirePermission permission="dashboard:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Dashboard"
          description="What needs you right now, money in, and stock — every number is read live from the admin API."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={() => {
                refresh();
                void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
              }}
            />
          }
        />

        <AttentionPanel />
        <TaxiRevenuePanel />

        {userErrorMessage && !metrics ? (
          <AdminPanel
            title="Stock & catalog"
            subtitle="QR sticker batches, plan shelves and promos."
          >
            <AlErrorState
              message={userErrorMessage}
              onRetry={() => {
                refresh();
              }}
            />
          </AdminPanel>
        ) : isLoading || !metrics || !inventory || !batchManagement || !promos ? (
          <div className="dashboard-page-grid dashboard-page-grid--loading">
            {Array.from({ length: 6 }, (_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <AdminPanel
              title="Stock & catalog"
              subtitle="QR sticker batches, plan shelves and promos."
            >
              <div className="dashboard-page-grid">
                <DashboardPageCard
                  testId="dashboard-card-qr"
                  title="QR stickers"
                  description={
                    inventory.capped
                      ? 'Newest 100 batches — load the rest on the Batches page'
                      : 'Stock and batch lifecycle'
                  }
                  icon={<ScanLineIcon size={18} aria-hidden />}
                  primaryValue={cappedCount(inventory.totalBatches, inventory.capped)}
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
                      value: cappedCount(promos.totalPromos, promos.capped),
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
              </div>
            </AdminPanel>

            <AdminPanel title="Jump to" subtitle="Common operator destinations.">
              <div className="dashboard-page-grid">
                <DashboardLinkCard
                  title="Activity log"
                  description="Administrative actions, searchable"
                  icon={<ReceiptTextIcon size={18} aria-hidden />}
                  onClick={() => {
                    void navigate(adminPaths.auditEvents);
                  }}
                />
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
