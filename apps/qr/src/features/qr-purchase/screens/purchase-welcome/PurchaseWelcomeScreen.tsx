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
import {
  readStoredActivationPreview,
  readStoredActivationQrCode,
} from '@/services/activation/activation-service';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';

const B2C_SUCCESS_BODY = 'Your plan is already paid for. Activate it on your vehicle.';

/**
 * B2C prepaid welcome — same preview compositions as B2B/B2B2C.
 * Source of truth: GET /v1/activation/preview?code={qrCode}.
 */
export function PurchaseWelcomeScreen() {
  const navigate = useNavigate();
  const { session, setSelectedFlow, setPhase, updateSession } = useJourney();
  const activationCode = resolvePurchaseQrCode() ?? readStoredActivationQrCode();
  const storedPartner = readStoredActivationPreview()?.partner;

  const { viewState, config, retry } = useActivationPreview({
    code: activationCode,
    flow: 'purchase',
  });

  const handleActivate = () => {
    if (!config || viewState !== 'default') {
      return;
    }

    setSelectedFlow('purchase');
    updateSession({
      purchase: {
        ...(session.purchase ?? {}),
        entitlement: config,
        selectedPlanId: config.planId,
        riderCount: config.riderCount,
      },
      ...applyLandingEntitlementToSession(config),
    });
    setPhase('shared-auth');
    void navigate(authMobileUrl({ continueAuth: true }));
  };

  const planDisplay = config ? resolveWelcomePlanDisplay(config) : null;

  const successBodyCopy = config?.bodyCopy ?? B2C_SUCCESS_BODY;
  const shell = getWelcomeShellPresentation(viewState, successBodyCopy);
  const showPartnerCard = Boolean(storedPartner) || Boolean(config?.hasPartner);

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
          {storedPartner ? (
            <div className="ob-welcome-shell__partner-section ob-welcome-shell__partner-section--top-offset">
              <p className="ob-welcome-shell__section-label">Your plan</p>
              <PartnerActivationCardSkeleton />
            </div>
          ) : null}
          <PlanActivationCardSkeleton />
        </>
      ) : planDisplay && config ? (
        <>
          {showPartnerCard ? (
            <div className="ob-welcome-shell__partner-section ob-welcome-shell__partner-section--top-offset">
              <p className="ob-welcome-shell__section-label">{config.sectionLabel}</p>
              <PartnerActivationCard
                initials={config.partnerInitials}
                name={config.partnerName}
                subtitle={config.partnerSubtitle}
              />
            </div>
          ) : null}
          <PlanActivationCard
            planName={planDisplay.planName}
            priceDisplay={planDisplay.priceDisplay}
            statusLabel={config.planStatusLabel}
            includesLabel={planDisplay.includesLabel}
            features={planDisplay.features}
            riderRowLabel={planDisplay.riderRowLabel}
            vehiclePlate={config.vehiclePlate || undefined}
          />
        </>
      ) : null}
    </WelcomeActivationShell>
  );
}
