import {
  getOrSwitchSession,
  getProfile,
  requestOtp,
  verifyOtp,
  type Profile,
  type SessionRoles,
} from '@autolokate/api-client';
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
import {
  getAdminApiClient,
  getAdminBootstrapClient,
  registerAdminAuthFailureHandler,
  tokenManager,
} from '@/platform/api/admin-api-client';

export type AdminAuthState = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  profile: Profile | null;
  session: SessionRoles | null;
  adminRole: AdminRole;
  /** True when JWT active role is OPERATOR or legacy ADMIN (admin-plane capable). */
  hasAdminPlaneRole: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  signOut: () => void;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

const ADMIN_TOKEN_KEY = 'al-admin-auth-tokens-v1';

async function loadAuthenticatedSession(): Promise<{ profile: Profile; session: SessionRoles }> {
  const client = getAdminApiClient();
  const profile = await getProfile(client);
  // Prefer OPERATOR (BE admin plane for Garage/promos). Fall back to ADMIN for legacy grants.
  // Login may mint CONSUMER as the default outside elevation environments.
  let session = await getOrSwitchSession(client);
  const preferredRole = session.availableRoles.includes('OPERATOR')
    ? 'OPERATOR'
    : session.availableRoles.includes('ADMIN')
      ? 'ADMIN'
      : null;
  if (preferredRole && session.role !== preferredRole) {
    session = await getOrSwitchSession(client, { role: preferredRole });
    if (session.accessToken && session.expiresAt) {
      const current = tokenManager.read();
      if (current) {
        tokenManager.save({
          ...current,
          accessToken: session.accessToken,
          expiresAt: session.expiresAt,
        });
      }
    }
  }
  return { profile, session };
}

function clearLocalSession(): void {
  tokenManager.clear();
  createSessionTokenStorage(ADMIN_TOKEN_KEY).remove();
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<SessionRoles | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => tokenManager.hasSession());
  const [isBootstrapping, setIsBootstrapping] = useState(() => tokenManager.hasSession());

  const signOut = useCallback(() => {
    clearLocalSession();
    setProfile(null);
    setSession(null);
    setIsAuthenticated(false);
    setIsBootstrapping(false);
  }, []);

  // 401 refresh failure → clear session so RequireAuth returns to login (was a no-op before).
  useEffect(() => {
    registerAdminAuthFailureHandler(() => {
      signOut();
    });
  }, [signOut]);

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
        // Dev-only agent handoff: ?agentExportBearer=1 downloads env (never logs token).
        if (import.meta.env.DEV && typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('agentExportBearer') === '1') {
            const pair = tokenManager.read();
            if (pair?.accessToken) {
              const body = [
                'API_BASE=https://d1wpatcmpyt0pw.cloudfront.net',
                `ADMIN_BEARER=${pair.accessToken}`,
                pair.expiresAt ? `EXPIRES_AT=${pair.expiresAt}` : '',
              ]
                .filter(Boolean)
                .join('\n');
              const blob = new Blob([`${body}\n`], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'al-admin-bearer-a645.env';
              a.rel = 'noopener';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              params.delete('agentExportBearer');
              const nextUrl = `${window.location.pathname}${
                params.toString() ? `?${params.toString()}` : ''
              }${window.location.hash}`;
              window.history.replaceState({}, '', nextUrl);
            }
          }
        }
      } catch {
        if (!abort.active) {
          return;
        }
        clearLocalSession();
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

  const adminRole = normalizeAdminRole(session?.role);
  const hasAdminPlaneRole = Boolean(
    session &&
    (session.role === 'OPERATOR' ||
      session.role === 'ADMIN' ||
      session.availableRoles.includes('OPERATOR') ||
      session.availableRoles.includes('ADMIN')),
  );

  const value = useMemo(
    () => ({
      isAuthenticated,
      isBootstrapping,
      profile,
      session,
      adminRole,
      hasAdminPlaneRole,
      requestOtp: requestAdminOtp,
      verifyOtp: verifyAdminOtp,
      signOut,
    }),
    [
      adminRole,
      hasAdminPlaneRole,
      isAuthenticated,
      isBootstrapping,
      profile,
      requestAdminOtp,
      session,
      signOut,
      verifyAdminOtp,
    ],
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
