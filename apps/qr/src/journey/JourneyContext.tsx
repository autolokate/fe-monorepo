import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { AUTH_COMPLETED } from '../features/shared-auth/types';

import {
  reconcileAuthSession,
  revokeAndClearAuthSession,
  createAuthFailureSessionPatch,
} from '../services/auth/auth-session';
import { resetQrJourneyStorage } from '@/platform/storage/reset-qr-journey-storage';
import { loadJourneyState, persistSelectedFlow, saveJourneyState } from './persistence';
import type {
  ActivationFlowId,
  JourneyContextValue,
  JourneyPhase,
  JourneySession,
  PersistedJourneyState,
} from './types';

const JourneyContext = createContext<JourneyContextValue | null>(null);

export type JourneyProviderProps = {
  initialPhase?: JourneyPhase;
  children: ReactNode;
};

export function JourneyProvider({ initialPhase = 'home', children }: JourneyProviderProps) {
  const [persisted, setPersisted] = useState<PersistedJourneyState>(() => {
    const loaded = loadJourneyState();
    const patch = reconcileAuthSession(loaded);
    if (!patch) {
      return loaded;
    }
    const next = { ...loaded, ...patch };
    saveJourneyState(next);
    return next;
  });
  const [phase, setPhase] = useState<JourneyPhase>(initialPhase);

  const setSelectedFlow = useCallback((flow: ActivationFlowId) => {
    setPersisted((current) => {
      const next = { ...current, selectedFlow: flow };
      saveJourneyState(next);
      persistSelectedFlow(flow);
      return next;
    });
    setPhase('flow-select');
  }, []);

  const completeAuth = useCallback(() => {
    setPersisted((current) => {
      const next = { ...current, authStatus: AUTH_COMPLETED };
      saveJourneyState(next);
      return next;
    });
    setPhase('activation');
  }, []);

  const clearJourney = useCallback(() => {
    void revokeAndClearAuthSession();
    resetQrJourneyStorage();
    setPersisted({ selectedFlow: null, authStatus: 'pending', session: {} });
    setPhase('home');
  }, []);

  const resetForNewQrEntry = useCallback(() => {
    resetQrJourneyStorage();
    setPersisted({ selectedFlow: null, authStatus: 'pending', session: {} });
  }, []);

  const updateSession = useCallback((patch: Partial<JourneySession>) => {
    setPersisted((current) => {
      const next = { ...current, session: { ...current.session, ...patch } };
      saveJourneyState(next);
      return next;
    });
  }, []);

  const updateLastRoutePath = useCallback((path: string) => {
    setPersisted((current) => {
      if (current.lastRoutePath === path) {
        return current;
      }
      const next = { ...current, lastRoutePath: path };
      saveJourneyState(next);
      return next;
    });
  }, []);

  const markAuthLoggedOut = useCallback(() => {
    setPersisted((current) => {
      const next = {
        ...current,
        ...createAuthFailureSessionPatch(current.session),
      };
      saveJourneyState(next);
      return next;
    });
    setPhase('shared-auth');
  }, []);

  const value = useMemo<JourneyContextValue>(
    () => ({
      ...persisted,
      phase,
      setSelectedFlow,
      completeAuth,
      clearJourney,
      resetForNewQrEntry,
      setPhase,
      updateSession,
      updateLastRoutePath,
      markAuthLoggedOut,
    }),
    [
      clearJourney,
      completeAuth,
      markAuthLoggedOut,
      persisted,
      phase,
      resetForNewQrEntry,
      setSelectedFlow,
      updateLastRoutePath,
      updateSession,
    ],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney(): JourneyContextValue {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within JourneyProvider');
  }
  return context;
}
