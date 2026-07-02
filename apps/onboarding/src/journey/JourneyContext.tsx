import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AUTH_COMPLETED } from '../features/shared-auth/types.js';

import { reconcileAuthSession, revokeAndClearAuthSession } from '../services/auth/auth-session.js';
import { resetOnboardingJourneyStorage } from '@/platform/storage/reset-onboarding-journey-storage.js';
import {
  loadJourneyState,
  persistSelectedFlow,
  saveJourneyState,
} from './persistence.js';
import type {
  ActivationFlowId,
  JourneyContextValue,
  JourneyPhase,
  JourneySession,
  PersistedJourneyState,
} from './types.js';

const JourneyContext = createContext<JourneyContextValue | null>(null);

export type JourneyProviderProps = {
  initialPhase?: JourneyPhase;
  children: ReactNode;
};

export function JourneyProvider({ initialPhase = 'home', children }: JourneyProviderProps) {
  const [persisted, setPersisted] = useState<PersistedJourneyState>(() => {
    const loaded = loadJourneyState();
    const patch = reconcileAuthSession(loaded.session);
    if (!patch) {
      return loaded;
    }
    const next = { ...loaded, session: { ...loaded.session, ...patch } };
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
    resetOnboardingJourneyStorage();
    setPersisted({ selectedFlow: null, authStatus: 'pending', session: {} });
    setPhase('home');
  }, []);

  const resetForNewQrEntry = useCallback(() => {
    resetOnboardingJourneyStorage();
    setPersisted({ selectedFlow: null, authStatus: 'pending', session: {} });
  }, []);

  const updateSession = useCallback((patch: Partial<JourneySession>) => {
    setPersisted((current) => {
      const next = { ...current, session: { ...current.session, ...patch } };
      saveJourneyState(next);
      return next;
    });
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
    }),
    [clearJourney, completeAuth, persisted, phase, resetForNewQrEntry, setSelectedFlow, updateSession],
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
