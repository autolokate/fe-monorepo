import { AlText } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { fetchRcMediaDownloadUrl } from '@/services/ownership-claims/ownership-claims-service';

export type RcMediaPreviewProps = {
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
 * Attempts `GET /v1/media/{id}` with the Admin token. Customer RC assets are owner-scoped,
 * so Admin often gets 403/404 — show asset id + honest ACL blocker, never a fake image.
 */
export function RcMediaPreview({ rcMediaAssetId }: RcMediaPreviewProps) {
  const query = useQuery({
    queryKey: ['admin', 'ownership-claims', 'rc-media', rcMediaAssetId],
    queryFn: ({ signal }) => fetchRcMediaDownloadUrl(rcMediaAssetId, signal),
    enabled: Boolean(rcMediaAssetId),
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
          Preview unavailable until media ACL allows Admin to fetch claimant-owned RC proof
          {apiMessage ? ` (${apiMessage})` : ''}. Use the asset id above with a privileged media
          path when one exists.
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
