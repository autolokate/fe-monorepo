import type { ReactNode } from 'react';

/** Figma frame-specific hero illustration. */
export type AlIncidentStatusHeroScene = 'couldnt-send' | 'alert-cancelled' | 'location-unavailable';

export type AlIncidentStatusHeroVariant = 'attention' | 'emergency' | 'neutral' | 'success';

export type AlIncidentStatusHeroProps = {
  /** Legacy variant — prefer `scene` for Figma-exact heroes. */
  variant?: AlIncidentStatusHeroVariant;
  /** Figma frame-specific hero illustration. */
  scene?: AlIncidentStatusHeroScene;
  /** Custom visual override (legacy). */
  visual?: ReactNode;
  className?: string;
};
