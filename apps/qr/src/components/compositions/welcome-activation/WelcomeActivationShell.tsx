import type { ReactNode } from 'react';
import { AlIcon } from '@autolokate/icons';
import { AlButton, AlHeading, AlIconButton, AlScreenBg, AlText } from '@autolokate/ui';
import type { AlScreenBgVariant } from '@autolokate/ui';

import {
  B2B_ERROR_MESSAGE,
  B2B_ERROR_TITLE,
} from '@/features/b2b-shared/b2b-welcome-copy.js';
import '../../step-shell-chrome/step-shell-chrome.css';
import './welcome-activation-shell.css';
import './partner-activation-card.css';

export type WelcomeActivationShellProps = {
  title: string;
  description: string;
  footerLabel: string;
  footerDisabled?: boolean;
  footerDimmed?: boolean;
  showBack?: boolean;
  bgVariant?: AlScreenBgVariant;
  onBack?: () => void;
  onContinue?: () => void;
  children: ReactNode;
};

export function WelcomeActivationShell({
  title,
  description,
  footerLabel,
  footerDisabled = false,
  footerDimmed = false,
  showBack = true,
  bgVariant = 'protected',
  onBack,
  onContinue,
  children,
}: WelcomeActivationShellProps) {
  return (
    <AlScreenBg
      variant={bgVariant}
      className={`ob-step-chrome-screen ob-welcome-shell${showBack ? '' : ' ob-welcome-shell--no-back'}`}
    >
      <div className="ob-step-chrome__frame ob-welcome-shell__frame">
        {showBack ? (
          <header className="ob-step-chrome__header ob-step-chrome__header--compact ob-welcome-shell__header">
            <AlIconButton
              icon={<AlIcon name="arrow-left" size={24} aria-hidden />}
              label="Go back"
              onClick={onBack}
              disabled={!onBack}
              className="ob-step-chrome__back ob-shell-back"
            />
          </header>
        ) : null}

        <div className="ob-step-chrome__body ob-welcome-shell__body">
          <div className="ob-step-chrome__heading ob-welcome-shell__heading">
            <AlHeading variant="h2">{title}</AlHeading>
            <AlText tone="muted" className="ob-welcome-shell__description">
              {description}
            </AlText>
          </div>
          <div className="ob-welcome-shell__content">{children}</div>
        </div>

        <footer className="ob-step-chrome__footer ob-welcome-shell__footer">
          <AlButton
            variant="primary"
            className={`ob-step-chrome__cta${footerDimmed ? ' ob-welcome-shell__cta--dimmed' : ''}`}
            disabled={footerDisabled || footerDimmed}
            onClick={onContinue}
          >
            {footerLabel}
          </AlButton>
        </footer>
      </div>
    </AlScreenBg>
  );
}

export function WelcomeActivationErrorPanel() {
  return (
    <div className="ob-welcome-error" role="alert">
      <div className="ob-welcome-error__icon" aria-hidden>
        !
      </div>
      <h3 className="ob-welcome-error__title">{B2B_ERROR_TITLE}</h3>
      <p className="ob-welcome-error__message">{B2B_ERROR_MESSAGE}</p>
    </div>
  );
}

export function PartnerActivationCardSkeleton() {
  return (
    <article className="ob-partner-card ob-partner-card--skeleton" aria-busy="true">
      <span className="ob-partner-card__avatar ob-partner-card__skeleton-avatar" />
      <div className="ob-partner-card__content">
        <span className="ob-partner-card__skeleton-line ob-partner-card__skeleton-line--title" />
        <span className="ob-partner-card__skeleton-line ob-partner-card__skeleton-line--subtitle" />
      </div>
    </article>
  );
}
