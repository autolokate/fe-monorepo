import { Navigate, Route, Routes } from 'react-router-dom';

import { pwaScanPaths } from '../constants/pwa-scan-paths.js';
import { PwaScanErrorBoundary } from '../components/PwaScanErrorBoundary.js';
import {
  PwaLoadingRoute,
  PwaVehicleFoundRoute,
  PwaVerifyMobileRoute,
  PwaVerifyOtpRoute,
  PwaVerifyNameRoute,
} from './pwa-shared-routes.js';
import {
  PwaParkMeVehicleNumberRoute,
  PwaParkMeLookingUpRoute,
  PwaParkMeConfirmRoute,
  PwaParkMeConfirmProtectedRoute,
  PwaParkMePermissionsRoute,
  PwaParkMePhotosRoute,
  PwaParkMeReviewRoute,
  PwaParkMeStatusCheckingRoute,
  PwaParkMeStatusCallingRoute,
  PwaParkMeStatusResolvedRoute,
  PwaParkMePhotoNotClearRoute,
} from './pwa-park-me-routes.js';
import {
  PwaSosRoute,
  PwaSosHoldingRoute,
  PwaSosAllowLocationRoute,
  PwaSosLeaveConfirmRoute,
  PwaSosScenePhotosRoute,
  PwaSosScenePhotosCapturedRoute,
  PwaSosLocationUnavailableRoute,
  PwaSosSendingRoute,
  PwaSosCouldntSendRoute,
  PwaSosHelpReceivedRoute,
  PwaSosHelpDispatchedRoute,
  PwaSosResolvedRoute,
  PwaSosAlertCancelledRoute,
  PwaSosContactsOnlyRoute,
} from './pwa-sos-routes.js';
import { PwaScanQrEntryRedirect } from './PwaScanQrEntry.js';

/** Post-Activation PWA — all 30 frames under /pwa/scan/*. Provider mounted at AutolokateRootProvider. */
export function PwaScanRoutes() {
  return (
    <PwaScanErrorBoundary routeLabel="pwa-scan">
      <Routes>
        <Route path="/" element={<PwaScanQrEntryRedirect />} />
        <Route path="loading" element={<PwaLoadingRoute />} />
        <Route path="vehicle" element={<PwaVehicleFoundRoute />} />
        <Route path="verify/mobile" element={<PwaVerifyMobileRoute />} />
        <Route path="verify/otp" element={<PwaVerifyOtpRoute />} />
        <Route path="verify/name" element={<PwaVerifyNameRoute />} />

        <Route path="park-me/vehicle-number" element={<PwaParkMeVehicleNumberRoute />} />
        <Route path="park-me/looking-up" element={<PwaParkMeLookingUpRoute />} />
        <Route path="park-me/confirm" element={<PwaParkMeConfirmRoute />} />
        <Route path="park-me/confirm-protected" element={<PwaParkMeConfirmProtectedRoute />} />
        <Route path="park-me/permissions" element={<PwaParkMePermissionsRoute />} />
        <Route path="park-me/photos" element={<PwaParkMePhotosRoute />} />
        <Route path="park-me/review" element={<PwaParkMeReviewRoute />} />
        <Route path="park-me/status/checking" element={<PwaParkMeStatusCheckingRoute />} />
        <Route path="park-me/status/calling" element={<PwaParkMeStatusCallingRoute />} />
        <Route path="park-me/status/resolved" element={<PwaParkMeStatusResolvedRoute />} />
        <Route path="park-me/photo-not-clear" element={<PwaParkMePhotoNotClearRoute />} />

        <Route path="sos" element={<PwaSosRoute />} />
        <Route path="sos/holding" element={<PwaSosHoldingRoute />} />
        <Route path="sos/allow-location" element={<PwaSosAllowLocationRoute />} />
        <Route path="sos/leave-confirm" element={<PwaSosLeaveConfirmRoute />} />
        <Route path="sos/scene-photos" element={<PwaSosScenePhotosRoute />} />
        <Route path="sos/scene-photos/captured" element={<PwaSosScenePhotosCapturedRoute />} />
        <Route path="sos/location-unavailable" element={<PwaSosLocationUnavailableRoute />} />
        <Route path="sos/sending" element={<PwaSosSendingRoute />} />
        <Route path="sos/couldnt-send" element={<PwaSosCouldntSendRoute />} />
        <Route path="sos/help-received" element={<PwaSosHelpReceivedRoute />} />
        <Route path="sos/help-dispatched" element={<PwaSosHelpDispatchedRoute />} />
        <Route path="sos/resolved" element={<PwaSosResolvedRoute />} />
        <Route path="sos/alert-cancelled" element={<PwaSosAlertCancelledRoute />} />
        <Route path="sos/contacts-only" element={<PwaSosContactsOnlyRoute />} />

        <Route path="*" element={<Navigate to={pwaScanPaths.loading} replace />} />
      </Routes>
    </PwaScanErrorBoundary>
  );
}
