import type { ReactNode } from 'react';
import {
  ActivityIcon,
  CameraIcon,
  CarIcon,
  ShieldCheckIcon,
  StoreIcon,
  UsersIcon,
} from '@autolokate/icons';
import { AlPageHeader, AlPageHeaderAction, AlStack, AlText } from '@autolokate/ui';
import { useNavigate } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { formatCount } from '@/features/discovery/discovery-filters';
import {
  useDiscoveryOverview,
  type DiscoveryOverviewCounts,
} from '@/hooks/discovery/useDiscoveryOverview';
import { MetricSkeleton } from '@/platform/components/MetricSkeleton';
import { AdminKpiStrip, AdminPanel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './discovery.css';

type OverviewCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  primaryValue: string;
  primaryLabel: string;
  stats?: { label: string; value: string }[];
  errorMessage?: string | null;
  testId: string;
  onClick: () => void;
};

function OverviewCard({
  title,
  description,
  icon,
  primaryValue,
  primaryLabel,
  stats,
  errorMessage,
  testId,
  onClick,
}: OverviewCardProps) {
  return (
    <button
      type="button"
      className="admin-panel discovery-overview-card"
      data-testid={testId}
      onClick={onClick}
    >
      <header className="admin-panel__header">
        <div className="discovery-overview-card__titles">
          <span className="discovery-overview-card__icon" aria-hidden>
            {icon}
          </span>
          <div>
            <h2 className="admin-panel__title">{title}</h2>
            <p className="admin-panel__subtitle">{description}</p>
          </div>
        </div>
      </header>

      {errorMessage ? (
        <p className="discovery-card-error" role="alert">
          {errorMessage}
        </p>
      ) : (
        <>
          <div className="admin-kpi discovery-overview-card__hero">
            <span className="admin-kpi__value">{primaryValue}</span>
            <span className="admin-kpi__label">{primaryLabel}</span>
          </div>
          {stats && stats.length > 0 ? (
            <div className="admin-kpi-strip discovery-overview-card__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="admin-kpi">
                  <span className="admin-kpi__value">{stat.value}</span>
                  <span className="admin-kpi__label">{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </button>
  );
}

type OverviewLinkCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  testId: string;
  onClick: () => void;
};

function OverviewLinkCard({ title, description, icon, testId, onClick }: OverviewLinkCardProps) {
  return (
    <button
      type="button"
      className="admin-panel discovery-overview-card discovery-overview-card--link"
      data-testid={testId}
      onClick={onClick}
    >
      <header className="admin-panel__header">
        <div className="discovery-overview-card__titles">
          <span className="discovery-overview-card__icon" aria-hidden>
            {icon}
          </span>
          <div>
            <h2 className="admin-panel__title">{title}</h2>
            <p className="admin-panel__subtitle">{description}</p>
          </div>
        </div>
      </header>
    </button>
  );
}

function countValue(
  counts: DiscoveryOverviewCounts | null,
  pick: (c: DiscoveryOverviewCounts) => number,
): string {
  if (!counts) {
    return '…';
  }
  return `${formatCount(pick(counts))}${counts.capped ? '+' : ''}`;
}

export function DiscoveryOverviewPage() {
  const navigate = useNavigate();
  const overview = useDiscoveryOverview();
  const { questions, reels, dailyDrive, academy, engagement } = overview;

  const engagementItems =
    engagement && !overview.reelsError
      ? [
          { label: 'Views', value: formatCount(engagement.views) },
          { label: 'Likes', value: formatCount(engagement.likes) },
          { label: 'Comments', value: formatCount(engagement.comments) },
          { label: 'Saves', value: formatCount(engagement.saves) },
        ]
      : [];

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Discovery"
          description="Editorial surfaces in the consumer Discovery tab."
          actions={
            <AlPageHeaderAction
              label={overview.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={overview.isFetching}
              variant="secondary"
              onClick={overview.refresh}
            />
          }
        />

        {overview.isLoading ? (
          <div className="discovery-overview-grid discovery-overview-grid--loading">
            {Array.from({ length: 4 }, (_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="discovery-overview-grid">
            <OverviewCard
              title="Q&A"
              description="Community questions"
              icon={<UsersIcon size={18} aria-hidden />}
              primaryValue={countValue(questions, (c) => c.total)}
              primaryLabel="questions"
              stats={[
                { label: 'Published', value: countValue(questions, (c) => c.published) },
                { label: 'Hidden', value: countValue(questions, (c) => c.unpublished) },
              ]}
              errorMessage={overview.questionsError}
              testId="discovery-overview-qa"
              onClick={() => {
                void navigate(adminPaths.discoveryQa);
              }}
            />
            <OverviewCard
              title="Reels"
              description="Short videos in the feed"
              icon={<CameraIcon size={18} aria-hidden />}
              primaryValue={countValue(reels, (c) => c.total)}
              primaryLabel="reels"
              stats={[
                { label: 'Published', value: countValue(reels, (c) => c.published) },
                { label: 'Draft', value: countValue(reels, (c) => c.unpublished) },
                { label: 'Archived', value: countValue(reels, (c) => c.archived) },
              ]}
              errorMessage={overview.reelsError}
              testId="discovery-overview-reels"
              onClick={() => {
                void navigate(adminPaths.discoveryReels);
              }}
            />
            <OverviewCard
              title="Daily Drive"
              description="IDG YouTube catalogue"
              icon={<CarIcon size={18} aria-hidden />}
              primaryValue={countValue(dailyDrive, (c) => c.total)}
              primaryLabel="videos"
              stats={[
                { label: 'Published', value: countValue(dailyDrive, (c) => c.published) },
                { label: 'Draft', value: countValue(dailyDrive, (c) => c.unpublished) },
              ]}
              errorMessage={overview.dailyDriveError}
              testId="discovery-overview-daily-drive"
              onClick={() => {
                void navigate(adminPaths.discoveryDailyDrive);
              }}
            />
            <OverviewCard
              title="Academy"
              description="Member courses and lessons"
              icon={<ActivityIcon size={18} aria-hidden />}
              primaryValue={countValue(academy, (c) => c.total)}
              primaryLabel="courses"
              stats={[
                { label: 'Published', value: countValue(academy, (c) => c.published) },
                { label: 'Draft', value: countValue(academy, (c) => c.unpublished) },
              ]}
              errorMessage={overview.academyError}
              testId="discovery-overview-academy"
              onClick={() => {
                void navigate(adminPaths.discoveryAcademy);
              }}
            />
          </div>
        )}

        {engagementItems.length > 0 ? (
          <div data-testid="discovery-overview-engagement">
            <AdminPanel
              title="Reels engagement"
              subtitle="Totals across Discovery reels on this environment."
            >
              <AdminKpiStrip items={engagementItems} />
              <AlText tone="muted" variant="caption">
                Open Reels to publish, unpublish, or archive individual clips.
              </AlText>
            </AdminPanel>
          </div>
        ) : null}

        <AdminPanel title="Related" subtitle="Moderation and coverage shortcuts.">
          <div className="discovery-overview-grid">
            <OverviewLinkCard
              title="Q&A replies"
              description="Moderate member replies"
              icon={<UsersIcon size={18} aria-hidden />}
              testId="discovery-overview-replies"
              onClick={() => {
                void navigate(adminPaths.discoveryReplies);
              }}
            />
            <OverviewLinkCard
              title="Catalog"
              description="Plan versions and SKU shelves"
              icon={<StoreIcon size={18} aria-hidden />}
              testId="discovery-overview-catalog"
              onClick={() => {
                void navigate(adminPaths.catalog);
              }}
            />
            <OverviewLinkCard
              title="Coverage"
              description="Subscriptions live under Customer Care"
              icon={<ShieldCheckIcon size={18} aria-hidden />}
              testId="discovery-overview-subscriptions"
              onClick={() => {
                void navigate(adminPaths.subscriptions);
              }}
            />
          </div>
        </AdminPanel>
      </AlStack>
    </RequirePermission>
  );
}
