import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { authJourneyPaths } from '@/journey/auth/auth-routing.js';
import { useJourney } from '@/journey/JourneyContext.js';
import { createAuthFailureSessionPatch } from '@/services/auth/auth-session.js';
import { setOnboardingAuthFailureHandler } from '@/platform/api/onboarding-api-client.js';

/**
 * Registers global auth-failure handling (refresh exhaustion → logout path).
 * Must render inside BrowserRouter; does not render UI.
 */
export function AuthSessionRegistrar() {
  const navigate = useNavigate();
  const { session, updateSession } = useJourney();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    setOnboardingAuthFailureHandler(() => {
      updateSession(createAuthFailureSessionPatch(sessionRef.current));
      void navigate(authJourneyPaths.mobile, { replace: true });
    });
    return () => {
      setOnboardingAuthFailureHandler(null);
    };
  }, [navigate, updateSession]);

  return null;
}
