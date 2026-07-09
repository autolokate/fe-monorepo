import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { defaultPwaScanSession, type PwaScanSession } from './pwa-scan-types.js';
import {
  loadPwaScanSession,
  savePwaScanSession,
  type SavePwaScanSessionResult,
} from '../storage/pwa-scan-storage.js';

export type PwaSessionPatch =
  | Partial<PwaScanSession>
  | ((prev: PwaScanSession) => Partial<PwaScanSession>);

type PwaScanContextValue = {
  session: PwaScanSession;
  updateSession: (patch: PwaSessionPatch) => SavePwaScanSessionResult;
  resetSession: () => void;
  storageError: string | null;
  clearStorageError: () => void;
};

const PwaScanContext = createContext<PwaScanContextValue | null>(null);

function applyPatch(prev: PwaScanSession, patch: PwaSessionPatch): PwaScanSession {
  const delta = typeof patch === 'function' ? patch(prev) : patch;
  return { ...prev, ...delta };
}

export function PwaScanProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PwaScanSession>(() => loadPwaScanSession());
  const [storageError, setStorageError] = useState<string | null>(null);

  const updateSession = useCallback((patch: PwaSessionPatch): SavePwaScanSessionResult => {
    const pending: { result: SavePwaScanSessionResult } = { result: { ok: true } };

    setSession((prev) => {
      const next = applyPatch(prev, patch);
      pending.result = savePwaScanSession(next);
      return next;
    });

    if (!pending.result.ok) {
      setStorageError(pending.result.message);
    }

    return pending.result;
  }, []);

  const resetSession = useCallback(() => {
    const fresh = defaultPwaScanSession();
    setSession(fresh);
    const result = savePwaScanSession(fresh);
    if (!result.ok) {
      setStorageError(result.message);
    } else {
      setStorageError(null);
    }
  }, []);

  const clearStorageError = useCallback(() => {
    setStorageError(null);
  }, []);

  const value = useMemo(
    () => ({ session, updateSession, resetSession, storageError, clearStorageError }),
    [session, updateSession, resetSession, storageError, clearStorageError],
  );

  return <PwaScanContext.Provider value={value}>{children}</PwaScanContext.Provider>;
}

export function usePwaScan() {
  const ctx = useContext(PwaScanContext);
  if (!ctx) {
    throw new Error('usePwaScan must be used within PwaScanProvider');
  }
  return ctx;
}
