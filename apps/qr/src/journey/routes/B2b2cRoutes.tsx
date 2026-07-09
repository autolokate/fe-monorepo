import { Navigate, Route, Routes } from 'react-router-dom';

import { PartnerWelcomeScreen } from '../../features/qr-b2b2c/screens/partner-welcome/index.js';
import { b2b2cJourneyPaths } from '../b2b2c/b2b2c-routing.js';

export function B2b2cRoutes() {
  return (
    <Routes>
      <Route path="welcome" element={<PartnerWelcomeScreen variant="plan-only" />} />
      <Route
        path="welcome/plan-rider"
        element={<PartnerWelcomeScreen variant="plan-rider" />}
      />
      <Route path="*" element={<Navigate to={b2b2cJourneyPaths.welcome} replace />} />
    </Routes>
  );
}

export { b2b2cJourneyPaths };
