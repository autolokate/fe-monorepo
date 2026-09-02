import { Navigate, Route, Routes } from 'react-router-dom';

import { PurchaseWelcomeScreen } from '../../features/qr-purchase/screens/purchase-welcome/index';
import { hasAuthTokens } from '@/services/auth/ensure-valid-auth-session';
import { getPostAuthActivationPath } from '../activation-routing';
import { journeyPaths } from '../constants';
import { AuthEntryLegacyRedirect } from '../guards/AuthEntryLegacyRedirect';
import {
  RequireAuthCompleted,
  RequireSelectedFlow,
  RequireSelectedFlowMatch,
} from '../guards/JourneyRouteGuards';
import {
  LEGACY_FLAT_PURCHASE_REDIRECTS,
  LEGACY_JOURNEY_AUTH_REDIRECTS,
  LEGACY_JOURNEY_ENTRY_REDIRECTS,
  LegacyEmergencyFlatRedirect,
  LegacyFlatToScopedRedirect,
  QrEntryRoute,
} from '../guards/LegacyJourneyRedirectRoutes';
import {
  LegacyVehicleConfirmationRedirect,
  LegacyVehicleLookupRedirect,
} from '../guards/LegacyVehicleRouteRedirects';
import { PreserveSearchRedirect } from '../guards/PreserveSearchRedirect';
import { PurchaseIndexRedirect } from '../guards/PurchaseIndexRedirect';
import {
  LEGACY_PURCHASE_FLAT_SEGMENTS,
  PURCHASE_ROUTE_PATTERNS,
  PURCHASE_ROUTE_SEGMENTS,
} from '../purchase/purchase-routing';
import { JourneyScopeProvider } from '../routing/JourneyScopeProvider';
import { useActiveJourneyId } from '../routing/use-active-journey-id';
import { JourneyCompletedScreen } from '../screens/JourneyCompletedScreen';
import { useJourney } from '../JourneyContext';
import { B2b2cRoutes } from './B2b2cRoutes';
import { EmergencyRoutes } from './EmergencyRoutes';
import { JourneySharedAuthRoute } from './JourneySharedAuthRoute';
import { PrepaidRoutes } from './PrepaidRoutes';
import { PurchaseRoutes } from './PurchaseRoutes';

function PurchaseActivationRoute() {
  return (
    <RequireAuthCompleted>
      <RequireSelectedFlowMatch flow="purchase">
        <PurchaseRoutes />
      </RequireSelectedFlowMatch>
    </RequireAuthCompleted>
  );
}

function PurchaseWelcomeRoute() {
  const journeyId = useActiveJourneyId();
  const { session, selectedFlow } = useJourney();

  // Logged-in users skip preview welcome and resume at plans (or attach resume).
  if (hasAuthTokens()) {
    return (
      <Navigate
        to={getPostAuthActivationPath(selectedFlow ?? 'purchase', journeyId ?? undefined, session)}
        replace
      />
    );
  }

  return (
    <RequireSelectedFlowMatch flow="purchase">
      <PurchaseWelcomeScreen />
    </RequireSelectedFlowMatch>
  );
}

function EmergencyActivationRoute() {
  return (
    <RequireAuthCompleted>
      <RequireSelectedFlow>
        <EmergencyRoutes />
      </RequireSelectedFlow>
    </RequireAuthCompleted>
  );
}

function OnboardingJourneyRoutes() {
  return (
    <Routes>
      <Route path="auth" element={<JourneySharedAuthRoute />} />
      <Route path="otp" element={<JourneySharedAuthRoute />} />
      <Route path="profile" element={<JourneySharedAuthRoute />} />
      <Route path={PURCHASE_ROUTE_SEGMENTS.welcome} element={<PurchaseWelcomeRoute />} />
      <Route path="vehicle" element={<PurchaseActivationRoute />} />
      <Route path="vehicle/:registrationNumber/lookup" element={<PurchaseActivationRoute />} />
      <Route
        path="vehicle/:registrationNumber/confirmation"
        element={<PurchaseActivationRoute />}
      />
      <Route
        path={PURCHASE_ROUTE_SEGMENTS.vehicleLookupFailed}
        element={<PurchaseActivationRoute />}
      />
      <Route path={PURCHASE_ROUTE_SEGMENTS.choosePlan} element={<PurchaseActivationRoute />} />
      <Route path={PURCHASE_ROUTE_SEGMENTS.riderCover} element={<PurchaseActivationRoute />} />
      <Route path={PURCHASE_ROUTE_SEGMENTS.orderSummary} element={<PurchaseActivationRoute />} />
      <Route
        path={PURCHASE_ROUTE_SEGMENTS.orderSummaryPromoApplied}
        element={<PurchaseActivationRoute />}
      />
      <Route
        path={PURCHASE_ROUTE_SEGMENTS.orderSummaryInvalidPromo}
        element={<PurchaseActivationRoute />}
      />
      <Route
        path={PURCHASE_ROUTE_SEGMENTS.processingPayment}
        element={<PurchaseActivationRoute />}
      />
      <Route
        path={PURCHASE_ROUTE_SEGMENTS.paymentStillConfirming}
        element={<PurchaseActivationRoute />}
      />
      <Route path={PURCHASE_ROUTE_SEGMENTS.paymentSuccess} element={<PurchaseActivationRoute />} />
      <Route path={PURCHASE_ROUTE_SEGMENTS.paymentFailed} element={<PurchaseActivationRoute />} />
      <Route
        path={PURCHASE_ROUTE_SEGMENTS.paymentUnconfirmed}
        element={<PurchaseActivationRoute />}
      />
      <Route path="*" element={<PurchaseIndexRedirect />} />
    </Routes>
  );
}

export function JourneyRoutes() {
  return (
    <div className="journey-frame">
      <Routes>
        <Route path="/" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
        <Route path={`${journeyPaths.qrDeepLinkPrefix}/:qrCode`} element={<QrEntryRoute />} />

        {LEGACY_JOURNEY_ENTRY_REDIRECTS.map(([from, to]) => (
          <Route key={from} path={from} element={<PreserveSearchRedirect to={to} />} />
        ))}
        {LEGACY_JOURNEY_AUTH_REDIRECTS.map(([from, to]) => (
          <Route key={from} path={from} element={<PreserveSearchRedirect to={to} />} />
        ))}

        {/* Journey-scoped onboarding (auth + purchase) */}
        <Route
          path={`${journeyPaths.onboardingPrefix}/:journeyId/*`}
          element={
            <JourneyScopeProvider>
              <OnboardingJourneyRoutes />
            </JourneyScopeProvider>
          }
        />

        {/* Journey-scoped emergency */}
        <Route
          path={`${journeyPaths.emergencyPrefix}/:journeyId/*`}
          element={
            <JourneyScopeProvider>
              <EmergencyActivationRoute />
            </JourneyScopeProvider>
          }
        />

        {/* Partner flows */}
        <Route
          path={`${journeyPaths.prepaid}/:journeyId/*`}
          element={
            <JourneyScopeProvider>
              <PrepaidRoutes />
            </JourneyScopeProvider>
          }
        />
        <Route
          path={`${journeyPaths.b2b2c}/:journeyId/*`}
          element={
            <JourneyScopeProvider>
              <B2b2cRoutes />
            </JourneyScopeProvider>
          }
        />

        {/* Static legal + completed */}
        <Route path={journeyPaths.legalPrivacy} element={<JourneySharedAuthRoute />} />
        <Route path={journeyPaths.legalTerms} element={<JourneySharedAuthRoute />} />
        <Route path={journeyPaths.completed} element={<JourneyCompletedScreen />} />

        {/* Legacy flat auth → scoped */}
        <Route path="/auth" element={<LegacyFlatToScopedRedirect suffix="/auth" />} />
        <Route path="/scan" element={<AuthEntryLegacyRedirect />} />
        <Route path="/otp" element={<LegacyFlatToScopedRedirect suffix="/otp" />} />
        <Route path="/profile" element={<LegacyFlatToScopedRedirect suffix="/profile" />} />

        {/* Legacy flat emergency → scoped */}
        <Route
          path={journeyPaths.emergency}
          element={<LegacyEmergencyFlatRedirect suffix="/rider-prompt" />}
        />
        <Route
          path={`${journeyPaths.emergency}/:segment`}
          element={<LegacyEmergencyFlatRedirect suffix="" />}
        />

        {/* Legacy flat purchase → scoped */}
        <Route path="/purchase" element={<PurchaseIndexRedirect />} />
        <Route path="/purchase/*" element={<PurchaseIndexRedirect />} />
        <Route
          path={`/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleLookup}`}
          element={<LegacyVehicleLookupRedirect />}
        />
        <Route
          path={`/${LEGACY_PURCHASE_FLAT_SEGMENTS.vehicleConfirmation}`}
          element={<LegacyVehicleConfirmationRedirect />}
        />
        <Route
          path={PURCHASE_ROUTE_PATTERNS.vehicleLookup}
          element={<LegacyFlatToScopedRedirect suffix={PURCHASE_ROUTE_PATTERNS.vehicleLookup} />}
        />
        <Route
          path={PURCHASE_ROUTE_PATTERNS.vehicleConfirmation}
          element={
            <LegacyFlatToScopedRedirect suffix={PURCHASE_ROUTE_PATTERNS.vehicleConfirmation} />
          }
        />
        {LEGACY_FLAT_PURCHASE_REDIRECTS.map(([segment]) => (
          <Route
            key={segment}
            path={`/${segment}`}
            element={<LegacyFlatToScopedRedirect suffix={`/${segment}`} />}
          />
        ))}

        {/* Legacy prepaid/b2b2c without journey id */}
        <Route
          path={`${journeyPaths.prepaid}/*`}
          element={<PreserveSearchRedirect to={journeyPaths.entry} />}
        />
        <Route
          path={`${journeyPaths.b2b2c}/*`}
          element={<PreserveSearchRedirect to={journeyPaths.entry} />}
        />

        <Route path="*" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
      </Routes>
    </div>
  );
}
