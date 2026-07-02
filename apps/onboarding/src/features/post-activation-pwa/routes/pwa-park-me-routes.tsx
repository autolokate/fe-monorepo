import { useEffect, useCallback, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AlIcon } from '@autolokate/icons';
import {
  AlButton,
  AlHeading,
  AlPermissionSheet,
  AlPhotoGrid,
  AlPlateInput,
  AlStatusTracker,
  AlText,
  AlVehicleConfirmationCard,
  AlScreenSpinner,
} from '@autolokate/ui';

import {
  isPlateEntryReady,
  normalizePlate,
} from '@/services/vehicle/index.js';
import { useVehicleLookup } from '@/hooks/vehicle/index.js';
import { PWA_STATUS_STEP_MS } from '../constants/pwa-scan-paths.js';
import { pwaScanPaths } from '../constants/pwa-scan-paths.js';
import { PWA_CONSUMER_REPORTER_PLATE, PWA_PARK_ME_LOOKUP_COPY, isDemoPhotoQcFail, parkMeTimelineSteps } from '../data/pwa-demo-data.js';
import { usePwaScan } from '../context/PwaScanContext.js';
import { PwaPhotoRouteGuard } from '../components/PwaPhotoRouteGuard.js';
import { PwaScanErrorBoundary } from '../components/PwaScanErrorBoundary.js';
import { usePwaPhotoCapture } from '../hooks/use-pwa-photo-capture.js';
import { useGeolocationCapture, requestMediaPermissions } from '../hooks/use-geolocation.js';
import { useResolveStoredLocationName } from '../hooks/use-resolve-stored-location-name.js';
import { PwaPermissionRecoveryActions, queryPermissionState } from '../../../pwa/index.js';
import { PwaScanShell } from '../components/PwaScanShell.js';
import { PwaFade } from '../components/PwaMotion.js';
import { formatPwaLocationDetail } from '../utils/format-pwa-location.js';
import { formatReporterModelSummary } from '../utils/pwa-vehicle-utils.js';

import '../styles/pwa-scan.css';

/** 06 · Reporter vehicle plate — Figma 991:2328. */
export function PwaParkMeVehicleNumberRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const [plateError, setPlateError] = useState(false);
  const plateReady = isPlateEntryReady(session.reporterPlate);

  const handleContinue = () => {
    if (!isPlateEntryReady(session.reporterPlate)) {
      setPlateError(true);
      return;
    }
    void navigate(pwaScanPaths.parkMeLookingUp);
  };

  return (
    <PwaScanShell
      variant="protected"
      showBack
      onBack={() => {
        void navigate(pwaScanPaths.vehicle);
      }}
      footer={
        <>
          <p className="pwa-scan-form-helper">Enter your vehicle number</p>
          <AlButton variant="primary" disabled={!plateReady} onClick={handleContinue}>
            Continue
          </AlButton>
        </>
      }
    >
      <PwaFade className="pwa-scan-screen pwa-scan-form-screen">
        <AlHeading variant="h2">Your vehicle number</AlHeading>
        <AlText tone="muted">The car that&apos;s blocked. We&apos;ll share it with the owner.</AlText>
        <AlPlateInput
          value={session.reporterPlate}
          error={plateError}
          onChange={(value) => {
            updateSession({ reporterPlate: value });
            if (plateError) {
              setPlateError(false);
            }
          }}
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 07 · VAHAN lookup spinner. */
export function PwaParkMeLookingUpRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const { lookupVehicle } = useVehicleLookup();

  useEffect(() => {
    let cancelled = false;

    void lookupVehicle(session.reporterPlate).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.status !== 'success') {
        void navigate(pwaScanPaths.parkMeVehicleNumber, { replace: true });
        return;
      }

      const isProtected = normalizePlate(result.plate) === normalizePlate(PWA_CONSUMER_REPORTER_PLATE);
      updateSession({
        reporterPlate: result.plate,
        reporterFields: result.fields,
        reporterProtected: isProtected,
        reporterPlanLabel: isProtected ? 'Shield plan' : null,
      });
      void navigate(
        isProtected ? pwaScanPaths.parkMeConfirmProtected : pwaScanPaths.parkMeConfirm,
        { replace: true },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [lookupVehicle, navigate, session.reporterPlate, updateSession]);

  return (
    <PwaScanShell variant="protected">
      <PwaFade className="pwa-scan-status-body">
        <AlScreenSpinner size="lg" animated aria-label={PWA_PARK_ME_LOOKUP_COPY.title} />
        <AlHeading variant="h2" className="pwa-scan-status-body__title">
          {PWA_PARK_ME_LOOKUP_COPY.title}
        </AlHeading>
        <AlText tone="muted" align="center" className="pwa-scan-status-body__description">
          {PWA_PARK_ME_LOOKUP_COPY.description}
        </AlText>
      </PwaFade>
    </PwaScanShell>
  );
}

/** 08 · Confirm reporter vehicle (plain) — Figma 1034:2351. */
export function PwaParkMeConfirmRoute() {
  const navigate = useNavigate();
  const { session } = usePwaScan();
  const modelSummary = formatReporterModelSummary(session.reporterFields);

  return (
    <PwaScanShell
      variant="protected"
      showBack
      onBack={() => {
        void navigate(pwaScanPaths.parkMeVehicleNumber);
      }}
      footer={
        <AlButton
          variant="primary"
          onClick={() => {
            void navigate(pwaScanPaths.parkMePermissions);
          }}
        >
          Yes, that&apos;s mine
        </AlButton>
      }
    >
      <PwaFade className="pwa-scan-screen pwa-scan-confirm-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Is this your vehicle?</AlHeading>
          <AlText tone="muted">We found these details. Confirm it&apos;s right.</AlText>
        </div>
        <AlVehicleConfirmationCard
          variant="scanner"
          plate={session.reporterPlate}
          model={modelSummary}
          badgeLabel="From your RC records"
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 08b · Confirm reporter vehicle (protected) — Figma 1040:2374. */
export function PwaParkMeConfirmProtectedRoute() {
  const navigate = useNavigate();
  const { session } = usePwaScan();
  const modelSummary = formatReporterModelSummary(session.reporterFields);
  const planLabel = session.reporterPlanLabel ?? 'Shield plan';

  return (
    <PwaScanShell
      variant="protected"
      showBack
      stickyFooter
      onBack={() => {
        void navigate(pwaScanPaths.parkMeVehicleNumber);
      }}
      footer={
        <AlButton
          variant="primary"
          onClick={() => {
            void navigate(pwaScanPaths.parkMePermissions);
          }}
        >
          Yes, that&apos;s mine
        </AlButton>
      }
    >
      <PwaFade className="pwa-scan-screen pwa-scan-confirm-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Is this your vehicle?</AlHeading>
          <AlText tone="muted">Good news, it&apos;s protected by Autolokate.</AlText>
        </div>
        <AlVehicleConfirmationCard
          variant="scanner"
          plate={session.reporterPlate}
          model={modelSummary}
          protected
          badgeLabel={`Protected by Autolokate · ${planLabel}`}
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 09a · Camera & location permission sheet. */
export function PwaParkMePermissionsRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const [sheetOpen, setSheetOpen] = useState(true);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const { requestLocation } = useGeolocationCapture();

  const continueToPhotos = () => {
    setSheetOpen(false);
    void navigate(pwaScanPaths.parkMePhotos);
  };

  const handleAllow = async () => {
    const [cameraGranted, locationResult] = await Promise.all([
      requestMediaPermissions(),
      requestLocation(),
    ]);

    if (!cameraGranted) {
      const cameraState = await queryPermissionState('camera');
      setCameraBlocked(cameraState === 'blocked');
    } else {
      setCameraBlocked(false);
    }

    if (locationResult) {
      updateSession({
        permissionsGranted: cameraGranted,
        location: { lat: locationResult.lat, lng: locationResult.lng },
        locationName: locationResult.name,
        locationDenied: false,
      });
      setLocationBlocked(false);
      continueToPhotos();
      return;
    }

    const locationState = await queryPermissionState('location');
    setLocationBlocked(locationState === 'blocked');
    updateSession({
      permissionsGranted: cameraGranted,
      locationDenied: true,
    });

    if (!cameraGranted || locationState === 'blocked') {
      return;
    }

    continueToPhotos();
  };

  return (
    <PwaScanShell
      variant="protected"
      showBack
      onBack={() => {
        void navigate(session.reporterProtected ? pwaScanPaths.parkMeConfirmProtected : pwaScanPaths.parkMeConfirm);
      }}
    >
      <div className="pwa-scan-permission-backdrop" aria-hidden>
        <AlPhotoGrid
          layout="stacked"
          slots={[
            { id: 'front', label: 'The vehicle blocking you', state: 'empty' },
            { id: 'rear', label: 'Your car, blocked', state: 'empty' },
          ]}
        />
      </div>
      <AlPermissionSheet
        open={sheetOpen}
        title="Allow camera & location"
        description="We need photos of the vehicle and your location so the owner knows where to find you."
        primaryLabel="Allow access"
        onPrimary={() => {
          void handleAllow();
        }}
        secondaryLabel="Not now"
        onSecondary={continueToPhotos}
        onDismiss={continueToPhotos}
      >
        {cameraBlocked || locationBlocked ? (
          <PwaPermissionRecoveryActions
            kind={locationBlocked ? 'location' : 'camera'}
            blocked
            onRetry={() => {
              void handleAllow();
            }}
            onContinue={continueToPhotos}
            continueLabel="Continue without access"
          />
        ) : null}
      </AlPermissionSheet>
    </PwaScanShell>
  );
}

/** 09 · Take two photos + capture location. */
export function PwaParkMePhotosRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const { activeSlot, captureError, clearCaptureError, captureToSlot } = usePwaPhotoCapture(
    'park-me/photos',
    'parkMePhotos',
  );
  const { requestLocation, loading: geoLoading, error: geoError } = useGeolocationCapture();
  useResolveStoredLocationName();

  const handleLocation = useCallback(async () => {
    const result = await requestLocation();
    if (result) {
      updateSession({
        location: { lat: result.lat, lng: result.lng },
        locationName: result.name,
      });
    }
  }, [requestLocation, updateSession]);

  const hasBothPhotos = Boolean(session.parkMePhotos.front && session.parkMePhotos.rear);
  const hasLocation = Boolean(session.location);
  const canContinue = hasBothPhotos && hasLocation;
  const autoLocateRef = useRef(false);

  useEffect(() => {
    if (autoLocateRef.current || hasLocation || geoLoading) {
      return;
    }
    autoLocateRef.current = true;
    void handleLocation();
  }, [geoLoading, handleLocation, hasLocation]);

  return (
    <PwaScanErrorBoundary routeLabel="park-me/photos">
      <PwaPhotoRouteGuard
        routeId="park-me/photos"
        captureError={captureError}
        onDismissCaptureError={clearCaptureError}
        onRetryCapture={() => {
          clearCaptureError();
        }}
        cameraBlocked={Boolean(captureError)}
      >
        <PwaScanShell
          variant="protected"
          showBack
          onBack={() => {
            void navigate(
              session.reporterProtected ? pwaScanPaths.parkMeConfirmProtected : pwaScanPaths.parkMeConfirm,
            );
          }}
          footer={
            <>
              <p className="pwa-scan-photo-helper">
                {canContinue ? 'Ready to send to the owner' : 'Add photos and location to continue'}
              </p>
              <AlButton
                variant="primary"
                disabled={!canContinue}
                onClick={() => {
                  updateSession({ parkMeStatus: 'checking' });
                  void navigate(pwaScanPaths.parkMeStatusChecking);
                }}
              >
                Send to owner
              </AlButton>
            </>
          }
        >
          <PwaFade className="pwa-scan-screen" immediate>
            <AlHeading variant="h2">Add photos and location</AlHeading>
            <AlText tone="muted">Camera only. Your location helps the owner find the spot.</AlText>
            <AlPhotoGrid
              layout="stacked"
              slots={[
                {
                  id: 'front',
                  label: 'The vehicle blocking you',
                  state: activeSlot === 'front' ? 'capturing' : session.parkMePhotos.front ? 'filled' : 'empty',
                  imageUrl: session.parkMePhotos.front,
                  onCapture: () => {
                    void captureToSlot('front');
                  },
                  icon: <AlIcon name="camera" size={32} aria-hidden />,
                },
                {
                  id: 'rear',
                  label: 'Your car, blocked',
                  state: activeSlot === 'rear' ? 'capturing' : session.parkMePhotos.rear ? 'filled' : 'empty',
                  imageUrl: session.parkMePhotos.rear,
                  onCapture: () => {
                    void captureToSlot('rear');
                  },
                  icon: <AlIcon name="camera" size={32} aria-hidden />,
                },
              ]}
              locationCapture={{
                label: hasLocation ? 'Location captured' : 'Share your location',
                detail: formatPwaLocationDetail(session.location, session.locationName),
                filled: hasLocation,
                loading: geoLoading && !hasLocation,
                loadingLabel: 'Fetching your location…',
                onCapture: () => {
                  void handleLocation();
                },
              }}
            />
            {geoError === 'denied' && !hasLocation ? (
              <PwaPermissionRecoveryActions
                kind="location"
                blocked
                onRetry={() => {
                  void handleLocation();
                }}
              />
            ) : null}
          </PwaFade>
        </PwaScanShell>
      </PwaPhotoRouteGuard>
    </PwaScanErrorBoundary>
  );
}

/** 09b · Legacy review route — redirects to unified photos screen. */
export function PwaParkMeReviewRoute() {
  return <Navigate to={pwaScanPaths.parkMePhotos} replace />;
}


/** 11 · Status — calling owner. */
export function PwaParkMeStatusCheckingRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();

  useEffect(() => {
    updateSession({ parkMeStatus: 'checking' });
    const timer = window.setTimeout(() => {
      void navigate(
        isDemoPhotoQcFail(session.name)
          ? pwaScanPaths.parkMePhotoNotClear
          : pwaScanPaths.parkMeStatusCalling,
        { replace: true },
      );
    }, PWA_STATUS_STEP_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate, session.name, updateSession]);

  return (
    <PwaScanShell variant="protected">
      <PwaFade className="pwa-scan-screen pwa-scan-status-timeline-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Reaching the owner</AlHeading>
          <AlText tone="muted">Your report is in. Live updates appear below.</AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={parkMeTimelineSteps.checking}
          variant="park-me"
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 11 · Status — calling owner. */
export function PwaParkMeStatusCallingRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();

  useEffect(() => {
    updateSession({ parkMeStatus: 'calling' });
    const timer = window.setTimeout(() => {
      void navigate(pwaScanPaths.parkMeStatusResolved, { replace: true });
    }, PWA_STATUS_STEP_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate, updateSession]);

  return (
    <PwaScanShell variant="protected">
      <PwaFade className="pwa-scan-screen pwa-scan-status-timeline-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Calling the owner</AlHeading>
          <AlText tone="muted">We confirmed your photo. Reaching the owner now.</AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={parkMeTimelineSteps.calling}
          variant="park-me"
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 12 · Status — owner notified. */
export function PwaParkMeStatusResolvedRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();

  useEffect(() => {
    updateSession({ parkMeStatus: 'resolved' });
  }, [updateSession]);

  return (
    <PwaScanShell
      variant="protected"
      footer={
        <AlButton
          variant="primary"
          onClick={() => {
            void navigate(pwaScanPaths.vehicle);
          }}
        >
          Done
        </AlButton>
      }
    >
      <PwaFade className="pwa-scan-screen pwa-scan-status-timeline-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Owner notified</AlHeading>
          <AlText tone="muted">We reached the owner and asked them to move the vehicle.</AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={parkMeTimelineSteps.resolved}
          variant="park-me"
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 13 · Photo wasn't clear — retake. */
export function PwaParkMePhotoNotClearRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();

  useEffect(() => {
    updateSession({ parkMeStatus: 'photo-error' });
  }, [updateSession]);

  return (
    <PwaScanErrorBoundary routeLabel="park-me/photo-not-clear">
      <PwaPhotoRouteGuard routeId="park-me/photo-not-clear">
        <PwaScanShell
          variant="protected"
          footer={
            <AlButton
              variant="primary"
              onClick={() => {
                updateSession({ parkMePhotos: { front: null, rear: null }, parkMeStatus: 'idle' });
                void navigate(pwaScanPaths.parkMePhotos);
              }}
            >
              Retake photo
            </AlButton>
          }
        >
          <PwaFade className="pwa-scan-screen pwa-scan-status-timeline-screen" immediate>
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Photo wasn&apos;t clear</AlHeading>
          <AlText tone="muted">One of your photos was unclear. Please retake it.</AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={parkMeTimelineSteps.photoError}
          variant="park-me"
        />
      </PwaFade>
        </PwaScanShell>
      </PwaPhotoRouteGuard>
    </PwaScanErrorBoundary>
  );
}
