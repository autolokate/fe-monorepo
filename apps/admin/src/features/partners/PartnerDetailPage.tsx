import {
  AlBreadcrumb,
  AlButton,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
} from '@autolokate/ui';
import { useNavigate, useParams } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths';
import { PartnerReelsSection } from '@/features/partners/PartnerReelsSection';
import { formatPartnersDateTime, shortId } from '@/features/partners/partners-filters';
import { useGarageEntitlementMutations } from '@/hooks/garage/useGarageEntitlementMutations';
import { usePartnerDetail } from '@/hooks/partners/usePartnerDetail';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './partners.css';

function humanLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function storeChipClass(status: string | null | undefined): string {
  if (status === 'PUBLISHED') return 'admin-status-chip admin-status-chip--published';
  if (status === 'DRAFT') return 'admin-status-chip admin-status-chip--draft';
  return 'admin-status-chip admin-status-chip--neutral';
}

function DetailField({
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

export function PartnerDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const canWrite = useAdminPermission('partners:write');
  const { partner, isLoading, isFetching, userErrorMessage, refresh } = usePartnerDetail(orgId);
  const { publishStoreMutation, mapMutationError } = useGarageEntitlementMutations();

  if (userErrorMessage && !partner) {
    return (
      <RequirePermission permission="partners:read">
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      </RequirePermission>
    );
  }

  if (isLoading || !partner) {
    return (
      <RequirePermission permission="partners:read">
        <AdminPageLoader label="Loading partner…" />
      </RequirePermission>
    );
  }

  const canPublishStore =
    canWrite &&
    Boolean(partner.storeId) &&
    partner.storeStatus !== 'PUBLISHED' &&
    (partner.partnerKind === 'GARAGE' || partner.partnerKind === 'STORE');

  const publishError = publishStoreMutation.isError
    ? mapMutationError(publishStoreMutation.error).userMessage
    : null;

  const pageDescription = partner.storeStatus
    ? `${humanLabel(partner.partnerKind)} · Store ${humanLabel(partner.storeStatus)}`
    : humanLabel(partner.partnerKind);

  return (
    <RequirePermission permission="partners:read">
      <AlStack gap="md">
        <AlPageHeader
          title={partner.name}
          description={pageDescription}
          breadcrumbs={
            <AlBreadcrumb
              items={[
                {
                  label: 'Partners',
                  onClick: () => {
                    void navigate(adminPaths.partners);
                  },
                },
                { label: partner.name, current: true },
              ]}
            />
          }
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        <section className="admin-panel" data-testid="partners-detail-summary">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Overview</h2>
              <p className="admin-panel__subtitle">Organization and storefront details.</p>
            </div>
            <div className="admin-panel__meta">
              <span className="admin-status-chip admin-status-chip--neutral">
                {humanLabel(partner.partnerKind)}
              </span>
              {partner.storeStatus ? (
                <span className={storeChipClass(partner.storeStatus)}>
                  {humanLabel(partner.storeStatus)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="admin-detail-card-grid">
            <DetailField label="Organization" value={shortId(partner.orgId)} mono />
            <DetailField label="Partner kind" value={humanLabel(partner.partnerKind)} />
            <DetailField
              label="Org kind"
              value={partner.orgKind ? humanLabel(partner.orgKind) : '—'}
            />
            <DetailField label="Owner account" value={shortId(partner.ownerAccountId)} mono />
            <DetailField label="Created" value={formatPartnersDateTime(partner.createdAt)} />
            <DetailField
              label="Store"
              value={partner.storeId ? shortId(partner.storeId) : '—'}
              mono={Boolean(partner.storeId)}
            />
            <DetailField label="Store name" value={partner.storeName ?? '—'} />
            <DetailField
              label="Store status"
              value={partner.storeStatus ? humanLabel(partner.storeStatus) : '—'}
            />
            <DetailField
              label="Cities"
              value={partner.cities?.length ? partner.cities.join(', ') : '—'}
            />
          </div>
        </section>

        <section className="admin-panel" data-testid="partners-detail-ops">
          <div className="admin-panel__header">
            <div>
              <h2 className="admin-panel__title">Actions</h2>
              <p className="admin-panel__subtitle">Publish storefront or jump to related ops.</p>
            </div>
          </div>
          <div className="partners-links">
            {canPublishStore ? (
              <AlButton
                variant="primary"
                size="sm"
                data-testid="partners-publish-store"
                loading={publishStoreMutation.isPending}
                onClick={() => {
                  publishStoreMutation.mutate(
                    { orgId: partner.orgId },
                    {
                      onSuccess: () => {
                        refresh();
                      },
                    },
                  );
                }}
              >
                Publish store
              </AlButton>
            ) : null}
            <AlButton
              variant="secondary"
              size="sm"
              onClick={() => {
                void navigate(adminPaths.garageCommercial);
              }}
            >
              Garage commercial
            </AlButton>
            <AlButton
              variant="secondary"
              size="sm"
              onClick={() => {
                void navigate(adminPaths.taxiPolicy);
              }}
            >
              Taxi policy
            </AlButton>
            <AlButton
              variant="secondary"
              size="sm"
              onClick={() => {
                void navigate(adminPaths.partnersRequests);
              }}
            >
              Requests & bids
            </AlButton>
          </div>
          {publishError ? (
            <AlText tone="muted" role="alert">
              {publishError}
            </AlText>
          ) : null}
          {partner.storeStatus === 'PUBLISHED' ? (
            <AlText tone="muted" variant="caption">
              Storefront is live for Nearby and bidding.
            </AlText>
          ) : null}
        </section>

        <PartnerReelsSection reels={partner.reels} />
      </AlStack>
    </RequirePermission>
  );
}
