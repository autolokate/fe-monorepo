import { grantConsent, type ApiClient } from '@autolokate/api-client';

import { getLegalNoticeVersion } from '@/storage/index';

import { authLogger } from './auth-logger';

const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Record signup consent after authentication.
 * Uses noticeVersion cached when the user opened Privacy/Terms (GET /v1/legal/documents).
 * Does NOT fetch legal documents automatically.
 */
export async function grantSignupConsents(authenticatedClient: ApiClient): Promise<void> {
  const noticeVersion = getLegalNoticeVersion()?.trim();
  if (!noticeVersion) {
    authLogger.warn('consent_skipped_missing_notice_version');
    return;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await grantConsent(authenticatedClient, {
        purpose: 'ACCOUNT',
        noticeVersion,
      });
      authLogger.info('consent_granted', { purpose: 'ACCOUNT', noticeVersion });
      return;
    } catch (error) {
      authLogger.warn('consent_grant_failed', { attempt, error });
      if (attempt < MAX_ATTEMPTS) {
        await delay(RETRY_BASE_MS * attempt);
      }
    }
  }
}
