'use client';

import { useMemo } from 'react';
import {
  grantAccountConsent,
  grantConsent,
  type ConsentItem,
  type ConsentPurpose,
} from '@/services/purchase';
import { useApiMutation, type UseApiMutationOptions } from '@/hooks/useApiMutation';

interface GrantConsentVariables {
  purpose: ConsentPurpose;
  noticeVersion: string;
}

/** `POST /v1/me/consents` — grant a DPDP consent for a given purpose. */
export function useGrantConsent(
  options?: UseApiMutationOptions<ConsentItem, GrantConsentVariables>,
) {
  const fn = useMemo(
    () =>
      ({ purpose, noticeVersion }: GrantConsentVariables) =>
        grantConsent(purpose, noticeVersion),
    [],
  );
  return useApiMutation(fn, options);
}

/**
 * Grants the always-on ACCOUNT consent, pinning the live privacy notice
 * version. Used right after OTP verify.
 */
export function useGrantAccountConsent(options?: UseApiMutationOptions<ConsentItem, void>) {
  const fn = useMemo(() => () => grantAccountConsent(), []);
  return useApiMutation(fn, options);
}
