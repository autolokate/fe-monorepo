import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { authJourneyPaths } from '@/journey/auth/auth-routing';
import { useJourney } from '@/journey/JourneyContext';
import { setQrAuthFailureHandler } from '@/platform/api/qr-api-client';

/**
 * Registers global auth-failure handling (refresh exhaustion → logout path).
 * Must render inside BrowserRouter; does not render UI.
 */
export function AuthSessionRegistrar() {
  const navigate = useNavigate();
  const { markAuthLoggedOut } = useJourney();
  const markAuthLoggedOutRef = useRef(markAuthLoggedOut);
  markAuthLoggedOutRef.current = markAuthLoggedOut;

  useEffect(() => {
    setQrAuthFailureHandler(() => {
      markAuthLoggedOutRef.current();
      void navigate(authJourneyPaths.mobile, { replace: true });
    });
    return () => {
      setQrAuthFailureHandler(null);
    };
  }, [navigate]);

  return null;
}
