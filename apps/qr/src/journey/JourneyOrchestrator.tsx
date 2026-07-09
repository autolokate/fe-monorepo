import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLaunchSplash } from '../platform/AppLaunchSplash';
import { AutolokateRootProvider } from '../platform/AutolokateRootProvider';
import { ThemeProvider } from '../platform/theme/ThemeProvider';
import { AuthSessionRegistrar } from '../platform/auth/AuthSessionRegistrar';
import { DeviceRegistrationRegistrar } from '../platform/device/DeviceRegistrationRegistrar';
import { PwaScanRoutes } from '../features/post-activation-pwa/routes/PwaScanRoutes';
import { PwaAppShell } from '../pwa/index';
import { JourneyRoutes } from './routes/JourneyRoutes';
import { JourneyRouteTracker } from './resume/JourneyRouteTracker';

import './journey.css';

/** Top-level router — both journey and PWA segments share AutolokateRootProvider. */
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
              <Route path="/pwa/scan/*" element={<PwaScanRoutes />} />
              <Route path="*" element={<JourneyRoutes />} />
            </Routes>
          </PwaAppShell>
        </AppLaunchSplash>
        </AutolokateRootProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
