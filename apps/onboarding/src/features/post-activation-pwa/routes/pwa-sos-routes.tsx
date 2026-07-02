import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlIcon } from '@autolokate/icons';
import {
  AlButton,
  AlHeading,
  AlIncidentStatusHero,
  AlPermissionSheet,
  AlPhotoGrid,
  AlScreenSpinner,
  AlStatusTracker,
  AlText,
} from '@autolokate/ui';

import { PwaEmergencyScreen } from '../components/PwaEmergencyScreen.js';
import { PwaScanShell } from '../components/PwaScanShell.js';
import { PwaStatusHeroScreen } from '../components/PwaStatusHeroScreen.js';
import { PwaFade } from '../components/PwaMotion.js';
import { PWA_SOS_HOLD_MS, pwaScanPaths } from '../constants/pwa-scan-paths.js';
import {
  PWA_SOS_HOLD_ENGAGE_MS,
  type PwaSosHoldNavigationState,
} from '../constants/pwa-sos-hold.js';
import { sosTimelineSteps } from '../data/pwa-content.js';
import { usePwaScan } from '../context/PwaScanContext.js';
import { PwaPhotoRouteGuard } from '../components/PwaPhotoRouteGuard.js';
import { PwaScanErrorBoundary } from '../components/PwaScanErrorBoundary.js';
import { usePwaPhotoCapture } from '../hooks/use-pwa-photo-capture.js';
import { useGeolocationCapture } from '../hooks/use-geolocation.js';
import { useHoldProgressFrom } from '../hooks/use-hold-progress-from.js';
import {
  useEmergencySendingFlow,
  useEmergencyTrackerPoll,
  useEmergencyContactsOnlySubmit,
} from '../../../hooks/scanner/index.js';
import { PwaPermissionRecoveryActions, queryPermissionState } from '../../../pwa/index.js';

import '../styles/pwa-scan.css';

type SosPhotoSlot = 'front' | 'rear' | 'left' | 'right';

const SOS_PHOTO_LABELS: Record<SosPhotoSlot, string> = {
  front: 'Front',
  rear: 'Rear',
  left: 'Left',
  right: 'Right',
};

/** 14 · SOS idle — hold to send — Figma 848:278. */
export function PwaSosRoute() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  const [holding, setHolding] = useState(false);
  const [holdStartAt, setHoldStartAt] = useState<number | null>(null);
  const engagedRef = useRef(false);
  const holdingRef = useRef(holding);
  const holdStartAtRef = useRef(holdStartAt);
  holdingRef.current = holding;
  holdStartAtRef.current = holdStartAt;
  const progress = useHoldProgressFrom(holdStartAt, holding, PWA_SOS_HOLD_MS);
  const { requestLocation } = useGeolocationCapture();

  useEffect(() => {
    if (!holding || holdStartAt === null || engagedRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!holdingRef.current || holdStartAtRef.current === null || engagedRef.current) {
        return;
      }
      engagedRef.current = true;
      void navigate(pwaScanPaths.sosHolding, {
        replace: true,
        state: { holdStartAt: holdStartAtRef.current } satisfies PwaSosHoldNavigationState,
      });
    }, PWA_SOS_HOLD_ENGAGE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [holding, holdStartAt, navigate]);

  const handleLocationCheck = async () => {
    const result = await requestLocation();
    if (result) {
      updateSession({
        location: { lat: result.lat, lng: result.lng },
        locationName: result.name,
        locationDenied: false,
      });
      return;
    }
    updateSession({ locationDenied: true });
    void navigate(pwaScanPaths.sosAllowLocation);
  };

  return (
    <PwaEmergencyScreen
      showBack
      onBack={() => {
        void navigate(pwaScanPaths.sosLeaveConfirm);
      }}
      holdButton={{
        holding,
        progress,
        onHoldStart: () => {
          const startedAt = performance.now();
          engagedRef.current = false;
          setHoldStartAt(startedAt);
          setHolding(true);
        },
        onHoldEnd: () => {
          setHolding(false);
          setHoldStartAt(null);
          engagedRef.current = false;
        },
      }}
      onLocationChip={() => {
        void handleLocationCheck();
      }}
    />
  );
}

/** 14b · SOS holding progress — Figma 1092:2499. */
export function PwaSosHoldingRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateSession } = usePwaScan();
  const navState = location.state as PwaSosHoldNavigationState | null;
  const holdStartAt = navState?.holdStartAt ?? null;
  const progress = useHoldProgressFrom(holdStartAt, holdStartAt !== null, PWA_SOS_HOLD_MS);
  const holdActive = holdStartAt !== null && progress < 1;

  useEffect(() => {
    if (holdStartAt === null) {
      void navigate(pwaScanPaths.sos, { replace: true });
    }
  }, [holdStartAt, navigate]);

  useEffect(() => {
    updateSession({ sosStatus: 'holding' });
  }, [updateSession]);

  useEffect(() => {
    if (progress >= 1) {
      updateSession({ sosStatus: 'scene' });
      void navigate(pwaScanPaths.sosScenePhotos, { replace: true });
    }
  }, [navigate, progress, updateSession]);

  return (
    <PwaEmergencyScreen
      showBack
      onBack={() => {
        void navigate(pwaScanPaths.sosLeaveConfirm);
      }}
      holdButton={{
        holding: holdActive,
        playAlertTone: holdActive,
        progress,
        label: 'Keep\nholding',
        onHoldEnd: () => {
          if (progress < 1) {
            void navigate(pwaScanPaths.sos, { replace: true });
          }
        },
      }}
      onLocationChip={() => {
        void navigate(pwaScanPaths.sosAllowLocation);
      }}
    />
  );
}

/** 14c · Allow location sheet — Figma 1110:2471. */
export function PwaSosAllowLocationRoute() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  const { requestLocation } = useGeolocationCapture();
  const [locationBlocked, setLocationBlocked] = useState(false);

  const handleAllow = async () => {
    const result = await requestLocation();
    if (result) {
      updateSession({
        location: { lat: result.lat, lng: result.lng },
        locationName: result.name,
        locationDenied: false,
      });
      setLocationBlocked(false);
      void navigate(pwaScanPaths.sos, { replace: true });
      return;
    }

    const locationState = await queryPermissionState('location');
    setLocationBlocked(locationState === 'blocked' || locationState === 'unknown');
    updateSession({ locationDenied: true });

    if (locationState === 'blocked') {
      return;
    }

    void navigate(pwaScanPaths.sosLocationUnavailable, { replace: true });
  };

  const continueWithoutLocation = () => {
    updateSession({ locationDenied: true, sosStatus: 'contacts-only' });
    void navigate(pwaScanPaths.sosContactsOnly, { replace: true });
  };

  return (
    <PwaEmergencyScreen
      showBack
      onBack={() => {
        void navigate(pwaScanPaths.sos);
      }}
      holdButton={{ holding: false, progress: 0 }}
      onLocationChip={() => {
        void handleAllow();
      }}
      overlay={
        <AlPermissionSheet
          open
          title="Share your location"
          description="We use it to send help to the right spot. It stays with Autolokate."
          primaryLabel="Allow location"
          onPrimary={() => {
            void handleAllow();
          }}
          secondaryLabel="Alert contacts only"
          onSecondary={continueWithoutLocation}
          onDismiss={() => {
            void navigate(pwaScanPaths.sos, { replace: true });
          }}
        >
          {locationBlocked ? (
            <PwaPermissionRecoveryActions
              kind="location"
              blocked
              onRetry={() => {
                void handleAllow();
              }}
              onContinue={continueWithoutLocation}
              continueLabel="Alert contacts only"
            />
          ) : null}
        </AlPermissionSheet>
      }
    />
  );
}

/** 14d · Leave confirm sheet — Figma 1113:2486. */
export function PwaSosLeaveConfirmRoute() {
  const navigate = useNavigate();

  return (
    <PwaEmergencyScreen
      showBack
      onBack={() => {
        void navigate(pwaScanPaths.sos, { replace: true });
      }}
      holdButton={{ holding: false, progress: 0 }}
      overlay={
        <AlPermissionSheet
          open
          title="Leave emergency?"
          description="Help has not been sent yet. Are you sure you want to leave?"
          primaryLabel="Stay on this screen"
          onPrimary={() => {
            void navigate(pwaScanPaths.sos, { replace: true });
          }}
          secondaryLabel="Leave anyway"
          onSecondary={() => {
            void navigate(pwaScanPaths.vehicle, { replace: true });
          }}
          onDismiss={() => {
            void navigate(pwaScanPaths.sos, { replace: true });
          }}
        />
      }
    />
  );
}

/** 15 · Scene photos — optional four-angle capture. */
export function PwaSosScenePhotosRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  const { activeSlot, captureError, clearCaptureError, captureToSlot } = usePwaPhotoCapture(
    'sos/scene-photos',
    'sosPhotos',
    { kind: 'emergency', photoIdsField: 'sosPhotoIds' },
  );

  const filledCount = (Object.keys(session.sosPhotos) as SosPhotoSlot[]).filter(
    (slot) => session.sosPhotos[slot],
  ).length;
  const hasPhotos = filledCount > 0;
  const prevFilledCountRef = useRef(filledCount);

  useEffect(() => {
    if (filledCount === 4 && prevFilledCountRef.current < 4) {
      void navigate(pwaScanPaths.sosScenePhotosCaptured, { replace: true });
    }
    prevFilledCountRef.current = filledCount;
  }, [filledCount, navigate]);

  return (
    <PwaScanErrorBoundary routeLabel="sos/scene-photos">
      <PwaPhotoRouteGuard
        routeId="sos/scene-photos"
        captureError={captureError}
        onDismissCaptureError={clearCaptureError}
        onRetryCapture={clearCaptureError}
        cameraBlocked={Boolean(captureError)}
      >
        <PwaScanShell
          variant="emergency"
          showBack
          onBack={() => {
            updateSession({ sosStatus: 'idle' });
            void navigate(pwaScanPaths.sos, { replace: true });
          }}
          footer={
            <AlButton
              variant="primary"
              onClick={() => {
                void navigate(pwaScanPaths.sosSending);
              }}
            >
              {hasPhotos ? 'Continue' : 'Send without photos'}
            </AlButton>
          }
        >
          <PwaFade className="pwa-scan-screen pwa-scan-scene-photos-screen" immediate>
            <AlHeading variant="h2">Add photos of the scene</AlHeading>
            <AlText tone="muted">Optional. Clear photos help responders reach you faster.</AlText>
            <AlPhotoGrid
              layout="quad"
              slots={(Object.keys(SOS_PHOTO_LABELS) as SosPhotoSlot[]).map((slot) => ({
                id: slot,
                label: SOS_PHOTO_LABELS[slot],
                state:
                  activeSlot === slot ? 'capturing' : session.sosPhotos[slot] ? 'filled' : 'empty',
                imageUrl: session.sosPhotos[slot],
                onCapture: () => {
                  void captureToSlot(slot);
                },
                icon: <AlIcon name="camera" size={24} aria-hidden />,
              }))}
            />
          </PwaFade>
        </PwaScanShell>
      </PwaPhotoRouteGuard>
    </PwaScanErrorBoundary>
  );
}

/** 15b · Scene photos captured — review — Figma 1148:2509. */
export function PwaSosScenePhotosCapturedRoute() {
  const navigate = useNavigate();
  const { session } = usePwaScan();
  const { captureError, clearCaptureError, captureToSlot } = usePwaPhotoCapture(
    'sos/scene-photos/captured',
    'sosPhotos',
    { kind: 'emergency', photoIdsField: 'sosPhotoIds' },
  );

  return (
    <PwaScanErrorBoundary routeLabel="sos/scene-photos/captured">
      <PwaPhotoRouteGuard
        routeId="sos/scene-photos/captured"
        captureError={captureError}
        onDismissCaptureError={clearCaptureError}
        onRetryCapture={clearCaptureError}
        cameraBlocked={Boolean(captureError)}
      >
        <PwaScanShell
          variant="emergency"
          showBack
          onBack={() => {
            void navigate(pwaScanPaths.sosScenePhotos);
          }}
          footer={
            <AlButton
              variant="primary"
              onClick={() => {
                void navigate(pwaScanPaths.sosSending);
              }}
            >
              Send now
            </AlButton>
          }
        >
          <PwaFade className="pwa-scan-screen pwa-scan-scene-photos-screen" immediate>
            <div className="pwa-scan-screen__intro">
              <AlHeading variant="h2">Check and send</AlHeading>
              <AlText tone="muted">Photos captured. Retake any side if needed.</AlText>
            </div>
            <AlPhotoGrid
              layout="review-quad"
              reviewPhotos={(Object.keys(SOS_PHOTO_LABELS) as SosPhotoSlot[]).map((slot) => ({
                id: slot,
                imageUrl: session.sosPhotos[slot],
                retakeLabel: `Retake ${SOS_PHOTO_LABELS[slot]} photo`,
                onRetake: () => {
                  void captureToSlot(slot);
                },
              }))}
            />
          </PwaFade>
        </PwaScanShell>
      </PwaPhotoRouteGuard>
    </PwaScanErrorBoundary>
  );
}

/** 16 · Location unavailable. */
export function PwaSosLocationUnavailableRoute() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  const { requestLocation } = useGeolocationCapture();

  const handleRetryLocation = async () => {
    const result = await requestLocation();
    if (!result) {
      return;
    }
    updateSession({
      location: { lat: result.lat, lng: result.lng },
      locationName: result.name,
      locationDenied: false,
    });
    void navigate(pwaScanPaths.sos, { replace: true });
  };

  return (
    <PwaStatusHeroScreen
      variant="emergency"
      title="We need your location"
      description="Responders can't reach the spot without it. Turn it on to send help, or alert their contacts only."
      visual={<AlIncidentStatusHero scene="location-unavailable" />}
      footer={
        <div className="pwa-scan-footer-stack">
          <button
            type="button"
            className="pwa-scan-footer-stack__link"
            onClick={() => {
              updateSession({ sosStatus: 'contacts-only' });
              void navigate(pwaScanPaths.sosContactsOnly);
            }}
          >
            Alert contacts only
          </button>
          <PwaPermissionRecoveryActions
            kind="location"
            blocked
            onRetry={() => {
              void handleRetryLocation();
            }}
          />
          <AlButton
            variant="primary"
            onClick={() => {
              void navigate(pwaScanPaths.sosAllowLocation);
            }}
          >
            Turn on location
          </AlButton>
        </div>
      }
    />
  );
}

/** 17 · Sending alert — Figma 1177:2545. */
export function PwaSosSendingRoute() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();
  useEmergencySendingFlow();

  return (
    <PwaScanShell
      variant="emergency"
      footer={
        <AlButton
          variant="secondary"
          onClick={() => {
            updateSession({ sosStatus: 'cancelled' });
            void navigate(pwaScanPaths.sosAlertCancelled);
          }}
        >
          I&apos;m safe, cancel alert
        </AlButton>
      }
    >
      <PwaFade className="pwa-scan-sos-sending">
        <div className="pwa-scan-sos-sending__aura">
          <AlScreenSpinner size="lg" animated tone="emergency" aria-label="Sending your alert" />
        </div>
        <AlHeading variant="h2">Sending your alert</AlHeading>
        <AlText tone="muted">
          Sharing your photo, location and the vehicle with emergency services.
        </AlText>
      </PwaFade>
    </PwaScanShell>
  );
}

/** 18 · Couldn't send — network failure. */
export function PwaSosCouldntSendRoute() {
  const navigate = useNavigate();

  return (
    <PwaStatusHeroScreen
      variant="emergency"
      title="Couldn't send the alert"
      description="Your connection dropped. We'll keep trying automatically."
      visual={<AlIncidentStatusHero scene="couldnt-send" />}
      footer={
        <AlButton
          variant="primary"
          onClick={() => {
            void navigate(pwaScanPaths.sosSending);
          }}
        >
          Retry now
        </AlButton>
      }
    />
  );
}

/** 19 · Help on the way — alert received — Figma 849:321. */
export function PwaSosHelpReceivedRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  useEmergencyTrackerPoll();

  useEffect(() => {
    updateSession({ sosStatus: 'help-received' });
  }, [updateSession]);

  return (
    <PwaScanShell
      variant="emergency"
      stickyFooter
      footer={
        <AlButton
          variant="secondary"
          onClick={() => {
            updateSession({ sosStatus: 'cancelled' });
            void navigate(pwaScanPaths.sosAlertCancelled);
          }}
        >
          I&apos;m safe, cancel alert
        </AlButton>
      }
    >
      <PwaFade className="pwa-scan-screen pwa-scan-status-timeline-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Help is on the way</AlHeading>
          <AlText tone="muted">Autolokate is handling it. Live updates below.</AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={sosTimelineSteps.received}
          variant="sos"
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 20 · Help dispatched — Figma 870:2145. */
export function PwaSosHelpDispatchedRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  useEmergencyTrackerPoll();

  useEffect(() => {
    updateSession({ sosStatus: 'dispatched' });
  }, [updateSession]);

  return (
    <PwaScanShell
      variant="emergency"
      stickyFooter
      footer={
        <AlButton
          variant="secondary"
          onClick={() => {
            updateSession({ sosStatus: 'cancelled' });
            void navigate(pwaScanPaths.sosAlertCancelled);
          }}
        >
          I&apos;m safe, cancel alert
        </AlButton>
      }
    >
      <PwaFade className="pwa-scan-screen pwa-scan-status-timeline-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Help is on the way</AlHeading>
          <AlText tone="muted">Ambulance dispatched. Live updates below.</AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={sosTimelineSteps.dispatched}
          variant="sos"
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 21 · Incident resolved — Figma 871:2151. */
export function PwaSosResolvedRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();

  useEffect(() => {
    updateSession({ sosStatus: 'resolved' });
  }, [updateSession]);

  return (
    <PwaScanShell
      variant="protected"
      stickyFooter
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
          <AlHeading variant="h2">Incident resolved</AlHeading>
          <AlText tone="muted">Help arrived. Thank you for stepping in.</AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={sosTimelineSteps.resolved}
          variant="sos"
        />
      </PwaFade>
    </PwaScanShell>
  );
}

/** 22 · Alert cancelled. */
export function PwaSosAlertCancelledRoute() {
  const navigate = useNavigate();
  const { updateSession } = usePwaScan();

  useEffect(() => {
    updateSession({ sosStatus: 'cancelled' });
  }, [updateSession]);

  return (
    <PwaStatusHeroScreen
      variant="protected"
      title="Alert cancelled"
      description="We've told Autolokate this was a false alarm. No help will be sent."
      visual={<AlIncidentStatusHero scene="alert-cancelled" variant="neutral" />}
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
    />
  );
}

/** 23 · Contacts alerted without location. */
export function PwaSosContactsOnlyRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePwaScan();
  useEmergencyContactsOnlySubmit();

  useEffect(() => {
    updateSession({ sosStatus: 'contacts-only' });
  }, [updateSession]);

  return (
    <PwaScanShell
      variant="emergency"
      footer={
        <AlButton
          variant="secondary"
          onClick={() => {
            void navigate(pwaScanPaths.sosAllowLocation);
          }}
        >
          Turn on location
        </AlButton>
      }
    >
      <PwaFade className="pwa-scan-screen pwa-scan-status-timeline-screen">
        <div className="pwa-scan-screen__intro">
          <AlHeading variant="h2">Alerting their contacts</AlHeading>
          <AlText tone="muted">
            No location yet, so we&apos;re reaching the owner&apos;s contacts by call and message
          </AlText>
        </div>
        <AlStatusTracker
          plate={session.scannedVehicle.plate}
          model={session.scannedVehicle.modelSummary}
          steps={sosTimelineSteps.contactsOnly}
          variant="contacts"
        />
      </PwaFade>
    </PwaScanShell>
  );
}
