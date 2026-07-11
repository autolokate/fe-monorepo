import { Navigate } from 'react-router-dom';

import {
  purchaseJourneyPathsFor,
  purchaseVehicleConfirmationPath,
  purchaseVehicleLookupPath,
} from '../purchase/purchase-routing';
import { useJourney } from '../JourneyContext';
import { getVehicle } from '@/storage/index';
import { useActiveJourneyId } from '../routing/use-active-journey-id';
import { buildQrEntryPath } from '../routing/journey-url-routing';

/** `/vehicle-lookup` → `/onboarding/:journeyId/vehicle/:registration/lookup` */
export function LegacyVehicleLookupRedirect() {
  const { session } = useJourney();
  const journeyId = useActiveJourneyId();
  const registration =
    session.vehicle?.plate?.trim() || getVehicle()?.registration.trim() || '';

  if (!journeyId) {
    return <Navigate to={buildQrEntryPath('')} replace />;
  }

  const paths = purchaseJourneyPathsFor(journeyId);

  if (!registration) {
    return <Navigate to={paths.vehicleDetails} replace />;
  }

  return <Navigate to={purchaseVehicleLookupPath(journeyId, registration)} replace />;
}

/** `/vehicle-confirmation` → `/onboarding/:journeyId/vehicle/:registration/confirmation` */
export function LegacyVehicleConfirmationRedirect() {
  const { session } = useJourney();
  const journeyId = useActiveJourneyId();
  const registration =
    session.vehicle?.plate?.trim() || getVehicle()?.registration.trim() || '';

  if (!journeyId) {
    return <Navigate to={buildQrEntryPath('')} replace />;
  }

  const paths = purchaseJourneyPathsFor(journeyId);

  if (!registration) {
    return <Navigate to={paths.vehicleDetails} replace />;
  }

  return <Navigate to={purchaseVehicleConfirmationPath(journeyId, registration)} replace />;
}
