import type { ReactNode } from 'react';
import { ActivityIcon, CameraIcon, CarIcon, ShieldCheckIcon, UsersIcon } from '@autolokate/icons';
import { AlPageHeader, AlPageHeaderAction, AlStack, AlText } from '@autolokate/ui';
import { useNavigate } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { formatCount } from '@/features/discovery/discovery-filters';
import {
  useDiscoveryOverview,
  type DiscoveryOverviewCounts,
} from '@/hooks/discovery/useDiscoveryOverview';
import { MetricSkeleton } from '@/platform/components/MetricSkeleton';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import '@/features/dashboard/dashboard.css';
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
    <button type="button" className="dashboard-page-card" data-testid={testId} onClick={onClick}>
      <div className="dashboard-page-card__head">
        <div className="dashboard-page-card__icon">{icon}</div>
        <div className="dashboard-page-card__titles">
          <span className="dashboard-page-card__title">{title}</span>
          <span className="dashboard-page-card__description">{description}</span>
        </div>
      </div>

      {errorMessage ? (
        <p className="discovery-card-error" role="alert">
          {errorMessage}
        </p>
      ) : (
        <>
          <div className="dashboard-page-card__hero">
            <span className="dashboard-page-card__hero-value">{primaryValue}</span>
            <span className="dashboard-page-card__hero-label">{primaryLabel}</span>
          </div>
          {stats && stats.length > 0 ? (
            <div className="dashboard-page-card__tiles">
              {stats.map((stat) => (
                <div key={stat.label} className="dashboard-page-card__tile">
                  <span className="dashboard-page-card__tile-value">{stat.value}</span>
                  <span className="dashboard-page-card__tile-label">{stat.label}</span>
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
      className="dashboard-page-card dashboard-page-card--link"
      data-testid={testId}
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

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="lg">
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
          <div className="dashboard-page-grid dashboard-page-grid--loading">
            {Array.from({ length: 4 }, (_, index) => (
              <MetricSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="dashboard-page-grid">
            <OverviewCard
              title="Q&A"
              description="Community questions"
              icon={<UsersIcon size={20} aria-hidden />}
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
              icon={<CameraIcon size={20} aria-hidden />}
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
              icon={<CarIcon size={20} aria-hidden />}
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
              icon={<ActivityIcon size={20} aria-hidden />}
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

        {engagement && !overview.reelsError ? (
          <AlText tone="muted" variant="caption" data-testid="discovery-overview-engagement-note">
            Reels engagement: {formatCount(engagement.views)} views ·{' '}
            {formatCount(engagement.likes)} likes · {formatCount(engagement.comments)} comments ·{' '}
            {formatCount(engagement.saves)} saves.
          </AlText>
        ) : null}

        <AlStack gap="sm">
          <AlText variant="label">Related</AlText>
          <div className="dashboard-page-grid">
            <OverviewLinkCard
              title="Q&A replies"
              description="Moderate member replies"
              icon={<UsersIcon size={20} aria-hidden />}
              testId="discovery-overview-replies"
              onClick={() => {
                void navigate(adminPaths.discoveryReplies);
              }}
            />
            <OverviewLinkCard
              title="Coverage"
              description="Subscriptions live under Customer Care"
              icon={<ShieldCheckIcon size={20} aria-hidden />}
              testId="discovery-overview-subscriptions"
              onClick={() => {
                void navigate(adminPaths.subscriptions);
              }}
            />
          </div>
        </AlStack>
      </AlStack>
    </RequirePermission>
  );
}
