import { AlCheckbox, AlStack, AlText } from '@autolokate/ui';
import { AlIcon } from '@autolokate/icons';

import { EmptyStateHero } from '@/components/compositions/index.js';
import { FlowStepShell } from '@/components/flow-step-shell/index.js';
import type { R06LegalConsentScreenProps } from '../../types.js';

export type { R06LegalConsentScreenProps };

export function R06LegalConsentScreen({
  state = 'default',
  onContinue,
  onBack,
  showBack = true,
  legalAccepted,
  onLegalAcceptedChange,
}: R06LegalConsentScreenProps) {
  const loading = state === 'loading';
  const isError = state === 'error';
  const isEmpty = state === 'empty';
  const isSuccess = state === 'success';
  const interactive = legalAccepted !== undefined && onLegalAcceptedChange !== undefined;
  const checked = interactive ? legalAccepted : isSuccess;

  return (
    <FlowStepShell
      phase="shared"
      step={6}
      title="Terms & privacy"
      description="review and accept to continue"
      footerLabel={loading ? 'Saving…' : isSuccess ? 'Accepted' : 'Accept & continue'}
      footerLoading={loading}
      footerDisabled={isEmpty || isError}
      showBack={showBack}
      onBack={onBack}
      onContinue={onContinue}
    >
      {isEmpty ? (
        <EmptyStateHero
          variant="empty"
          icon={<AlIcon name="shield-check" size={48} aria-hidden />}
          heading="Legal documents unavailable"
          message="We couldn&apos;t load terms and privacy policy. Pull to refresh or try again."
        />
      ) : (
        <AlStack gap="lg">
          <div className="ob-legal-copy">
            <AlText>
              By continuing, you agree to Autolokate&apos;s{' '}
              <a href="#terms">Terms of Service</a> and{' '}
              <a href="#privacy">Privacy Policy</a>, including how we use your vehicle and contact
              information for crash detection and emergency response.
            </AlText>
            <AlText tone="muted">
              You can withdraw consent or update preferences anytime from account settings.
            </AlText>
          </div>
          <AlCheckbox
            label="I agree to the Terms of Service and Privacy Policy"
            checked={interactive ? legalAccepted : undefined}
            defaultChecked={interactive ? undefined : checked}
            onChange={
              onLegalAcceptedChange
                ? (event) => {
                    onLegalAcceptedChange(event.target.checked);
                  }
                : undefined
            }
            disabled={loading || isSuccess}
            errorText={isError ? 'Accept the terms and privacy policy to continue.' : undefined}
          />
          {isSuccess ? (
            <AlText variant="caption" tone="muted">
              Consent recorded. You&apos;re ready to activate protection.
            </AlText>
          ) : null}
        </AlStack>
      )}
    </FlowStepShell>
  );
}
