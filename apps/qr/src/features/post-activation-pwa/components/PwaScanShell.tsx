import type { ReactNode } from 'react';
import { AlIcon } from '@autolokate/icons';
import { AlIconButton, AlScreenBg, type AlScreenBgVariant } from '@autolokate/ui';

import { PwaCtaReveal } from './PwaMotion.js';
import { PwaHeaderBrand } from './PwaHeaderBrand.js';

import './pwa-scan-shell.css';

export type PwaScanShellProps = {
  variant?: AlScreenBgVariant;
  showBack?: boolean;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Pin footer while main scrolls — Figma SOS status screens 849:321+. */
  stickyFooter?: boolean;
  /** Dim main content when a sheet is open — Figma 14c/14d. */
  dimmed?: boolean;
  className?: string;
};

/** PWA chrome — wordmark header, optional back, sticky footer support. */
export function PwaScanShell({
  variant = 'protected',
  showBack = false,
  onBack,
  children,
  footer,
  stickyFooter = false,
  dimmed = false,
  className,
}: PwaScanShellProps) {
  return (
    <AlScreenBg variant={variant} className={`pwa-scan-shell ${className ?? ''}`.trim()}>
      <div
        className={[
          'pwa-scan-shell__frame',
          stickyFooter && 'pwa-scan-shell__frame--sticky-footer',
          dimmed && 'pwa-scan-shell__frame--dimmed',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <header className="pwa-scan-shell__header">
          {showBack ? (
            <AlIconButton
              icon={<AlIcon name="arrow-left" size={24} aria-hidden />}
              label="Go back"
              onClick={onBack}
              className="pwa-scan-shell__back ob-shell-back"
            />
          ) : (
            <span className="pwa-scan-shell__back-spacer" aria-hidden />
          )}
          <PwaHeaderBrand />
          <span className="pwa-scan-shell__back-spacer" aria-hidden />
        </header>
        <main className="pwa-scan-shell__main">{children}</main>
        {footer ? (
          <footer className="pwa-scan-shell__footer">
            <PwaCtaReveal>{footer}</PwaCtaReveal>
          </footer>
        ) : null}
      </div>
    </AlScreenBg>
  );
}
