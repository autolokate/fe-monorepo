import { Navigate } from 'react-router-dom';

import { getCompletedPath, getEmergencyHandoffPath } from '../../activation-routing';
import { useJourney } from '../../JourneyContext';

export function EmergencyWildcardRedirect() {
  const { session, selectedFlow } = useJourney();
  const emergency = session.emergency ?? {};

  if (emergency.riderSkipped) {
    return <Navigate to={getCompletedPath()} replace />;
  }

  // Same rule as post-attach handoff: SAFE → contacts; entitled riders → rider-prompt.
  return (
    <Navigate to={getEmergencyHandoffPath(session, selectedFlow)} replace />
  );
}
