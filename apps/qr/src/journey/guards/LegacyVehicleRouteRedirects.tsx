import { Navigate } from 'react-router-dom';

import {
  purchaseJourneyPaths,
  purchaseVehicleConfirmationPath,
  purchaseVehicleLookupPath,
} from '../purchase/purchase-routing';
import { useJourney } from '../JourneyContext';
import { getVehicle } from '@/storage/index';

/** `/vehicle-lookup` → `/vehicle/:registration/lookup` */
export function LegacyVehicleLookupRedirect() {
  const { session } = useJourney();
  const registration =
    session.vehicle?.plate?.trim() || getVehicle()?.registration.trim() || '';

  if (!registration) {
    return <Navigate to={purchaseJourneyPaths.vehicleDetails} replace />;
  }

  return <Navigate to={purchaseVehicleLookupPath(registration)} replace />;
}

/** `/vehicle-confirmation` → `/vehicle/:registration/confirmation` */
export function LegacyVehicleConfirmationRedirect() {
  const { session } = useJourney();
  const registration =
    session.vehicle?.plate?.trim() || getVehicle()?.registration.trim() || '';

  if (!registration) {
    return <Navigate to={purchaseJourneyPaths.vehicleDetails} replace />;
  }

  return <Navigate to={purchaseVehicleConfirmationPath(registration)} replace />;
}
