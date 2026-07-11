import { Route, Routes } from 'react-router-dom';

import { emergencyJourneyPaths } from '../emergency/emergency-routing';
import { AuthEntryLegacyRedirect } from '../guards/AuthEntryLegacyRedirect';
import { PreserveSearchRedirect } from '../guards/PreserveSearchRedirect';
import {
  LegacyVehicleConfirmationRedirect,
  LegacyVehicleLookupRedirect,
} from '../guards/LegacyVehicleRouteRedirects';
import {
  LEGACY_JOURNEY_AUTH_REDIRECTS,
  LEGACY_JOURNEY_ENTRY_REDIRECTS,
  LEGACY_JOURNEY_PURCHASE_REDIRECTS,
  QrDeepLinkRoute,
} from '../guards/LegacyJourneyRedirectRoutes';
import { PurchaseIndexRedirect } from '../guards/PurchaseIndexRedirect';
import {
  LEGACY_PURCHASE_FLAT_SEGMENTS,
  LEGACY_PURCHASE_ROUTE_SEGMENTS,
  PURCHASE_ROUTE_PATTERNS,
  PURCHASE_ROUTE_SEGMENTS,
  purchaseJourneyPaths,
} from '../purchase/purchase-routing';
import {
  RequireAuthCompleted,
  RequireSelectedFlow,
  RequireSelectedFlowMatch,
} from '../guards/JourneyRouteGuards';
import { JourneyCompletedScreen } from '../screens/JourneyCompletedScreen';
import { journeyPaths } from '../constants';
import { B2b2cRoutes } from './B2b2cRoutes';
import { EmergencyRoutes } from './EmergencyRoutes';
import { PrepaidRoutes } from './PrepaidRoutes';
import { PurchaseRoutes } from './PurchaseRoutes';
import { JourneySharedAuthRoute } from './JourneySharedAuthRoute';

function PurchaseActivationRoute() {
  return (
    <RequireAuthCompleted>
      <RequireSelectedFlowMatch flow="purchase">
        <PurchaseRoutes />
      </RequireSelectedFlowMatch>
    </RequireAuthCompleted>
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

export function JourneyRoutes() {
  return (
    <div className="journey-frame">
      <Routes>
        <Route path="/" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />

        <Route path={`${journeyPaths.qrDeepLinkPrefix}/:qrCode`} element={<QrDeepLinkRoute />} />

        {LEGACY_JOURNEY_ENTRY_REDIRECTS.map(([from, to]) => (
          <Route key={from} path={from} element={<PreserveSearchRedirect to={to} />} />
        ))}
        {LEGACY_JOURNEY_AUTH_REDIRECTS.map(([from, to]) => (
          <Route key={from} path={from} element={<PreserveSearchRedirect to={to} />} />
        ))}
        {LEGACY_JOURNEY_PURCHASE_REDIRECTS.map(([from, to]) => (
          <Route key={from} path={from} element={<PreserveSearchRedirect to={to} />} />
        ))}

        <Route path={journeyPaths.auth} element={<JourneySharedAuthRoute />} />
        <Route path="/scan" element={<AuthEntryLegacyRedirect />} />
        <Route path={journeyPaths.otp} element={<JourneySharedAuthRoute />} />
        <Route path={journeyPaths.profile} element={<JourneySharedAuthRoute />} />
        <Route path={journeyPaths.legalPrivacy} element={<JourneySharedAuthRoute />} />
        <Route path={journeyPaths.legalTerms} element={<JourneySharedAuthRoute />} />

        <Route path={`${journeyPaths.prepaid}/*`} element={<PrepaidRoutes />} />
        <Route path={`${journeyPaths.b2b2c}/*`} element={<B2b2cRoutes />} />
        <Route
          path={journeyPaths.emergency}
          element={<PreserveSearchRedirect to={emergencyJourneyPaths.riderPrompt} />}
        />
        <Route path={`${journeyPaths.emergency}/*`} element={<EmergencyActivationRoute />} />
        <Route path={journeyPaths.completed} element={<JourneyCompletedScreen />} />

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
          element={<PurchaseActivationRoute />}
        />
        <Route
          path={PURCHASE_ROUTE_PATTERNS.vehicleConfirmation}
          element={<PurchaseActivationRoute />}
        />
        {Object.values(PURCHASE_ROUTE_SEGMENTS).map((segment) => (
          <Route
            key={segment}
            path={`/${segment}`}
            element={<PurchaseActivationRoute />}
          />
        ))}
        {Object.values(LEGACY_PURCHASE_ROUTE_SEGMENTS).map((segment) => (
          <Route
            key={`legacy-${segment}`}
            path={`/${segment}`}
            element={<PurchaseActivationRoute />}
          />
        ))}
        <Route
          path="/journey/purchase/*"
          element={<PreserveSearchRedirect to={purchaseJourneyPaths.vehicleDetails} />}
        />

        <Route path="*" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
      </Routes>
    </div>
  );
}
