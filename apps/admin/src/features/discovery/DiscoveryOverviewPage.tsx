import type { ReactNode } from 'react';
import { CameraIcon, ShieldCheckIcon, StoreIcon, UsersIcon } from '@autolokate/icons';
import { AlPageHeader, AlPageHeaderAction, AlStack, AlText } from '@autolokate/ui';
import { useNavigate } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { formatCount } from '@/features/discovery/discovery-filters';
import {
  useDiscoveryOverview,
  type DiscoveryOverviewCounts,
} from '@/hooks/discovery/useDiscoveryOverview';
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
  cta: string;
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
  cta,
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

      <span className="dashboard-page-card__cta">{cta}</span>
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
  const { questions, reels, engagement } = overview;

  return (
    <RequirePermission permission="discovery:read">
      <AlStack gap="lg">
        <AlPageHeader
          title="Discovery"
          description="Editorial content shown in the consumer Discovery tab — Q&A and reels — plus the plans and coverage it sells."
          actions={
            <AlPageHeaderAction
              label={overview.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={overview.isFetching}
              variant="secondary"
              onClick={overview.refresh}
            />
          }
        />

        <div className="dashboard-page-grid">
          <OverviewCard
            title="Q&A"
            description="Community questions and answers"
            icon={<UsersIcon size={20} aria-hidden />}
            primaryValue={countValue(questions, (c) => c.total)}
            primaryLabel="questions"
            stats={[
              { label: 'Published', value: countValue(questions, (c) => c.published) },
              { label: 'Hidden', value: countValue(questions, (c) => c.unpublished) },
            ]}
            errorMessage={overview.questionsError}
            cta="Manage Q&A"
            testId="discovery-overview-qa"
            onClick={() => {
              void navigate(adminPaths.discoveryQa);
            }}
          />
          <OverviewCard
            title="Reels"
            description="Short videos in the Discovery feed"
            icon={<CameraIcon size={20} aria-hidden />}
            primaryValue={countValue(reels, (c) => c.total)}
            primaryLabel="reels"
            stats={[
              { label: 'Published', value: countValue(reels, (c) => c.published) },
              { label: 'Draft', value: countValue(reels, (c) => c.unpublished) },
              { label: 'Archived', value: countValue(reels, (c) => c.archived) },
            ]}
            errorMessage={overview.reelsError}
            cta="Manage reels"
            testId="discovery-overview-reels"
            onClick={() => {
              void navigate(adminPaths.discoveryReels);
            }}
          />
          <OverviewCard
            title="Reel engagement"
            description="Across loaded reels"
            icon={<CameraIcon size={20} aria-hidden />}
            primaryValue={engagement ? formatCount(engagement.views) : '…'}
            primaryLabel="views"
            stats={
              engagement
                ? [
                    { label: 'Likes', value: formatCount(engagement.likes) },
                    { label: 'Comments', value: formatCount(engagement.comments) },
                    { label: 'Saves', value: formatCount(engagement.saves) },
                  ]
                : undefined
            }
            errorMessage={overview.reelsError}
            cta="Open reels"
            testId="discovery-overview-engagement"
            onClick={() => {
              void navigate(adminPaths.discoveryReels);
            }}
          />
        </div>

        <AlStack gap="sm">
          <AlText variant="label">Plans and coverage</AlText>
          <AlText tone="muted" variant="caption">
            Read-through links to the existing Catalog and Coverage consoles — plans and
            subscriptions are managed there, not here.
          </AlText>
        </AlStack>
        <div className="dashboard-page-grid">
          <OverviewCard
            title="Catalog"
            description="Plan versions and SKU shelves"
            icon={<StoreIcon size={20} aria-hidden />}
            primaryValue={overview.livePlans === null ? '…' : formatCount(overview.livePlans)}
            primaryLabel="live plans"
            stats={
              overview.planVersions === null
                ? undefined
                : [{ label: 'Plan versions', value: formatCount(overview.planVersions) }]
            }
            errorMessage={overview.plansError ? 'Unable to load plans.' : null}
            cta="Open catalog"
            testId="discovery-overview-catalog"
            onClick={() => {
              void navigate(adminPaths.catalog);
            }}
          />
          <OverviewCard
            title="Coverage"
            description="Active protection per vehicle"
            icon={<ShieldCheckIcon size={20} aria-hidden />}
            primaryValue="Subscriptions"
            primaryLabel="view and filter by status"
            cta="Open coverage"
            testId="discovery-overview-subscriptions"
            onClick={() => {
              void navigate(adminPaths.subscriptions);
            }}
          />
        </div>
      </AlStack>
    </RequirePermission>
  );
}
