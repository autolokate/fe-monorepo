import type { ReactNode } from 'react';
import { AlIcon } from '@autolokate/icons';
import { AlHeading, AlSosHoldButton, AlText, type AlSosHoldButtonProps } from '@autolokate/ui';

import { usePwaScan } from '../context/PwaScanContext.js';
import { useResolveStoredLocationName } from '../hooks/use-resolve-stored-location-name.js';
import { formatPwaLocationLabel } from '../utils/format-pwa-location.js';
import { PwaFade, PwaRevealItem } from './PwaMotion.js';
import { PwaScanShell } from './PwaScanShell.js';

import './pwa-emergency-screen.css';

export type PwaEmergencyScreenProps = {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  holdButton: AlSosHoldButtonProps;
  showLocationChip?: boolean;
  onLocationChip?: () => void;
  showCall112?: boolean;
  overlay?: ReactNode;
};

/** Figma 848:278 · 1092:2499 · 1110:2471 · 1113:2486 — shared SOS page frame. */
export function PwaEmergencyScreen({
  showBack = false,
  onBack,
  title = 'Emergency',
  subtitle = 'Hold the button to send help to this location',
  holdButton,
  showLocationChip = true,
  onLocationChip,
  showCall112 = true,
  overlay,
}: PwaEmergencyScreenProps) {
  const { session } = usePwaScan();
  useResolveStoredLocationName();
  const locationLabel = formatPwaLocationLabel(
    session.location,
    session.locationDenied,
    session.locationName,
  );

  return (
    <PwaScanShell variant="emergency" showBack={showBack} onBack={onBack} dimmed={Boolean(overlay)}>
      <PwaFade className="pwa-emergency-screen">
        <PwaRevealItem index={0} className="pwa-emergency-screen__intro">
          <AlHeading variant="h2" className="pwa-emergency-screen__title">
            {title}
          </AlHeading>
          <AlText tone="muted" className="pwa-emergency-screen__subtitle">
            {subtitle}
          </AlText>
        </PwaRevealItem>
        <div className="pwa-emergency-screen__hold-zone">
          <AlSosHoldButton className="pwa-emergency-screen__hold" {...holdButton} />
        </div>
        <div className="pwa-emergency-screen__footer">
          {showLocationChip ? (
            <button
              type="button"
              className="pwa-emergency-screen__location-chip"
              onClick={onLocationChip}
            >
              <AlIcon name="map-pin" size={16} aria-hidden />
              <span>{locationLabel}</span>
              {!session.location ? <AlIcon name="chevron-right" size={16} aria-hidden /> : null}
            </button>
          ) : null}
          {showCall112 ? (
            <button
              type="button"
              className="pwa-emergency-screen__call-fallback"
              onClick={() => {
                window.location.href = 'tel:112';
              }}
            >
              <AlIcon name="phone" size={16} aria-hidden />
              Or call 112 directly
            </button>
          ) : null}
        </div>
      </PwaFade>
      {overlay}
    </PwaScanShell>
  );
}
