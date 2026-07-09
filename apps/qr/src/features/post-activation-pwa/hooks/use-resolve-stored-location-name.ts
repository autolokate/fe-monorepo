import { useEffect } from 'react';

import { usePwaScan } from '../context/PwaScanContext.js';
import { reverseGeocodeLocation } from '../utils/reverse-geocode.js';

/** Backfill place name when session has coordinates but no resolved label yet. */
export function useResolveStoredLocationName() {
  const { session, updateSession } = usePwaScan();

  useEffect(() => {
    if (!session.location || session.locationName) {
      return undefined;
    }

    let cancelled = false;

    void reverseGeocodeLocation(session.location).then((name) => {
      if (!cancelled && name) {
        updateSession({ locationName: name });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session.location, session.locationName, updateSession]);
}
