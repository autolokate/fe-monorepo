import type { CSSProperties } from 'react';

import { cn } from '../../../utils/cn';
import { RetakeIcon } from '../../icons/RetakeIcon';
import { AlScenePhotoCard } from '../ScenePhotoCard/ScenePhotoCard';

import type { AlPhotoGridProps } from './PhotoGrid.types';
import type { AlPhotoGridReviewPhoto } from './PhotoGrid.types';
import './PhotoGrid.css';

function ReviewPhotoTile({ photo, index = 0 }: { photo: AlPhotoGridReviewPhoto; index?: number }) {
  const retakeLabel = photo.retakeLabel ?? 'Retake photo';

  return (
    <div
      className="al-photo-grid__review-photo"
      style={{ '--photo-index': index } as CSSProperties}
    >
      <span className="al-photo-grid__review-placeholder" aria-hidden />
      {photo.imageUrl ? (
        <img src={photo.imageUrl} alt="" className="al-photo-grid__review-image" />
      ) : null}
      {photo.onRetake ? (
        <button
          type="button"
          className="al-photo-grid__review-retake"
          aria-label={retakeLabel}
          onClick={photo.onRetake}
        >
          <RetakeIcon size={24} />
        </button>
      ) : (
        <span className="al-photo-grid__review-retake" aria-hidden>
          <RetakeIcon size={24} />
        </span>
      )}
    </div>
  );
}

/** Figma 847:278 · 928:2267 · 1044:2406 photo grids. */
export function AlPhotoGrid({
  layout,
  slots = [],
  reviewPhotos = [],
  locationLabel,
  className,
  locationCapture,
}: AlPhotoGridProps) {
  if (layout === 'review-quad') {
    return (
      <div className={cn('al-photo-grid', 'al-photo-grid--review-quad', className)}>
        <div className="al-photo-grid__review-quad">
          {reviewPhotos.map((photo, index) => (
            <ReviewPhotoTile key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'review') {
    return (
      <div className={cn('al-photo-grid', 'al-photo-grid--review', className)}>
        <div className="al-photo-grid__review-photos">
          {reviewPhotos.map((photo, index) => (
            <ReviewPhotoTile key={photo.id} photo={photo} index={index} />
          ))}
        </div>
        <div className="al-photo-grid__review-map">
          <span className="al-photo-grid__review-map-lines" aria-hidden />
          <svg
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="al-photo-grid__review-map-pin"
          >
            <path
              d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={12} cy={11} r={2.5} strokeWidth="2" />
          </svg>
          <p className="al-photo-grid__review-map-label">{locationLabel ?? 'Location captured'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('al-photo-grid', className)}>
      <div
        className={cn(
          'al-photo-grid__cells',
          layout === 'stacked'
            ? 'al-photo-grid__cells--stacked'
            : layout === 'dual'
              ? 'al-photo-grid__cells--dual'
              : 'al-photo-grid__cells--quad',
        )}
      >
        {slots.map((slot) => (
          <AlScenePhotoCard
            key={slot.id}
            label={slot.label}
            variant={
              slot.variant ??
              (layout === 'stacked' ? 'stacked' : layout === 'quad' ? 'wide' : 'square')
            }
            {...(slot.state !== undefined ? { state: slot.state } : {})}
            {...(slot.imageUrl !== undefined ? { imageUrl: slot.imageUrl } : {})}
            {...(slot.onCapture !== undefined ? { onCapture: slot.onCapture } : {})}
            {...(slot.icon !== undefined ? { icon: slot.icon } : {})}
          />
        ))}
        {locationCapture ? (
          <button
            type="button"
            className={cn(
              'al-scene-photo-card',
              'al-scene-photo-card--stacked',
              'al-scene-photo-card--label-first',
              'al-scene-photo-card--location',
              locationCapture.loading && 'al-scene-photo-card--loading',
              locationCapture.filled && 'al-scene-photo-card--filled',
            )}
            onClick={locationCapture.onCapture}
            disabled={locationCapture.loading}
            aria-busy={locationCapture.loading || undefined}
          >
            {locationCapture.loading ? (
              <>
                <span className="al-scene-photo-card__loading-spinner" aria-hidden />
                <p className="al-scene-photo-card__label">
                  {locationCapture.loadingLabel ?? 'Fetching your location…'}
                </p>
              </>
            ) : locationCapture.filled && locationCapture.detail ? (
              <div className="al-scene-photo-card__location-copy">
                <p className="al-scene-photo-card__label">{locationCapture.label}</p>
                <p className="al-scene-photo-card__detail">{locationCapture.detail}</p>
              </div>
            ) : (
              <>
                <p className="al-scene-photo-card__label">{locationCapture.label}</p>
                <span className="al-scene-photo-card__icon" aria-hidden>
                  <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx={12} cy={11} r={2.5} stroke="currentColor" strokeWidth={1.75} />
                  </svg>
                </span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
