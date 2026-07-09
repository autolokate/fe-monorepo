import { cn } from '../../../utils/cn';

import type { AlIncidentStatusHeroProps, AlIncidentStatusHeroScene } from './IncidentStatusHero.types';
import './IncidentStatusHero.css';

function CouldntSendHero() {
  return (
    <svg width={240} height={240} viewBox="0 0 240 240" fill="none" aria-hidden>
      <g filter="url(#filter0_f_couldnt_send_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-signal-amber)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-warning)" strokeWidth="2" />
      <path
        d="M140.271 132.5L123.604 103.333C123.24 102.692 122.713 102.159 122.077 101.788C121.44 101.417 120.716 101.221 119.979 101.221C119.242 101.221 118.518 101.417 117.881 101.788C117.244 102.159 116.717 102.692 116.354 103.333L99.6872 132.5C99.3199 133.136 99.1273 133.858 99.1289 134.593C99.1305 135.327 99.3264 136.049 99.6965 136.683C100.067 137.318 100.598 137.843 101.237 138.206C101.875 138.569 102.598 138.757 103.333 138.75H136.666C137.397 138.749 138.115 138.556 138.748 138.19C139.381 137.824 139.906 137.298 140.272 136.665C140.637 136.032 140.829 135.313 140.829 134.582C140.829 133.851 140.636 133.133 140.271 132.5Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M120 113.75V122.083" stroke="var(--al-color-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M120 130.417H120.021" stroke="var(--al-color-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <filter id="filter0_f_couldnt_send_halo" x="20" y="20" width="200" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>
    </svg>
  );
}

function AlertCancelledHero() {
  return (
    <svg width={240} height={240} viewBox="0 0 240 240" fill="none" aria-hidden>
      <g filter="url(#filter0_f_alert_cancelled_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-neutral-500)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-on-surface-muted)" strokeWidth="2" />
      <path
        d="M120 140.833C131.506 140.833 140.834 131.506 140.834 120C140.834 108.494 131.506 99.1665 120 99.1665C108.494 99.1665 99.167 108.494 99.167 120C99.167 131.506 108.494 140.833 120 140.833Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M113.75 120L117.917 124.167L126.25 115.833"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter id="filter0_f_alert_cancelled_halo" x="20" y="20" width="200" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>
    </svg>
  );
}

function LocationUnavailableHero() {
  return (
    <svg width={240} height={240} viewBox="0 0 240 240" fill="none" aria-hidden>
      <g filter="url(#filter0_f_location_unavailable_halo)">
        <circle cx="120" cy="120" r="60" fill="var(--al-signal-amber)" fillOpacity="0.3" />
      </g>
      <circle cx="120" cy="120" r="74" stroke="var(--al-color-warning)" strokeWidth="2" />
      <path
        d="M121.252 140.414C125.127 137.069 136.666 126.235 136.666 115.833C136.666 111.413 134.91 107.174 131.785 104.048C128.659 100.922 124.42 99.1665 120 99.1665C115.579 99.1665 111.34 100.922 108.215 104.048C105.089 107.174 103.333 111.413 103.333 115.833C103.333 126.235 114.873 137.069 118.748 140.414C119.109 140.686 119.548 140.833 120 140.833C120.451 140.833 120.891 140.686 121.252 140.414Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M120 122.083C123.452 122.083 126.25 119.285 126.25 115.833C126.25 112.382 123.452 109.583 120 109.583C116.548 109.583 113.75 112.382 113.75 115.833C113.75 119.285 116.548 122.083 120 122.083Z"
        stroke="var(--al-color-on-surface)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter id="filter0_f_location_unavailable_halo" x="20" y="20" width="200" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>
    </svg>
  );
}

function sceneVisual(scene: AlIncidentStatusHeroScene) {
  switch (scene) {
    case 'couldnt-send':
      return <CouldntSendHero />;
    case 'alert-cancelled':
      return <AlertCancelledHero />;
    case 'location-unavailable':
      return <LocationUnavailableHero />;
    default:
      return null;
  }
}

/** Figma 875:2189 · 875:2215 · 876:2208 — status halo heroes. */
export function AlIncidentStatusHero({
  variant = 'attention',
  scene,
  visual,
  className,
}: AlIncidentStatusHeroProps) {
  const resolvedVisual = scene ? sceneVisual(scene) : visual;

  return (
    <div className={cn('al-incident-status-hero', `al-incident-status-hero--${variant}`, className)}>
      <div className="al-incident-status-hero__visual">{resolvedVisual}</div>
    </div>
  );
}
