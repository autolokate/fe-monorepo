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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="partners-detail-field">
      <span className="partners-detail-field__label">{label}</span>
      <span className="partners-detail-field__value">{value}</span>
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

  return (
    <RequirePermission permission="partners:read">
      <AlStack gap="md">
        <AlPageHeader
          title={partner.name}
          description={`${partner.partnerKind}${partner.storeStatus ? ` · store ${partner.storeStatus}` : ''}`}
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

        <section className="partners-section" data-testid="partners-detail-summary">
          <h2 className="partners-section__heading">Org summary</h2>
          <div className="partners-detail-grid">
            <DetailField label="Org ID" value={partner.orgId} />
            <DetailField label="Partner kind" value={partner.partnerKind} />
            <DetailField label="Org kind" value={partner.orgKind ?? '—'} />
            <DetailField label="Owner account" value={shortId(partner.ownerAccountId)} />
            <DetailField label="Created" value={formatPartnersDateTime(partner.createdAt)} />
            <DetailField label="Store ID" value={partner.storeId ?? '—'} />
            <DetailField label="Store name" value={partner.storeName ?? '—'} />
            <DetailField label="Store status" value={partner.storeStatus ?? '—'} />
            <DetailField
              label="Cities"
              value={partner.cities?.length ? partner.cities.join(', ') : '—'}
            />
          </div>
          <AlText tone="muted" variant="caption">
            Server fields only — no client-side KYC status.
          </AlText>
        </section>

        <section className="partners-section" data-testid="partners-detail-ops">
          <h2 className="partners-section__heading">Live Nest actions</h2>
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
              Garage commercial / entitlement
            </AlButton>
            <AlButton
              variant="secondary"
              size="sm"
              onClick={() => {
                void navigate(adminPaths.taxiPolicy);
              }}
            >
              Taxi policy / provision
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
              Storefront already published for Nearby / bidding.
            </AlText>
          ) : null}
        </section>

        <PartnerReelsSection reels={partner.reels} />
      </AlStack>
    </RequirePermission>
  );
}
