import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { formatPlateInput } from '@autolokate/ui';

import {
  isPlateEntryReady,
  normalizePlate,
} from '../../../services/vehicle/index';
import { compactPlate } from '@/services/vehicle/vehicle-plate';
import { useVehicleLookup } from '../../../hooks/vehicle/index';
import {
  R03VehicleNumberScreen,
  R04FetchingVehicleScreen,
  R04bFetchFailedScreen,
  R05ConfirmVehicleScreen,
} from '../../../features/qr-purchase/screens/index';
import type { PurchaseVehiclePlateState } from '../../../features/qr-purchase/types-vehicle';
import { DEFAULT_PURCHASE_PLAN_ID } from '../../../features/qr-purchase/data/purchase-plans';
import { useQrAttach } from '../../../hooks/qr/index';
import { getStoredPurchaseQrResolve, resolveQrCode } from '@/services/qr/qr-service';
import { persistQrCodeFromUrl } from '@/platform/qr/qr-code-from-url';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { reportUserError } from '@/platform/feedback/index';
import { getEmergencyHandoffPath } from '../../activation-routing';
import { persistVehicleContext } from '@/services/purchase/purchase-context-service';
import { resetAttachAttemptCache } from '@/services/qr/qr-attach-service';
import { qrAttachLogger } from '@/services/qr/qr-attach-logger';
import { qrLogger } from '@/services/qr/qr-logger';
import { vehicleLogger } from '@/services/vehicle/vehicle-logger';
import {
  getRiderOptionsForPlan,
  isPlanRiderEligible,
} from '@/services/plan/plan-mapper';
import { getPurchasePlansCatalog } from '@/services/plan/plan-service';
import { useJourney } from '../../JourneyContext';
import {
  purchaseJourneyPaths,
  purchaseVehicleConfirmationPath,
  purchaseVehicleLookupPath,
} from '../../purchase/purchase-paths-runtime';
import { usePurchaseCheckout } from './purchase-route-shared';

export function VehicleDetailsRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session, updateSession } = useJourney();
  const vehicle = session.vehicle ?? {};

  const blockedMessage =
    typeof (location.state as { vehicleBlockedMessage?: unknown } | null)?.vehicleBlockedMessage ===
    'string'
      ? (location.state as { vehicleBlockedMessage: string }).vehicleBlockedMessage
      : null;

  const [plate, setPlate] = useState(() => formatPlateInput(vehicle.plate ?? ''));
  const [plateState, setPlateState] = useState<PurchaseVehiclePlateState>(() => {
    if (blockedMessage) {
      return 'error';
    }
    if (vehicle.fetchStatus === 'not-found') {
      return 'error';
    }
    if (vehicle.plate?.trim()) {
      return 'filled';
    }
    return 'empty';
  });
  const [plateErrorMessage, setPlateErrorMessage] = useState<string | undefined>(() =>
    blockedMessage ?? undefined,
  );

  useEffect(() => {
    if (!blockedMessage) {
      return;
    }
    setPlateState('error');
    setPlateErrorMessage(blockedMessage);
    // Clear one-shot navigation state so refresh doesn't keep the attach error.
    void navigate(location.pathname + location.search, { replace: true, state: null });
  }, [blockedMessage, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (vehicle.fetchStatus === 'not-found' && !plateErrorMessage) {
      setPlateState('error');
    }
  }, [plateErrorMessage, vehicle.fetchStatus]);

  useEffect(() => {
    persistQrCodeFromUrl(searchParams);
    const stored = getStoredPurchaseQrResolve();
    if (stored.ok) {
      return;
    }

    const code = resolvePurchaseQrCode(searchParams);
    if (!code) {
      reportUserError(qrLogger, 'purchase_resolve_missing', stored.error, stored.error.message);
      return;
    }

    void resolveQrCode(code).then((result) => {
      if (!result.ok) {
        reportUserError(qrLogger, 'purchase_resolve_refresh_failed', result.error, result.error.message);
      }
    });
  }, [searchParams]);

  const handleFetch = useCallback(() => {
    const normalized = normalizePlate(plate);

    if (!isPlateEntryReady(normalized)) {
      updateSession({
        vehicle: {
          ...vehicle,
          plate: normalized,
          fetchStatus: 'not-found',
        },
      });
      setPlateErrorMessage(undefined);
      setPlateState('error');
      return;
    }

    updateSession({
      vehicle: {
        ...vehicle,
        plate: normalized,
        fetchStatus: 'fetching',
      },
    });
    setPlateErrorMessage(undefined);
    void navigate(purchaseVehicleLookupPath(normalized));
  }, [navigate, plate, updateSession, vehicle]);

  return (
    <R03VehicleNumberScreen
      plateValue={plate}
      plateState={plateState}
      plateErrorMessage={plateErrorMessage}
      onPlateChange={(value) => {
        setPlate(value);
        if (plateState === 'error') {
          setPlateState(value.trim() ? 'filled' : 'empty');
          setPlateErrorMessage(undefined);
          updateSession({
            vehicle: {
              ...vehicle,
              plate: normalizePlate(value),
              fetchStatus: 'idle',
            },
          });
        } else {
          setPlateState(value.trim() ? 'filled' : 'empty');
        }
      }}
      onBack={() => {
        void navigate(purchaseJourneyPaths.choosePlan);
      }}
      showBack
      onContinue={handleFetch}
    />
  );
}

export function VehicleLookupRoute({ registrationNumber }: { registrationNumber: string }) {
  const navigate = useNavigate();
  const { session, updateSession } = useJourney();
  const { lookupVehicle } = useVehicleLookup();
  const plate = session.vehicle?.plate ?? registrationNumber;

  useEffect(() => {
    if (!plate) {
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
      return;
    }

    if (compactPlate(normalizePlate(plate)) !== compactPlate(normalizePlate(registrationNumber))) {
      void navigate(purchaseVehicleLookupPath(plate), { replace: true });
      return;
    }

    if (!isPlateEntryReady(plate)) {
      updateSession({
        vehicle: {
          plate: normalizePlate(plate),
          fetchStatus: 'not-found',
        },
      });
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
      return;
    }

    const abortController = new AbortController();

    void (async () => {
      const result = await lookupVehicle(plate);

      if (abortController.signal.aborted) {
        return;
      }

      if (result.status === 'success') {
        updateSession({
          vehicle: {
            plate: result.plate,
            fields: result.fields,
            fetchStatus: 'success',
          },
        });
        void navigate(purchaseVehicleConfirmationPath(result.plate), { replace: true });
        return;
      }

      if (result.status === 'error') {
        // Dedicated R04b failure screen — no snackbar (single error surface).
        reportUserError(
          vehicleLogger,
          'purchase_vehicle_lookup_failed',
          result,
          'Unable to fetch vehicle details. Please try again.',
          { toast: false },
        );
      }

      updateSession({
        vehicle: {
          plate: result.plate,
          fetchStatus: 'error',
        },
      });
      void navigate(purchaseJourneyPaths.vehicleLookupFailed, { replace: true });
    })();

    return () => {
      abortController.abort();
    };
  }, [lookupVehicle, navigate, plate, registrationNumber, updateSession]);

  return <R04FetchingVehicleScreen />;
}

export function VehicleLookupFailedRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = usePurchaseCheckout();
  const vehicle = session.vehicle ?? {};

  return (
    <R04bFetchFailedScreen
      onRetry={() => {
        updateSession({
          vehicle: {
            ...vehicle,
            fetchStatus: 'idle',
          },
        });
        void navigate(purchaseJourneyPaths.vehicleDetails);
      }}
      onEnterManually={() => {
        updateSession({
          vehicle: {
            ...vehicle,
            fetchStatus: 'not-found',
          },
        });
        void navigate(purchaseJourneyPaths.vehicleDetails);
      }}
    />
  );
}

export function VehicleConfirmationRoute({ registrationNumber }: { registrationNumber: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, updateSession, setPhase, selectedFlow } = useJourney();
  const { attachPurchaseQr, isPending: isAttachPending } = useQrAttach();
  const vehicle = session.vehicle ?? {};
  const attachStartedRef = useRef(false);
  const selectedPlanId = session.purchase?.selectedPlanId ?? DEFAULT_PURCHASE_PLAN_ID;
  const selectedRiderCount = session.purchase?.riderCount ?? 0;

  const proceedAfterActivation = useCallback(() => {
    persistVehicleContext({
      registration: vehicle.plate ?? '',
      fields: vehicle.fields,
      ownerName: session.auth?.ownerName,
      languageId: session.auth?.languageId,
      selectedPlanId,
      riderCount: selectedRiderCount,
    });

    const nextSession = {
      ...session,
      vehicle: {
        ...vehicle,
        confirmed: true,
      },
      emergency: {
        ...session.emergency,
        riderSkipped: false,
      },
      purchase: {
        ...session.purchase,
        selectedPlanId,
        riderCount: selectedRiderCount,
        checkoutReady: true,
      },
    };
    flushSync(() => {
      updateSession({
        vehicle: nextSession.vehicle,
        emergency: nextSession.emergency,
        purchase: nextSession.purchase,
      });
      setPhase('emergency');
    });
    void navigate(getEmergencyHandoffPath(nextSession, selectedFlow ?? 'purchase'), {
      replace: true,
    });
  }, [
    navigate,
    selectedFlow,
    selectedPlanId,
    selectedRiderCount,
    session,
    setPhase,
    updateSession,
    vehicle,
  ]);

  useEffect(() => {
    if (!vehicle.plate || vehicle.fetchStatus !== 'success' || !vehicle.fields?.length) {
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
      return;
    }
    if (compactPlate(normalizePlate(vehicle.plate)) !== compactPlate(normalizePlate(registrationNumber))) {
      void navigate(purchaseVehicleConfirmationPath(vehicle.plate), { replace: true });
    }
  }, [navigate, registrationNumber, vehicle.fields, vehicle.fetchStatus, vehicle.plate]);

  const continueUpgradeCheckout = useCallback(() => {
    persistVehicleContext({
      registration: vehicle.plate ?? '',
      fields: vehicle.fields,
      ownerName: session.auth?.ownerName,
      languageId: session.auth?.languageId,
      selectedPlanId,
      riderCount: selectedRiderCount,
    });

    flushSync(() => {
      updateSession({
        vehicle: {
          ...vehicle,
          confirmed: true,
        },
        purchase: {
          ...session.purchase,
          selectedPlanId,
          riderCount: selectedRiderCount,
          upgradeCheckout: true,
          skippedPlanUpgrade: false,
          checkoutReady: false,
        },
      });
    });

    const catalog = getPurchasePlansCatalog();
    const riderOptions = getRiderOptionsForPlan(catalog, selectedPlanId);
    const nextPath =
      isPlanRiderEligible(catalog, selectedPlanId) && riderOptions.length > 0
        ? purchaseJourneyPaths.riderCover
        : purchaseJourneyPaths.orderSummary;
    void navigate(nextPath);
  }, [
    navigate,
    selectedPlanId,
    selectedRiderCount,
    session.auth?.languageId,
    session.auth?.ownerName,
    session.purchase,
    updateSession,
    vehicle,
  ]);

  const runAttach = useCallback(() => {
    if (isAttachPending || attachStartedRef.current) {
      return;
    }
    attachStartedRef.current = true;

    void (async () => {
      // Persist plate before attach — attach reads registration from purchase storage.
      persistVehicleContext({
        registration: vehicle.plate ?? '',
        fields: vehicle.fields,
        ownerName: session.auth?.ownerName,
        languageId: session.auth?.languageId,
        selectedPlanId,
        riderCount: selectedRiderCount,
      });

      try {
        const result = await attachPurchaseQr(searchParams, { force: true });
        if (!result.ok) {
          attachStartedRef.current = false;
          resetAttachAttemptCache();
          const returnToLookup =
            result.error.code === 'vehicle_already_subscribed' ||
            result.error.code === 'already_attached';

          if (returnToLookup) {
            // Plate field shows the message on R03 — never also snackbar.
            reportUserError(
              qrAttachLogger,
              result.error.code === 'already_attached'
                ? 'purchase_attach_already_attached'
                : 'purchase_attach_vehicle_already_subscribed',
              result.error,
              result.error.message,
              { toast: false },
            );
            flushSync(() => {
              updateSession({
                vehicle: {
                  ...vehicle,
                  confirmed: false,
                  fetchStatus: 'idle',
                },
              });
            });
            void navigate(purchaseJourneyPaths.vehicleDetails, {
              replace: true,
              state: {
                vehicleBlockedMessage: result.error.message,
              },
            });
            return;
          }

          reportUserError(
            qrAttachLogger,
            'purchase_attach_failed',
            result.error,
            result.error.message,
          );
          return;
        }
        // Skip / included Continue: attach activates — continue to emergency.
        proceedAfterActivation();
      } catch (error: unknown) {
        attachStartedRef.current = false;
        resetAttachAttemptCache();
        reportUserError(qrAttachLogger, 'purchase_attach_error', error);
      }
    })();
  }, [
    attachPurchaseQr,
    isAttachPending,
    navigate,
    proceedAfterActivation,
    searchParams,
    selectedPlanId,
    selectedRiderCount,
    session.auth?.languageId,
    session.auth?.ownerName,
    updateSession,
    vehicle,
  ]);

  const isUpgradeCheckout = Boolean(session.purchase?.upgradeCheckout) &&
    !session.purchase?.skippedPlanUpgrade;

  return (
    <R05ConfirmVehicleScreen
      plate={vehicle.plate}
      fields={vehicle.fields}
      footerLoading={!isUpgradeCheckout && isAttachPending}
      footerLabel={
        !isUpgradeCheckout && isAttachPending ? 'Linking…' : 'Looks right'
      }
      onBack={() => {
        void navigate(purchaseJourneyPaths.vehicleDetails);
      }}
      onContinue={isUpgradeCheckout ? continueUpgradeCheckout : runAttach}
    />
  );
}
