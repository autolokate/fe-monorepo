import { AlButton, AlText } from '@autolokate/ui';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { shortAdminId } from '@/platform/components/AdminWowSurface';
import { fetchRcClaimProofDownloadUrl } from '@/services/ownership-claims/ownership-claims-service';

export type RcMediaPreviewProps = {
  claimId: string;
  rcMediaAssetId: string;
  /** Called with true once the signed RC is on screen, false while it is not. */
  onViewedChange?: (viewed: boolean) => void;
};

function inferPreviewKind(url: string): 'pdf' | 'image' {
  const lower = url.toLowerCase();
  if (lower.includes('.pdf') || lower.includes('application/pdf')) {
    return 'pdf';
  }
  return 'image';
}

/**
 * The claim RC, inline only. The signed URL lives 300 s and every fetch is audited
 * (RCRECORD_ACCESS), so it is never cached across opens, never offered as a new-tab link (it would
 * land in browser history) and never sent as a referrer (ADM-OWN-08).
 */
export function RcMediaPreview({ claimId, rcMediaAssetId, onViewedChange }: RcMediaPreviewProps) {
  const query = useQuery({
    queryKey: ['admin', 'ownership-claims', 'rc-proof', claimId],
    queryFn: ({ signal }) => fetchRcClaimProofDownloadUrl(claimId, signal),
    enabled: Boolean(claimId),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const url = query.data?.url ?? null;
  const kind = useMemo(() => (url ? inferPreviewKind(url) : null), [url]);
  const viewed = Boolean(url) && !query.isError;

  useEffect(() => {
    onViewedChange?.(viewed);
  }, [onViewedChange, viewed]);

  const assetRef = (
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
  );

  if (query.isLoading) {
    return (
      <p className="admin-muted" data-testid="ownership-claim-rc-loading">
        Loading registration document…
      </p>
    );
  }

  if (query.isError || !url) {
    const apiMessage = query.error ? mapAdminApiError(query.error).userMessage : null;
    return (
      <div data-testid="ownership-claim-rc-unavailable">
        <p className="admin-muted" data-testid="ownership-claim-rc-blocker">
          Preview unavailable for this claim
          {apiMessage ? ` — ${apiMessage}` : ''}. Approve stays disabled until the RC can be viewed.
        </p>
        {assetRef}
      </div>
    );
  }

  return (
    <div className="ownership-claim-rc-preview" data-testid="ownership-claim-rc-preview">
      {assetRef}
      {kind === 'pdf' ? (
        <iframe
          title="Registration document PDF"
          src={url}
          referrerPolicy="no-referrer"
          className="ownership-claim-rc-preview__frame"
          data-testid="ownership-claim-rc-pdf"
        />
      ) : (
        <img
          src={url}
          alt="Registration proof document"
          referrerPolicy="no-referrer"
          className="ownership-claim-rc-preview__img"
          data-testid="ownership-claim-rc-image"
        />
      )}
      <div className="ownership-claim-rc-preview__foot">
        <AlText variant="caption" tone="muted">
          Secure link, valid about {String(query.data?.expiresInSeconds ?? 300)} s. Each view is
          logged.
        </AlText>
        <AlButton
          size="sm"
          variant="secondary"
          loading={query.isFetching}
          disabled={query.isFetching}
          data-testid="ownership-claim-rc-reload"
          onClick={() => {
            void query.refetch();
          }}
        >
          Reload document
        </AlButton>
      </div>
    </div>
  );
}
