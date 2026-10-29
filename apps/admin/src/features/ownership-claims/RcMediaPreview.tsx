import { AlText } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { shortAdminId } from '@/platform/components/AdminWowSurface';
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
 * Prefers the claim RC-proof download URL. On failure show a short asset ref —
 * never dump full ids as the primary message.
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
        Loading registration document…
      </p>
    );
  }

  if (query.isError || !query.data?.url) {
    const apiMessage = query.error ? mapAdminApiError(query.error).userMessage : null;
    return (
      <div data-testid="ownership-claim-rc-unavailable">
        <p className="admin-muted" data-testid="ownership-claim-rc-blocker">
          Preview unavailable for this claim
          {apiMessage ? ` — ${apiMessage}` : ''}.
        </p>
        <AlText variant="caption" tone="muted">
          Document ref{' '}
          <span
            className="admin-detail-field__value--mono"
            data-testid="ownership-claim-rc-asset-id"
            title={rcMediaAssetId}
          >
            {shortAdminId(rcMediaAssetId)}
          </span>
        </AlText>
      </div>
    );
  }

  return (
    <div className="ownership-claim-rc-preview" data-testid="ownership-claim-rc-preview">
      <AlText variant="caption" tone="muted">
        Document ref{' '}
        <span
          className="admin-detail-field__value--mono"
          data-testid="ownership-claim-rc-asset-id"
          title={rcMediaAssetId}
        >
          {shortAdminId(rcMediaAssetId)}
        </span>
      </AlText>
      {kind === 'pdf' ? (
        <iframe
          title="Registration document PDF"
          src={query.data.url}
          className="ownership-claim-rc-preview__frame"
          data-testid="ownership-claim-rc-pdf"
        />
      ) : (
        <img
          src={query.data.url}
          alt="Registration proof document"
          className="ownership-claim-rc-preview__img"
          data-testid="ownership-claim-rc-image"
        />
      )}
      <p className="admin-muted">
        <a href={query.data.url} target="_blank" rel="noreferrer">
          Open in new tab
        </a>{' '}
        (link expires in ~{query.data.expiresInSeconds}s)
      </p>
    </div>
  );
}
