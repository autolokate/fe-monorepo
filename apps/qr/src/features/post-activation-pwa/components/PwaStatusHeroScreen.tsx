import type { ReactNode } from 'react';
import { AlHeading, AlText } from '@autolokate/ui';

import { PwaFade, PwaHeroReveal, PwaRevealItem } from './PwaMotion.js';
import { PwaScanShell } from './PwaScanShell.js';

import './pwa-status-hero-screen.css';

export type PwaStatusHeroScreenProps = {
  variant?: 'protected' | 'emergency';
  title: string;
  description: string;
  visual: ReactNode;
  footer: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
};

/** Figma status heroes — 875:2189 · 875:2215 · 876:2208. */
export function PwaStatusHeroScreen({
  variant = 'protected',
  title,
  description,
  visual,
  footer,
  showBack = false,
  onBack,
}: PwaStatusHeroScreenProps) {
  return (
    <PwaScanShell
      variant={variant}
      showBack={showBack}
      onBack={onBack}
      footer={footer}
    >
      <PwaFade className="pwa-status-hero-screen">
        <PwaHeroReveal className="pwa-status-hero-screen__visual">{visual}</PwaHeroReveal>
        <PwaRevealItem index={1}>
          <AlHeading variant="h2" className="pwa-status-hero-screen__title">
            {title}
          </AlHeading>
        </PwaRevealItem>
        <PwaRevealItem index={2}>
          <AlText tone="muted" align="center" className="pwa-status-hero-screen__description">
            {description}
          </AlText>
        </PwaRevealItem>
      </PwaFade>
    </PwaScanShell>
  );
}
