import { Navigate, Route, Routes } from 'react-router-dom';

import { emergencyJourneyPaths } from '../emergency/emergency-routing.js';
import { PurchaseIndexRedirect } from '../guards/PurchaseIndexRedirect.js';
import {
  RequireAuthCompleted,
  RequireSelectedFlow,
  RequireSelectedFlowMatch,
} from '../guards/JourneyRouteGuards.js';
import { FlowEntryScreen } from '../screens/FlowEntryScreen.js';
import { FlowHubScreen } from '../screens/FlowHubScreen.js';
import { JourneyCompletedScreen } from '../screens/JourneyCompletedScreen.js';
import { journeyPaths } from '../constants.js';
import { B2b2cRoutes } from './B2b2cRoutes.js';
import { EmergencyRoutes } from './EmergencyRoutes.js';
import { PrepaidRoutes } from './PrepaidRoutes.js';
import { PurchaseRoutes } from './PurchaseRoutes.js';
import { JourneySharedAuthRoute } from './JourneySharedAuthRoute.js';

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
        <Route path="/" element={<Navigate to={journeyPaths.root} replace />} />
        <Route path="/journey" element={<FlowEntryScreen />} />
        <Route path="/journey/home" element={<Navigate to={journeyPaths.root} replace />} />
        <Route path="/journey/flow-hub" element={<FlowHubScreen />} />
        <Route path="/journey/auth/*" element={<JourneySharedAuthRoute />} />
        {/* R01 · Scan sticker — pre-auth marketing; QR entry assumed before onboarding */}
        <Route path="/journey/qr-scan" element={<Navigate to={journeyPaths.root} replace />} />
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
        <Route path="*" element={<Navigate to={journeyPaths.root} replace />} />
      </Routes>
    </div>
  );
}
