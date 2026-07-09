import { getOrSwitchSession, getProfile, requestOtp, verifyOtp, type Profile, type SessionRoles } from '@autolokate/api-client';
import { createSessionTokenStorage } from '@autolokate/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { normalizeAdminRole, type AdminRole } from '@/platform/rbac/permissions';
import { prefetchAdminQueries } from '@/platform/api/prefetch-admin-queries';
import { getAdminApiClient, getAdminBootstrapClient, tokenManager } from '@/platform/api/admin-api-client';

export type AdminAuthState = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  profile: Profile | null;
  session: SessionRoles | null;
  adminRole: AdminRole;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  signOut: () => void;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

const ADMIN_TOKEN_KEY = 'al-admin-auth-tokens-v1';

async function loadAuthenticatedSession(): Promise<{ profile: Profile; session: SessionRoles }> {
  const client = getAdminApiClient();
  const [profile, session] = await Promise.all([getProfile(client), getOrSwitchSession(client)]);
  return { profile, session };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<SessionRoles | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => tokenManager.hasSession());
  const [isBootstrapping, setIsBootstrapping] = useState(() => tokenManager.hasSession());

  useEffect(() => {
    if (!tokenManager.hasSession()) {
      setIsBootstrapping(false);
      return;
    }

    const abort = { active: true };

    void (async () => {
      try {
        const next = await loadAuthenticatedSession();
        if (!abort.active) {
          return;
        }
        setProfile(next.profile);
        setSession(next.session);
        setIsAuthenticated(true);
        void prefetchAdminQueries();
      } catch {
        if (!abort.active) {
          return;
        }
        tokenManager.clear();
        createSessionTokenStorage(ADMIN_TOKEN_KEY).remove();
        setProfile(null);
        setSession(null);
        setIsAuthenticated(false);
      } finally {
        if (abort.active) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      abort.active = false;
    };
  }, []);

  const requestAdminOtp = useCallback(async (phone: string) => {
    await requestOtp(getAdminBootstrapClient(), { phone });
  }, []);

  const verifyAdminOtp = useCallback(async (phone: string, code: string) => {
    const tokens = await verifyOtp(getAdminBootstrapClient(), { phone, code });
    tokenManager.save(tokens);
    const next = await loadAuthenticatedSession();
    setProfile(next.profile);
    setSession(next.session);
    setIsAuthenticated(true);
    setIsBootstrapping(false);
    void prefetchAdminQueries();
  }, []);

  const signOut = useCallback(() => {
    tokenManager.clear();
    createSessionTokenStorage(ADMIN_TOKEN_KEY).remove();
    setProfile(null);
    setSession(null);
    setIsAuthenticated(false);
    setIsBootstrapping(false);
  }, []);

  const adminRole = normalizeAdminRole(session?.role);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isBootstrapping,
      profile,
      session,
      adminRole,
      requestOtp: requestAdminOtp,
      verifyOtp: verifyAdminOtp,
      signOut,
    }),
    [adminRole, isAuthenticated, isBootstrapping, profile, requestAdminOtp, session, signOut, verifyAdminOtp],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthState {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
