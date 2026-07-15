import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLaunchSplash } from '../platform/AppLaunchSplash';
import { AutolokateRootProvider } from '../platform/AutolokateRootProvider';
import { ThemeProvider } from '../platform/theme/ThemeProvider';
import { AuthSessionRegistrar } from '../platform/auth/AuthSessionRegistrar';
import { DeviceRegistrationRegistrar } from '../platform/device/DeviceRegistrationRegistrar';
import { ScanRoutes } from '../features/post-activation-pwa/routes/ScanRoutes';
import { PwaAppShell } from '../pwa/index';
import { JourneyRoutes } from './routes/JourneyRoutes';
import { JourneyRouteTracker } from './resume/JourneyRouteTracker';
import { LegacyPwaScanRedirect } from './guards/LegacyPwaScanRedirect';
import { ROUTE_NAMESPACE } from './routing/journey-url-routing';

import './journey.css';

/** Top-level router — journey and PWA segments share AutolokateRootProvider. */
export function JourneyOrchestrator() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AutolokateRootProvider>
          <AuthSessionRegistrar />
          <DeviceRegistrationRegistrar />
          <JourneyRouteTracker />
          <AppLaunchSplash>
            <PwaAppShell>
              <Routes>
                <Route path={`${ROUTE_NAMESPACE.scan}/:qrCode/*`} element={<ScanRoutes />} />
                <Route path="/pwa/scan/*" element={<LegacyPwaScanRedirect />} />
                <Route path="*" element={<JourneyRoutes />} />
              </Routes>
            </PwaAppShell>
          </AppLaunchSplash>
        </AutolokateRootProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
