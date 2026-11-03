import type { AdminGarageRequestPhotoDto, AdminSourceClipDto } from '@autolokate/api-client';

import { TaxiDriverIdentity } from '@/features/taxi/TaxiDriverIdentity';
import { useTaxiFleetVehicle } from '@/hooks/taxi/useTaxiFleet';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

/** "Quote from a clip" — the preview frozen at request create (thumbnail signed at read). */
export function SourceClipCard({ clip }: { clip: AdminSourceClipDto }) {
  return (
    <div className="partners-clip-card" data-testid="partners-source-clip">
      <div className="partners-clip-card__thumb">
        {clip.thumbnailUrl ? (
          <img src={clip.thumbnailUrl} alt={`Clip: ${clip.title}`} loading="lazy" />
        ) : (
          <span>{clip.mediaKind === 'VIDEO' ? 'Video' : 'Image'}</span>
        )}
      </div>
      <div className="partners-clip-card__body">
        <span className="partners-clip-card__eyebrow">
          From a {clip.mediaKind === 'VIDEO' ? 'video' : 'image'} clip by{' '}
          {clip.authorDisplayName ?? humanizeAdminLabel(clip.authorType)} (
          {humanizeAdminLabel(clip.authorType)})
        </span>
        <span className="partners-clip-card__title">{clip.title}</span>
        {clip.captionExcerpt ? (
          <span className="partners-clip-card__caption">{clip.captionExcerpt}</span>
        ) : null}
        <span className="partners-clip-card__meta">
          Snapshot {formatAdminDateTime(clip.snapshotAt)}
        </span>
      </div>
    </div>
  );
}

/** Customer photos on a garage / store request (signed URLs; refetch the request after expiry). */
export function RequestPhotoGrid({ photos }: { photos: AdminGarageRequestPhotoDto[] }) {
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);
  const expiry = sorted[0]?.urlExpiresInSeconds;
  return (
    <div>
      <div className="partners-photo-grid" data-testid="partners-request-photos">
        {sorted.map((photo, index) => (
          <a
            key={photo.id}
            className="partners-photo-grid__item"
            href={photo.url}
            target="_blank"
            rel="noreferrer noopener"
            title="Open full size"
          >
            <img src={photo.url} alt={`Customer upload ${String(index + 1)}`} loading="lazy" />
          </a>
        ))}
      </div>
      <p className="partners-photo-grid__note">
        Links are signed{typeof expiry === 'number' ? ` for ${String(expiry)} s` : ''} — reopen the
        request to refresh them. Photos are purged 30 days after the request stops taking bids.
      </p>
    </div>
  );
}

/**
 * Driver identity for a taxi bid. `bid.vehicleId` is the taxi fleet vehicle, so this reads the
 * fleet card's CURRENT driver (it may have changed since the bid was placed).
 */
export function TaxiBidDriverCell({ vehicleId }: { vehicleId: string }) {
  const { vehicle, isLoading, notFound, userErrorMessage } = useTaxiFleetVehicle(vehicleId);
  if (isLoading) return <span className="partners-cell-title__secondary">Loading…</span>;
  if (notFound) return <span className="partners-cell-title__secondary">Vehicle not found</span>;
  if (userErrorMessage || !vehicle) {
    return <span className="partners-cell-title__secondary">Unavailable</span>;
  }
  return (
    <div className="partners-cell-title" data-testid={`taxi-bid-driver-${vehicleId}`}>
      <TaxiDriverIdentity driver={vehicle.driver} compact />
      <span className="partners-cell-title__secondary">
        {vehicle.registration} · current driver of the bid vehicle
      </span>
    </div>
  );
}
