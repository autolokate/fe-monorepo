import { AlText } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchRcClaimProofDownloadUrl } from '@/services/ownership-claims/ownership-claims-service';

export type RcMediaPreviewProps = {
  claimId: string;
  rcMediaAssetId: string;
};

function inferPreviewKind(url: string): 'pdf' | 'image' {
  const lower = url.toLowerCase();
  if (lower.includes('.pdf') || lower.includes('application/pdf')) {
    return 'pdf';
  }
  return 'image';
}

/**
 * Prefers `GET /admin/v1/ownership-claims/{claimId}/rc-proof` (OPERATOR).
 * On 403/404 (or any fetch failure) show asset id + honest ACL / endpoint blocker — never a fake image.
 */
export function RcMediaPreview({ claimId, rcMediaAssetId }: RcMediaPreviewProps) {
  const query = useQuery({
    queryKey: ['admin', 'ownership-claims', 'rc-proof', claimId],
    queryFn: ({ signal }) => fetchRcClaimProofDownloadUrl(claimId, signal),
    enabled: Boolean(claimId),
    retry: false,
    staleTime: 60_000,
  });

  const kind = useMemo(
    () => (query.data?.url ? inferPreviewKind(query.data.url) : null),
    [query.data?.url],
  );

  if (query.isLoading) {
    return (
      <p className="admin-muted" data-testid="ownership-claim-rc-loading">
        Loading RC document preview…
      </p>
    );
  }

  if (query.isError || !query.data?.url) {
    const apiMessage = query.error ? mapAdminApiError(query.error).userMessage : null;
    return (
      <div data-testid="ownership-claim-rc-unavailable">
        <AlText variant="caption" tone="muted">
          RC media asset id
        </AlText>
        <p className="admin-detail-field__value--mono" data-testid="ownership-claim-rc-asset-id">
          {rcMediaAssetId}
        </p>
        <p className="admin-muted" data-testid="ownership-claim-rc-blocker">
          Preview unavailable — Admin RC-proof download returned no signed URL (endpoint missing or
          ACL denied for this claim)
          {apiMessage ? ` (${apiMessage})` : ''}. Claim id{' '}
          <span className="admin-detail-field__value--mono">{claimId}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="ownership-claim-rc-preview" data-testid="ownership-claim-rc-preview">
      <p className="admin-muted">
        RC media asset id:{' '}
        <span className="admin-detail-field__value--mono" data-testid="ownership-claim-rc-asset-id">
          {rcMediaAssetId}
        </span>
      </p>
      {kind === 'pdf' ? (
        <iframe
          title="RC document PDF"
          src={query.data.url}
          className="ownership-claim-rc-preview__frame"
          data-testid="ownership-claim-rc-pdf"
        />
      ) : (
        <img
          src={query.data.url}
          alt="RC proof document"
          className="ownership-claim-rc-preview__img"
          data-testid="ownership-claim-rc-image"
        />
      )}
      <p className="admin-muted">
        <a href={query.data.url} target="_blank" rel="noreferrer">
          Open signed URL in new tab
        </a>{' '}
        (expires in ~{query.data.expiresInSeconds}s)
      </p>
    </div>
  );
}
