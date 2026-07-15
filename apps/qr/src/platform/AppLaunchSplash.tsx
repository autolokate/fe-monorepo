import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { S0SplashScreen } from '@/features/shared-auth/screens/s0-splash/index';
import { journeyPaths } from '@/journey/constants';
import { useJourney } from '@/journey/JourneyContext';
import { resolveJourneyResumePath } from '@/journey/resume/journey-resume-path';
import { extractQrCodeParam } from '@/platform/qr/parse-qr-url';
import { ensureValidAuthSession } from '@/services/auth/ensure-valid-auth-session';

import { markAppStartupComplete } from './app-startup-state';

type AppLaunchSplashProps = {
  children: ReactNode;
};

const SPLASH_MAX_MS = 1000;

const BARE_ENTRY_PATHS = new Set(['/', '/scan', journeyPaths.auth]);

function isBareEntryPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return BARE_ENTRY_PATHS.has(normalized);
}

/** Cold-start splash — runs session bootstrap before routes render; single post-startup navigation. */
export function AppLaunchSplash({ children }: AppLaunchSplashProps) {
  const [splashDone, setSplashDone] = useState(false);
  const bootstrapRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { authStatus, selectedFlow, session, phase, lastRoutePath, markAuthLoggedOut } =
    useJourney();

  const finishSplash = useCallback(() => {
    markAppStartupComplete();
    setSplashDone(true);
  }, []);

  useEffect(() => {
    if (bootstrapRef.current) {
      return;
    }
    bootstrapRef.current = true;

    const startedAt = Date.now();

    void (async () => {
      const sessionValidity = await ensureValidAuthSession();
      if (sessionValidity === 'logged_out') {
        markAuthLoggedOut();
      }

      const signedIn = sessionValidity === 'valid';
      const searchParams = new URLSearchParams(location.search);
      const qrCode = extractQrCodeParam(searchParams);
      const onEntry = isBareEntryPath(location.pathname);

      if (onEntry) {
        if (signedIn && !qrCode) {
          const resumePath = resolveJourneyResumePath(
            { selectedFlow, authStatus, session, lastRoutePath },
            phase,
            lastRoutePath,
          );
          if (resumePath !== location.pathname) {
            void navigate(resumePath, { replace: true });
          }
        } else if (location.pathname === '/' || location.pathname === '/scan') {
          const search = location.search;
          void navigate(search ? { pathname: journeyPaths.auth, search } : journeyPaths.auth, {
            replace: true,
          });
        }
      }

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, SPLASH_MAX_MS - elapsed);
      if (remaining > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remaining);
        });
      }

      finishSplash();
    })();
  }, [
    authStatus,
    finishSplash,
    lastRoutePath,
    location.pathname,
    location.search,
    markAuthLoggedOut,
    navigate,
    phase,
    selectedFlow,
    session,
  ]);

  if (!splashDone) {
    return <S0SplashScreen />;
  }

  return children;
}
