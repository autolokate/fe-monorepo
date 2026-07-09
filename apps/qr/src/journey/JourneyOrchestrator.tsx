import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLaunchSplash } from '../platform/AppLaunchSplash.js';
import { AutolokateRootProvider } from '../platform/AutolokateRootProvider.js';
import { ThemeProvider } from '../platform/theme/ThemeProvider.js';
import { AuthSessionRegistrar } from '../platform/auth/AuthSessionRegistrar.js';
import { DeviceRegistrationRegistrar } from '../platform/device/DeviceRegistrationRegistrar.js';
import { PwaScanRoutes } from '../features/post-activation-pwa/routes/PwaScanRoutes.js';
import { PwaAppShell } from '../pwa/index.js';
import { JourneyRoutes } from './routes/JourneyRoutes.js';
import { JourneyRouteTracker } from './resume/JourneyRouteTracker.js';

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
