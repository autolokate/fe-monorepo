import { Navigate } from 'react-router-dom';

import { getEmergencyHandoffPath } from '../../activation-routing';
import { useJourney } from '../../JourneyContext';

export function EmergencyWildcardRedirect() {
  const { session, selectedFlow } = useJourney();

  // Rider skip still routes to contacts when plan emergencyCount > 0.
  return <Navigate to={getEmergencyHandoffPath(session, selectedFlow)} replace />;
}
