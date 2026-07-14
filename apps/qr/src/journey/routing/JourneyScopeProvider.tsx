import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation, useParams } from 'react-router-dom';

import {
  buildJourneyScopedPaths,
  parseJourneyIdFromPathname,
  type JourneyScopedPaths,
} from './journey-url-routing';

const JourneyScopeContext = createContext<JourneyScopedPaths | null>(null);

export type JourneyScopeProviderProps = {
  children: ReactNode;
  /** When set, overrides URL-derived journey id (nested layouts). */
  journeyId?: string;
};

/**
 * Binds the active journey id from the URL and exposes scoped path builders.
 * Does not block render — existing screen flows own QR resolve / API calls.
 */
export function JourneyScopeProvider({ children, journeyId: journeyIdProp }: JourneyScopeProviderProps) {
  const params = useParams<{ journeyId?: string; qrCode?: string }>();
  const location = useLocation();

  const journeyId =
    journeyIdProp?.trim() ||
    params.journeyId?.trim() ||
    params.qrCode?.trim() ||
    parseJourneyIdFromPathname(location.pathname) ||
    '';

  const paths = useMemo(
    () => (journeyId ? buildJourneyScopedPaths(journeyId) : null),
    [journeyId],
  );

  if (!journeyId || !paths) {
    return children;
  }

  return (
    <JourneyScopeContext.Provider value={paths}>{children}</JourneyScopeContext.Provider>
  );
}

export function useJourneyScope(): JourneyScopedPaths {
  const context = useContext(JourneyScopeContext);
  if (!context) {
    throw new Error('useJourneyScope must be used within JourneyScopeProvider');
  }
  return context;
}

/** Returns scoped paths when inside a journey route; null otherwise. */
export function useOptionalJourneyScope(): JourneyScopedPaths | null {
  return useContext(JourneyScopeContext);
}

export function useJourneyPaths(): JourneyScopedPaths {
  return useJourneyScope();
}
