import { cn } from '../../../utils/cn';
import { CarIconGlyph } from '../icons/CarIconGlyph';

import type { AlVehicleConfirmationCardProps } from './VehicleConfirmationCard.types';
import './VehicleConfirmationCard.css';

/** Figma icon/shield-check · 18:11 */
function ScannerShieldGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma 1034:2351 · 1040:2374 — scanner vehicle confirmation (Post-Activation PWA). */
export function AlVehicleConfirmationCard({
  plate,
  model,
  badgeLabel,
  protected: protectedVariant = false,
  variant = 'scanner',
  className,
}: AlVehicleConfirmationCardProps) {
  return (
    <article
      className={cn(
        'al-vehicle-confirmation-card',
        `al-vehicle-confirmation-card--${variant}`,
        protectedVariant && 'al-vehicle-confirmation-card--protected',
        className,
      )}
    >
      <div className="al-vehicle-confirmation-card__body">
        <span className="al-vehicle-confirmation-card__icon-well" aria-hidden>
          <CarIconGlyph size={24} />
        </span>
        <div className="al-vehicle-confirmation-card__copy">
          <p className="al-vehicle-confirmation-card__plate">{plate}</p>
          <p className="al-vehicle-confirmation-card__model">{model}</p>
        </div>
      </div>
      <hr className="al-vehicle-confirmation-card__divider" />
      <p className="al-vehicle-confirmation-card__badge">
        <span className="al-vehicle-confirmation-card__badge-icon" aria-hidden>
          <ScannerShieldGlyph />
        </span>
        {badgeLabel}
      </p>
    </article>
  );
}
