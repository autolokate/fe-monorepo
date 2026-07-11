import { Navigate, Route, Routes } from 'react-router-dom';

import { emergencyJourneyPaths } from '../emergency/emergency-routing';
import { PreserveSearchRedirect } from '../guards/PreserveSearchRedirect';
import { PurchaseIndexRedirect } from '../guards/PurchaseIndexRedirect';
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
        <Route path="/journey" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
        <Route path="/journey/home" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
        <Route path="/journey/flow-hub" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
        <Route path="/journey/qr-scan" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
        <Route path="/journey/auth/*" element={<JourneySharedAuthRoute />} />
        <Route
          path="/journey/purchase/qr-scan"
          element={<PurchaseIndexRedirect />}
        />
        <Route path="/journey/purchase" element={<PurchaseIndexRedirect />} />
        <Route path="/journey/purchase/*" element={<PurchaseActivationRoute />} />
        <Route path="/journey/prepaid/*" element={<PrepaidRoutes />} />
        <Route path="/journey/b2b2c/*" element={<B2b2cRoutes />} />
        <Route
          path="/journey/emergency"
          element={<Navigate to={emergencyJourneyPaths.riderPrompt} replace />}
        />
        <Route path="/journey/emergency/*" element={<EmergencyActivationRoute />} />
        <Route path="/journey/completed" element={<JourneyCompletedScreen />} />
        <Route path="*" element={<PreserveSearchRedirect to={journeyPaths.entry} />} />
      </Routes>
    </div>
  );
}
