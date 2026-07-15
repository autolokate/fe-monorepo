import { useNavigate } from 'react-router-dom';

import {
  PartnerActivationCard,
  PartnerActivationCardSkeleton,
  PlanActivationCard,
  PlanActivationCardSkeleton,
  WelcomeActivationErrorPanel,
  WelcomeActivationShell,
} from '@/components/compositions/welcome-activation/index';
import { applyLandingEntitlementToSession } from '@/features/b2b-shared/apply-landing-entitlement';
import { getWelcomeShellPresentation } from '@/features/b2b-shared/get-welcome-shell-presentation';
import { resolveWelcomePlanDisplay } from '@/features/b2b-shared/resolve-welcome-plan-display';
import { useActivationPreview } from '@/hooks/activation/index';
import { journeyPaths } from '@/journey/constants';
import { useJourney } from '@/journey/JourneyContext';
import { authMobileUrl } from '@/journey/auth/auth-routing';
import { resolvePartnerVariantFromRiderCount } from '@/journey/state/partner-journey-state-machine';
import { readStoredActivationQrCode } from '@/services/activation/activation-service';

export type PartnerLandingVariant = 'plan-only' | 'plan-rider';

export type PartnerWelcomeScreenProps = {
  variant?: PartnerLandingVariant;
};

const PARTNER_BODY_COPY: Record<PartnerLandingVariant, string> = {
  'plan-only': 'Your partner set up and paid for your plan. Activate it now.',
  'plan-rider': 'Your partner set up and paid for your plan and rider. Activate it now.',
};

export function PartnerWelcomeScreen({ variant = 'plan-only' }: PartnerWelcomeScreenProps) {
  const navigate = useNavigate();
  const { session, setSelectedFlow, setPhase, updateSession } = useJourney();
  const activationCode = session.b2b2c?.partnerId ?? readStoredActivationQrCode();
  const { viewState, config, retry } = useActivationPreview({
    code: activationCode,
    flow: 'b2b2c',
  });

  const handleActivate = () => {
    if (!config || viewState !== 'default') {
      return;
    }

    const resolvedVariant = resolvePartnerVariantFromRiderCount(config.riderCount);
    setSelectedFlow('b2b2c');
    updateSession({
      b2b2c: {
        entitlement: config,
        variant: resolvedVariant,
        partnerId: activationCode ?? undefined,
      },
      ...applyLandingEntitlementToSession(config),
    });
    setPhase('shared-auth');
    void navigate(authMobileUrl({ continueAuth: true }));
  };

  const planDisplay = config ? resolveWelcomePlanDisplay(config) : null;

  const successBodyCopy = config?.bodyCopy ?? PARTNER_BODY_COPY[variant];
  const shell = getWelcomeShellPresentation(viewState, successBodyCopy);

  return (
    <WelcomeActivationShell
      title={shell.title}
      description={shell.description}
      footerLabel={shell.footerLabel}
      footerDisabled={shell.footerDisabled}
      footerDimmed={shell.footerDimmed}
      showBack={shell.showBack}
      bgVariant={shell.bgVariant}
      onBack={() => {
        void navigate(journeyPaths.root);
      }}
      onContinue={() => {
        if (viewState === 'error') {
          retry();
          return;
        }
        handleActivate();
      }}
    >
      {viewState === 'error' ? (
        <WelcomeActivationErrorPanel />
      ) : viewState === 'loading' ? (
        <>
          <div className="ob-welcome-shell__partner-section">
            <p className="ob-welcome-shell__section-label">You got this from</p>
            <PartnerActivationCardSkeleton />
          </div>
          <PlanActivationCardSkeleton />
        </>
      ) : planDisplay && config ? (
        <>
          <div className="ob-welcome-shell__partner-section">
            <p className="ob-welcome-shell__section-label">{config.sectionLabel}</p>
            <PartnerActivationCard
              initials={config.partnerInitials}
              name={config.partnerName}
              subtitle={config.partnerSubtitle}
            />
          </div>
          <PlanActivationCard
            planName={planDisplay.planName}
            priceDisplay={planDisplay.priceDisplay}
            statusLabel={config.planStatusLabel}
            includesLabel={planDisplay.includesLabel}
            features={planDisplay.features}
            riderRowLabel={planDisplay.riderRowLabel}
            vehiclePlate={config.vehiclePlate}
          />
        </>
      ) : null}
    </WelcomeActivationShell>
  );
}
