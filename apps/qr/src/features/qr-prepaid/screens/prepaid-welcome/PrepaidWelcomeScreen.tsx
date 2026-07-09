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
import { readStoredActivationPreviewCode, readStoredActivationQrCode } from '@/services/activation/activation-service';

const PREPAID_SUCCESS_BODY =
  'Your sponsor set up and paid for your plan. Nothing to pay.';

export function PrepaidWelcomeScreen() {
  const navigate = useNavigate();
  const { session, setSelectedFlow, setPhase, updateSession } = useJourney();
  const activationCode =
    session.prepaid?.voucherId ?? readStoredActivationPreviewCode() ?? readStoredActivationQrCode();
  const { viewState, config, retry } = useActivationPreview({
    code: activationCode,
    flow: 'prepaid',
  });

  const handleActivate = () => {
    if (!config || viewState !== 'default') {
      return;
    }

    setSelectedFlow('prepaid');
    updateSession({
      prepaid: { entitlement: config, voucherId: activationCode ?? undefined },
      ...applyLandingEntitlementToSession(config),
    });
    setPhase('shared-auth');
    void navigate(authMobileUrl({ continueAuth: true }));
  };

  const planDisplay = config
    ? resolveWelcomePlanDisplay(config.planId, config.priceDisplay, config.riderCount)
    : null;

  const successBodyCopy = config?.bodyCopy ?? PREPAID_SUCCESS_BODY;
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
          <div className="ob-welcome-shell__partner-section ob-welcome-shell__partner-section--top-offset">
            <p className="ob-welcome-shell__section-label">Covered by</p>
            <PartnerActivationCardSkeleton />
          </div>
          <PlanActivationCardSkeleton />
        </>
      ) : planDisplay && config ? (
        <>
          <div className="ob-welcome-shell__partner-section ob-welcome-shell__partner-section--top-offset">
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
