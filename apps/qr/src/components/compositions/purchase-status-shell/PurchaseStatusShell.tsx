import type { ReactNode } from 'react';
import { AlIcon } from '@autolokate/icons';
import { AlButton, AlHeading, AlIconButton, AlScreenBg, AlText } from '@autolokate/ui';

import '../../step-shell-chrome/step-shell-chrome.css';
import './purchase-status-shell.css';

export type PurchaseStatusAmbient = 'purchase' | 'attention';

export type PurchaseStatusFooterVariant = 'primary' | 'text-link';

export type PurchaseStatusShellProps = {
  title: string;
  description: string;
  visual: ReactNode;
  /** Rendered after description inside the centered body (e.g. R15 active chip). */
  bodyAccessory?: ReactNode;
  /** Figma fill_67PUMG (purchase) or fill_L73IEG (R04b attention). */
  ambient?: PurchaseStatusAmbient;
  showBack?: boolean;
  onBack?: () => void;
  footerLabel?: string;
  /** R09b — centered Body link, no primary CTA (Figma 579:1699). */
  footerVariant?: PurchaseStatusFooterVariant;
  /** R04b — secondary action above primary CTA (Figma hotspot 658:2079). */
  secondaryFooterLabel?: string;
  onSecondaryFooter?: () => void;
  footerLoading?: boolean;
  footerDisabled?: boolean;
  hideFooter?: boolean;
  onContinue?: () => void;
  /** Full-screen overlay (e.g. R10 confetti) — not clipped by body scroll. */
  celebration?: ReactNode;
};

/** Figma R04/R04b — centered Display title, no back, optional footer CTA. */
export function PurchaseStatusShell({
  title,
  description,
  visual,
  bodyAccessory,
  ambient = 'purchase',
  showBack = false,
  onBack,
  footerLabel = 'Continue',
  footerVariant = 'primary',
  secondaryFooterLabel,
  onSecondaryFooter,
  footerLoading = false,
  footerDisabled = false,
  hideFooter = false,
  onContinue,
  celebration,
}: PurchaseStatusShellProps) {
  return (
    <AlScreenBg
      variant="protected"
      className={`ob-step-chrome-screen ob-purchase-status-shell ob-purchase-status-shell--${ambient}${celebration ? ' ob-purchase-status-shell--celebration' : ''}`}
    >
      {celebration ? (
        <div className="ob-purchase-status-shell__celebration" aria-hidden>
          {celebration}
        </div>
      ) : null}
      <div className="ob-step-chrome__frame ob-purchase-status-shell__frame">
        {showBack ? (
          <header className="ob-step-chrome__header ob-step-chrome__header--compact ob-purchase-status-shell__header">
            <AlIconButton
              icon={<AlIcon name="arrow-left" size={24} aria-hidden />}
              label="Go back"
              onClick={onBack}
              disabled={!onBack}
              className="ob-step-chrome__back ob-shell-back"
            />
          </header>
        ) : null}
        <div className="ob-purchase-status-shell__body">
          {visual}
          <AlHeading variant="h1" className="ob-purchase-status-shell__title">
            {title}
          </AlHeading>
          <AlText tone="muted" align="center" className="ob-purchase-status-shell__description">
            {description}
          </AlText>
          {bodyAccessory}
        </div>

        {hideFooter ? null : (
          <footer className="ob-step-chrome__footer ob-purchase-status-shell__footer">
            {secondaryFooterLabel && onSecondaryFooter ? (
              <button
                type="button"
                className="ob-purchase-status-shell__secondary-link"
                onClick={onSecondaryFooter}
              >
                {secondaryFooterLabel}
              </button>
            ) : null}
            {footerVariant === 'text-link' ? (
              <button
                type="button"
                className="ob-purchase-status-shell__text-link"
                disabled={footerDisabled || footerLoading}
                onClick={onContinue}
              >
                {footerLabel}
              </button>
            ) : (
              <AlButton
                variant="primary"
                className="ob-step-chrome__cta ob-purchase-status-shell__cta"
                loading={footerLoading}
                disabled={footerDisabled || footerLoading}
                onClick={onContinue}
              >
                {footerLabel}
              </AlButton>
            )}
          </footer>
        )}
      </div>
    </AlScreenBg>
  );
}
