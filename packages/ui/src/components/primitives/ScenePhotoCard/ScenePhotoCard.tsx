import { cn } from '../../../utils/cn';
import { RetakeIcon } from '../../icons/RetakeIcon';

import type { AlScenePhotoCardProps } from './ScenePhotoCard.types';
import './ScenePhotoCard.css';

/** Figma 847:278 · 928:2267 — single photo capture cell. */
export function AlScenePhotoCard({
  label,
  state = 'empty',
  variant = 'square',
  imageUrl,
  onCapture,
  className,
  icon,
}: AlScenePhotoCardProps) {
  const isFilled = state === 'filled' && imageUrl;
  const canRetake = isFilled && Boolean(onCapture);

  if (isFilled) {
    if (canRetake) {
      return (
        <button
          type="button"
          className={cn(
            'al-scene-photo-card',
            'al-scene-photo-card--filled',
            'al-scene-photo-card--retake',
            variant === 'stacked' && 'al-scene-photo-card--stacked',
            variant === 'wide' && 'al-scene-photo-card--wide',
            className,
          )}
          onClick={onCapture}
          aria-label={`Retake ${label} photo`}
        >
          <img className="al-scene-photo-card__image" src={imageUrl} alt={label} />
          <span className="al-scene-photo-card__retake" aria-hidden>
            <RetakeIcon size={24} />
          </span>
        </button>
      );
    }

    return (
      <div
        className={cn(
          'al-scene-photo-card',
          'al-scene-photo-card--filled',
          variant === 'stacked' && 'al-scene-photo-card--stacked',
          variant === 'wide' && 'al-scene-photo-card--wide',
          className,
        )}
      >
        <img className="al-scene-photo-card__image" src={imageUrl} alt={label} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'al-scene-photo-card',
        variant === 'stacked' && 'al-scene-photo-card--stacked',
        variant === 'wide' && 'al-scene-photo-card--wide',
        variant === 'stacked' && 'al-scene-photo-card--label-first',
        state === 'capturing' && 'al-scene-photo-card--capturing',
        state === 'filled' && 'al-scene-photo-card--filled',
        className,
      )}
      onClick={onCapture}
      aria-label={`Take ${label} photo`}
    >
      <p className="al-scene-photo-card__label">{label}</p>
      <span className="al-scene-photo-card__icon" aria-hidden>
        {icon ?? (
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h3l2-2h6l2 2h3v12H4V7z"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinejoin="round"
            />
            <circle cx={12} cy={13} r={3.5} stroke="currentColor" strokeWidth={1.75} />
          </svg>
        )}
      </span>
    </button>
  );
}
