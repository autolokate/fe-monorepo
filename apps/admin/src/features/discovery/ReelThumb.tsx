import type { AdminDiscoveryReelDto } from '@autolokate/api-client';

import { useDiscoveryReelDetail } from '@/hooks/discovery/useDiscoveryReels';

export type ReelThumbProps = {
  reel: AdminDiscoveryReelDto;
  size?: 'sm' | 'lg';
};

/**
 * Admin list rows carry `thumbUrl: null`; only the detail read signs the poster. Fetch it per row (cached
 * for the signed-URL lifetime) and fall back to a labelled placeholder — never a fake image.
 */
export function ReelThumb({ reel, size = 'sm' }: ReelThumbProps) {
  const needsDetail = reel.thumbUrl === null && reel.thumbMediaId !== null;
  const detail = useDiscoveryReelDetail(reel.reelId, needsDetail);
  const src = reel.thumbUrl ?? detail.data?.thumbUrl ?? null;

  return (
    <div
      className={`discovery-thumb discovery-thumb--${size}`}
      data-testid={`reel-thumb-${reel.reelId}`}
    >
      {src ? (
        <img src={src} alt={`Poster for ${reel.title}`} loading="lazy" />
      ) : (
        <span className="discovery-thumb__placeholder">
          {detail.isLoading ? '…' : reel.thumbMediaId ? 'No preview' : 'No poster'}
        </span>
      )}
    </div>
  );
}
