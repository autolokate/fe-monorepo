import {
  ApiError,
  getOrSwitchSession,
  getProfile,
  logoutSession,
  requestOtp,
  requestStepUpOtp,
  verifyOtp,
  verifyStepUpOtp,
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

import {
  getAdminApiClient,
  getAdminBootstrapClient,
  registerAdminAuthFailureHandler,
  registerAdminStepUpRequiredHandler,
  tokenManager,
} from '@/platform/api/admin-api-client';
import { prefetchAdminQueries } from '@/platform/api/prefetch-admin-queries';
import { accessTokenLacksStepUp } from '@/platform/auth/access-token-claims';
import {
  isAdminPlaneSessionRole,
  normalizeAdminRole,
  type AdminRole,
} from '@/platform/rbac/permissions';
import { queryClient } from '@/providers/QueryProvider';

export type AdminAuthState = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  profile: Profile | null;
  session: SessionRoles | null;
  adminRole: AdminRole;
  /** True only when the ACTIVE session role is OPERATOR (or legacy ADMIN) — what the server enforces. */
  hasAdminPlaneRole: boolean;
  /** True when the admin plane needs a step-up (2FA) OTP before any `/admin/v1/*` call can succeed. */
  stepUpRequired: boolean;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  requestStepUp: () => Promise<{ channel: string }>;
  verifyStepUp: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

const ADMIN_TOKEN_KEY = 'al-admin-auth-tokens-v1';

async function loadAuthenticatedSession(): Promise<{ profile: Profile; session: SessionRoles }> {
  const client = getAdminApiClient();
  const profile = await getProfile(client);
  // The admin plane is OPERATOR-only on the server; switch to it when the account holds it.
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

/**
 * Verify the login OTP asking for an OPERATOR session directly. The backend counts that fresh OTP as
 * the admin step-up (the token comes back with `step_up`), so there is no second "Confirm it's you"
 * OTP. A backend that predates the `role` field rejects it with 400 before the code is checked —
 * retry without it; the step-up screen then covers that older server.
 */
async function verifyLoginOtp(phone: string, code: string) {
  const client = getAdminBootstrapClient();
  try {
    return await verifyOtp(client, { phone, code, role: 'OPERATOR' });
  } catch (cause) {
    if (
      cause instanceof ApiError &&
      cause.status === 400 &&
      /\brole\b/i.test(`${cause.message} ${JSON.stringify(cause.details ?? '')}`)
    ) {
      return verifyOtp(client, { phone, code });
    }
    throw cause;
  }
}

function clearLocalSession(): void {
  tokenManager.clear();
  createSessionTokenStorage(ADMIN_TOKEN_KEY).remove();
  queryClient.clear();
}

function currentTokenLacksStepUp(): boolean {
  return accessTokenLacksStepUp(tokenManager.getAccessToken());
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<SessionRoles | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => tokenManager.hasSession());
  const [isBootstrapping, setIsBootstrapping] = useState(() => tokenManager.hasSession());
  const [stepUpRequired, setStepUpRequired] = useState(false);

  const resetState = useCallback(() => {
    setProfile(null);
    setSession(null);
    setStepUpRequired(false);
    setIsAuthenticated(false);
    setIsBootstrapping(false);
  }, []);

  /** Revoke the server session (best effort), then clear everything local. */
  const signOut = useCallback(async () => {
    if (tokenManager.hasSession()) {
      try {
        await logoutSession(getAdminApiClient());
      } catch {
        // Best effort: an expired/revoked session must still sign out locally.
      }
    }
    clearLocalSession();
    resetState();
  }, [resetState]);

  // Refresh failure (401 after one refresh) → local sign-out only; the server already refused us.
  useEffect(() => {
    registerAdminAuthFailureHandler(() => {
      clearLocalSession();
      resetState();
    });
  }, [resetState]);

  // Server said 403 step_up_required → re-prompt (the stepped-up token expired or was never minted).
  useEffect(() => {
    registerAdminStepUpRequiredHandler(() => {
      setStepUpRequired(true);
    });
    return () => {
      registerAdminStepUpRequiredHandler(null);
    };
  }, []);

  const applySession = useCallback((next: { profile: Profile; session: SessionRoles }) => {
    setProfile(next.profile);
    setSession(next.session);
    setIsAuthenticated(true);
    const operator = isAdminPlaneSessionRole(next.session.role);
    const needsStepUp = operator && currentTokenLacksStepUp();
    setStepUpRequired(needsStepUp);
    if (operator && !needsStepUp) {
      void prefetchAdminQueries();
    }
  }, []);

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
        applySession(next);
      } catch {
        if (!abort.active) {
          return;
        }
        clearLocalSession();
        resetState();
      } finally {
        if (abort.active) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      abort.active = false;
    };
  }, [applySession, resetState]);

  const requestAdminOtp = useCallback(async (phone: string) => {
    await requestOtp(getAdminBootstrapClient(), { phone });
  }, []);

  const verifyAdminOtp = useCallback(
    async (phone: string, code: string) => {
      const tokens = await verifyLoginOtp(phone, code);
      tokenManager.save(tokens);
      const next = await loadAuthenticatedSession();
      applySession(next);
      setIsBootstrapping(false);
    },
    [applySession],
  );

  const requestStepUp = useCallback(async () => requestStepUpOtp(getAdminApiClient()), []);

  const verifyStepUp = useCallback(async (code: string) => {
    const result = await verifyStepUpOtp(getAdminApiClient(), { token: code });
    const current = tokenManager.read();
    if (!current) {
      throw new Error('Session ended before step-up completed. Sign in again.');
    }
    tokenManager.save({
      ...current,
      accessToken: result.accessToken,
      expiresAt: new Date(Date.now() + result.expiresIn * 1000).toISOString(),
    });
    setStepUpRequired(false);
    // Anything that failed for lack of step-up can now succeed.
    void queryClient.invalidateQueries();
    void prefetchAdminQueries();
  }, []);

  const adminRole = normalizeAdminRole(session?.role);
  const hasAdminPlaneRole = Boolean(session && isAdminPlaneSessionRole(session.role));

  const value = useMemo<AdminAuthState>(
    () => ({
      isAuthenticated,
      isBootstrapping,
      profile,
      session,
      adminRole,
      hasAdminPlaneRole,
      stepUpRequired,
      requestOtp: requestAdminOtp,
      verifyOtp: verifyAdminOtp,
      requestStepUp,
      verifyStepUp,
      signOut,
    }),
    [
      adminRole,
      hasAdminPlaneRole,
      isAuthenticated,
      isBootstrapping,
      profile,
      requestAdminOtp,
      requestStepUp,
      session,
      signOut,
      stepUpRequired,
      verifyAdminOtp,
      verifyStepUp,
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
