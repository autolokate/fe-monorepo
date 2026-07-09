import { AlTextField } from '@autolokate/ui';
import { useNavigate } from 'react-router-dom';

import { AuthStepShell } from '@/components/auth-step-shell/index';
import { authJourneyPaths } from '@/journey/auth/auth-routing';
import { useAuthRouteProgress } from '@/journey/progress/index';
import {
  AlOfflineChip,
  InlineConsentBlock,
  TrustRow,
} from '@/components/compositions/index';
import { MOBILE_INPUT_DISPLAY_MAX } from '../../auth-flow/auth-flow.validation';
import type { A1MobileScreenProps } from '../../types';

function resolveCtaHelper(
  mobileState: NonNullable<A1MobileScreenProps['mobileState']>,
  hasMobile: boolean,
  consentAccepted: boolean,
): string | undefined {
  if (mobileState === 'offline') {
    return "Offline, we'll send the code once you're back";
  }
  if (mobileState === 'error') {
    return 'Enter a valid number to continue';
  }
  if (!hasMobile) {
    return 'Enter your number to continue';
  }
  if (!consentAccepted) {
    return 'Accept the terms to continue';
  }
  return undefined;
}

/** A1 · Mobile — Figma 102:268 · 557:1606 */
export function A1MobileScreen({
  mobileState = 'empty',
  mobileValue = '',
  onMobileChange,
  consentAccepted = false,
  onConsentChange,
  onPrivacyClick,
  onTermsClick,
  onContinue,
  onBack,
  showBack = true,
  title = "What's your number?",
  description = "We'll send a code on WhatsApp (or SMS)",
  footerLabel = 'Get OTP',
  hideProgress = false,
  consentVariant = 'owner',
}: A1MobileScreenProps) {
  const navigate = useNavigate();
  const isOffline = mobileState === 'offline';
  const isError = mobileState === 'error';
  const isLoading = mobileState === 'loading';
  const hasMobile = mobileValue.replace(/\D/g, '').length > 0;
  const canSubmit = hasMobile && consentAccepted && !isOffline && !isError && !isLoading;

  const ctaHelper = resolveCtaHelper(mobileState, hasMobile, consentAccepted);
  const progressConfig = useAuthRouteProgress();
  const handlePrivacyClick =
    onPrivacyClick ??
    (() => {
      void navigate(authJourneyPaths.privacy);
    });
  const handleTermsClick =
    onTermsClick ??
    (() => {
      void navigate(authJourneyPaths.terms);
    });

  return (
    <AuthStepShell
      progressConfig={hideProgress ? null : progressConfig}
      hideProgress={hideProgress}
      title={title}
      description={description}
      footerLabel={footerLabel}
      footerLoading={isLoading}
      footerDisabled={!canSubmit}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
      ctaHelper={ctaHelper}
      variant={isError ? 'error' : 'default'}
    >
      <AlTextField
        className="ob-auth-mobile-field"
        aria-label="Mobile number"
        aria-describedby={isError ? 'auth-mobile-error' : undefined}
        value={mobileValue}
        onChange={
          onMobileChange
            ? (event) => {
                onMobileChange(event.target.value);
              }
            : undefined
        }
        prefix="+91"
        placeholder="Mobile number"
        state={isError ? 'error' : 'default'}
        disabled={isOffline || isLoading}
        inputMode="numeric"
        autoComplete="tel"
        maxLength={MOBILE_INPUT_DISPLAY_MAX}
      />
      {isError ? (
        <p id="auth-mobile-error" className="ob-field-validation-error" role="alert">
          Enter your 10-digit number, no 0 or +91 in front.
        </p>
      ) : null}
      <InlineConsentBlock
        checked={consentAccepted}
        onChange={onConsentChange ?? (() => undefined)}
        onPrivacyClick={handlePrivacyClick}
        onTermsClick={handleTermsClick}
        disabled={isOffline || isLoading || !onConsentChange}
        variant={consentVariant}
      />
      <TrustRow />
      {isOffline ? (
        <div className="ob-auth-shell__offline-chip">
          <AlOfflineChip />
        </div>
      ) : null}
    </AuthStepShell>
  );
}
