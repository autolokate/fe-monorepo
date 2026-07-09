import {
  createEmergencyContact as createEmergencyContactApi,
  deleteEmergencyContact as deleteEmergencyContactApi,
  listEmergencyContacts as listEmergencyContactsApi,
  requestEmergencyContactOtp as requestEmergencyContactOtpApi,
  toE164IndianMobile,
  verifyEmergencyContactOtp as verifyEmergencyContactOtpApi,
} from '@autolokate/api-client';

import type { EmergencyContact, RelationshipId } from '@/features/emergency/types.js';
import { getQrApiClient } from '@/platform/api/qr-api-client.js';
import { emergencyContactStorageRepository } from '@/platform/storage/repositories/emergency-contact-storage-repository.js';

import {
  isEmergencyTransientError,
  mapEmergencyApiError,
  type EmergencyApiError,
} from './emergency-api-errors.js';
import {
  mapApiRelationToLabel,
  mapEmergencyContactDtos,
} from './emergency-contact-mapper.js';
import { emergencyContactLogger } from './emergency-contact-logger.js';

const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 400;

export type EmergencyContactListResult =
  | { ok: true; contacts: EmergencyContact[]; revision: number }
  | { ok: false; error: EmergencyApiError };

export type EmergencyContactOtpResult =
  | { ok: true }
  | { ok: false; error: EmergencyApiError };

export type EmergencyContactVerifyResult =
  | { ok: true; verificationToken: string }
  | { ok: false; error: EmergencyApiError };

export type EmergencyContactCreateResult =
  | { ok: true; contacts: EmergencyContact[]; revision: number }
  | { ok: false; error: EmergencyApiError };

export type EmergencyContactDeleteResult =
  | { ok: true; contacts: EmergencyContact[]; revision: number }
  | { ok: false; error: EmergencyApiError };

let inflightList: Promise<EmergencyContactListResult> | null = null;
let inflightOtpRequest: Promise<EmergencyContactOtpResult> | null = null;
let inflightOtpVerify: Promise<EmergencyContactVerifyResult> | null = null;
let inflightCreate: Promise<EmergencyContactCreateResult> | null = null;
let listAbortController: AbortController | null = null;

/** Clear caches and in-flight requests — used when starting a new QR journey. */
export function resetEmergencyContactServiceState(): void {
  listAbortController?.abort();
  listAbortController = null;
  inflightList = null;
  inflightOtpRequest = null;
  inflightOtpVerify = null;
  inflightCreate = null;
  emergencyContactStorageRepository.clear();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function toE164(mobileDigits: string): string {
  return toE164IndianMobile(mobileDigits.replace(/\D/g, '').slice(-10));
}

function persistContacts(contacts: EmergencyContact[]): number {
  const state = emergencyContactStorageRepository.write({
    contacts,
    loadedAt: new Date().toISOString(),
  });
  return state.revision;
}

/** GET /v1/emergency-contacts — account-level list. */
export async function loadEmergencyContacts(options?: {
  force?: boolean;
}): Promise<EmergencyContactListResult> {
  const stored = emergencyContactStorageRepository.read();
  if (!options?.force && stored.loadedAt) {
    return { ok: true, contacts: stored.contacts, revision: stored.revision };
  }

  if (inflightList) {
    return inflightList;
  }

  listAbortController?.abort();
  const abortController = new AbortController();
  listAbortController = abortController;

  const promise = (async (): Promise<EmergencyContactListResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrApiClient();
        const dtos = await listEmergencyContactsApi(client, {
          signal: abortController.signal,
        });
        const contacts = mapEmergencyContactDtos(dtos);
        const revision = persistContacts(contacts);
        emergencyContactLogger.info('contacts_loaded', { count: contacts.length });
        return { ok: true, contacts, revision };
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        emergencyContactLogger.warn('contacts_load_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to load emergency contacts.', apiMessage: null },
    };
  })();

  inflightList = promise;
  try {
    return await promise;
  } finally {
    inflightList = null;
  }
}

/** POST /v1/emergency-contacts/otp/request */
export async function requestEmergencyContactOtp(
  mobileDigits: string,
): Promise<EmergencyContactOtpResult> {
  if (inflightOtpRequest) {
    return inflightOtpRequest;
  }

  const phone = toE164(mobileDigits);
  const promise = (async (): Promise<EmergencyContactOtpResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrApiClient();
        await requestEmergencyContactOtpApi(client, { phone });
        emergencyContactStorageRepository.write({ verificationPhone: phone });
        emergencyContactLogger.info('contact_otp_requested');
        return { ok: true };
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        emergencyContactLogger.warn('contact_otp_request_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to send verification code.', apiMessage: null },
    };
  })();

  inflightOtpRequest = promise;
  try {
    return await promise;
  } finally {
    inflightOtpRequest = null;
  }
}

/** POST /v1/emergency-contacts/otp/verify */
export async function verifyEmergencyContactOtp(
  mobileDigits: string,
  code: string,
): Promise<EmergencyContactVerifyResult> {
  if (inflightOtpVerify) {
    return inflightOtpVerify;
  }

  const phone = toE164(mobileDigits);
  const promise = (async (): Promise<EmergencyContactVerifyResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrApiClient();
        const result = await verifyEmergencyContactOtpApi(client, { phone, code });
        emergencyContactStorageRepository.write({
          verificationToken: result.verificationToken,
          verificationPhone: phone,
        });
        emergencyContactLogger.info('contact_otp_verified');
        return { ok: true, verificationToken: result.verificationToken };
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        emergencyContactLogger.warn('contact_otp_verify_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to verify code.', apiMessage: null },
    };
  })();

  inflightOtpVerify = promise;
  try {
    return await promise;
  } finally {
    inflightOtpVerify = null;
  }
}

/** POST /v1/emergency-contacts — then refresh list. */
export async function createEmergencyContact(
  name: string,
  relation: RelationshipId,
  verificationToken?: string,
): Promise<EmergencyContactCreateResult> {
  if (inflightCreate) {
    return inflightCreate;
  }

  const token =
    verificationToken ?? emergencyContactStorageRepository.read().verificationToken ?? null;
  if (!token) {
    return {
      ok: false,
      error: { code: 'validation', message: 'Verification expired. Request a new code.', apiMessage: null },
    };
  }

  const promise = (async (): Promise<EmergencyContactCreateResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrApiClient();
        await createEmergencyContactApi(client, {
          verificationToken: token,
          name: name.trim(),
          relation: mapApiRelationToLabel(relation),
        });
        emergencyContactStorageRepository.clearVerification();
        const refreshed = await loadEmergencyContacts({ force: true });
        if (!refreshed.ok) {
          return refreshed;
        }
        emergencyContactLogger.info('contact_created');
        return refreshed;
      } catch (error) {
        if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
          await delay(RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapEmergencyApiError(error);
        emergencyContactLogger.warn('contact_create_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Unable to add emergency contact.', apiMessage: null },
    };
  })();

  inflightCreate = promise;
  try {
    return await promise;
  } finally {
    inflightCreate = null;
  }
}

/** DELETE /v1/emergency-contacts/:id — then refresh list. */
export async function deleteEmergencyContact(
  contactId: string,
): Promise<EmergencyContactDeleteResult> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const client = getQrApiClient();
      await deleteEmergencyContactApi(client, contactId);
      const refreshed = await loadEmergencyContacts({ force: true });
      if (!refreshed.ok) {
        return refreshed;
      }
      emergencyContactLogger.info('contact_deleted', { contactId });
      return refreshed;
    } catch (error) {
      if (isEmergencyTransientError(error) && attempt < MAX_ATTEMPTS) {
        await delay(RETRY_BASE_MS * attempt);
        continue;
      }
      const mapped = mapEmergencyApiError(error);
      emergencyContactLogger.warn('contact_delete_failed', { error: mapped });
      return { ok: false, error: mapped };
    }
  }
  return {
    ok: false,
    error: { code: 'unavailable', message: 'Unable to remove emergency contact.', apiMessage: null },
  };
}

export function peekStoredEmergencyContacts(): EmergencyContact[] {
  return emergencyContactStorageRepository.read().contacts;
}

export function getEmergencyContactsRevision(): number {
  return emergencyContactStorageRepository.read().revision;
}
