import { Navigate, Route, Routes } from 'react-router-dom';

import { PrepaidWelcomeScreen } from '../../features/qr-prepaid/screens/prepaid-welcome/index.js';
import { prepaidJourneyPaths } from '../prepaid/prepaid-routing.js';

export function PrepaidRoutes() {
  return (
    <Routes>
      <Route path="welcome" element={<PrepaidWelcomeScreen />} />
      <Route path="*" element={<Navigate to={prepaidJourneyPaths.welcome} replace />} />
    </Routes>
  );
}

export { prepaidJourneyPaths };
