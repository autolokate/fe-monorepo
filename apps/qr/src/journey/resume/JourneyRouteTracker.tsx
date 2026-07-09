import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useJourney } from '../JourneyContext.js';
import { shouldTrackJourneyRoute } from './journey-resume-path.js';

/** Persists the last in-journey pathname for authenticated resume. */
export function JourneyRouteTracker() {
  const location = useLocation();
  const { updateLastRoutePath } = useJourney();

  useEffect(() => {
    if (shouldTrackJourneyRoute(location.pathname)) {
      updateLastRoutePath(location.pathname);
    }
  }, [location.pathname, updateLastRoutePath]);

  return null;
}
