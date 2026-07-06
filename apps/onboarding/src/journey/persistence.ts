import { AUTH_COMPLETED } from '../features/shared-auth/types.js';

import { JOURNEY_STORAGE_KEY, SELECTED_FLOW_KEY } from './constants.js';
import type { ActivationFlowId, AuthStatus, JourneySession, PersistedJourneyState } from './types.js';

const defaultState: PersistedJourneyState = {
  selectedFlow: null,
  authStatus: 'pending',
  session: {},
};

export function loadJourneyState(): PersistedJourneyState {
  try {
    const raw = window.sessionStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) {
      return loadSelectedFlowOnly();
    }
    const parsed = JSON.parse(raw) as Partial<PersistedJourneyState>;
    return {
      selectedFlow: parsed.selectedFlow ?? null,
      authStatus: parsed.authStatus === AUTH_COMPLETED ? AUTH_COMPLETED : 'pending',
      session: parsed.session ?? {},
      lastRoutePath: parsed.lastRoutePath ?? null,
    };
  } catch {
    return loadSelectedFlowOnly();
  }
}

function loadSelectedFlowOnly(): PersistedJourneyState {
  try {
    const flow = window.localStorage.getItem(SELECTED_FLOW_KEY);
    if (flow === 'purchase' || flow === 'prepaid' || flow === 'b2b2c') {
      return { ...defaultState, selectedFlow: flow };
    }
  } catch {
    // Private browsing / storage disabled on mobile Safari
  }
  return { ...defaultState };
}

export function saveJourneyState(state: PersistedJourneyState): void {
  try {
    window.sessionStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(state));
    if (state.selectedFlow) {
      window.localStorage.setItem(SELECTED_FLOW_KEY, state.selectedFlow);
    }
  } catch {
    // ignore quota / private mode failures
  }
}

export function persistSelectedFlow(flow: ActivationFlowId): void {
  try {
    window.localStorage.setItem(SELECTED_FLOW_KEY, flow);
  } catch {
    // ignore
  }
}

export function clearJourneyPersistence(): void {
  try {
    window.sessionStorage.removeItem(JOURNEY_STORAGE_KEY);
    window.localStorage.removeItem(SELECTED_FLOW_KEY);
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
