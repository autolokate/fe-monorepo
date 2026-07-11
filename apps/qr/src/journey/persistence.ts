import { AUTH_COMPLETED } from '../features/shared-auth/types';

import { JOURNEY_STORAGE_KEY } from './constants';
import type { ActivationFlowId, AuthStatus, JourneySession, PersistedJourneyState } from './types';

const defaultState: PersistedJourneyState = {
  selectedFlow: null,
  authStatus: 'pending',
  session: {},
};

export function loadJourneyState(): PersistedJourneyState {
  try {
    const raw = window.sessionStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) {
      return { ...defaultState };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedJourneyState>;
    return {
      selectedFlow: parsed.selectedFlow ?? null,
      authStatus: parsed.authStatus === AUTH_COMPLETED ? AUTH_COMPLETED : 'pending',
      session: parsed.session ?? {},
      lastRoutePath: parsed.lastRoutePath ?? null,
    };
  } catch {
    return { ...defaultState };
  }
}

export function saveJourneyState(state: PersistedJourneyState): void {
  try {
    window.sessionStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode failures
  }
}

export function persistSelectedFlow(_flow: ActivationFlowId): void {
  // Flow is derived from URL journey id + API resolve — no localStorage.
}

export function clearJourneyPersistence(): void {
  try {
    window.sessionStorage.removeItem(JOURNEY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function updateAuthStatus(authStatus: AuthStatus, session?: JourneySession): PersistedJourneyState {
  const current = loadJourneyState();
  const next = { ...current, authStatus, session: session ?? current.session };
  saveJourneyState(next);
  return next;
}
