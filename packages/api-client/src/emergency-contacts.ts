import type { ApiClient } from './client.js';
import { endpoints } from './endpoints.js';
import { unwrapEnvelope } from './envelope.js';

export type EmergencyContactDto = {
  id: string;
  name: string;
  relation: string | null;
  phoneMasked: string;
};

export type EmergencyContactOtpRequestedDto = {
  requested: boolean;
};

export type EmergencyContactOtpVerifiedDto = {
  verificationToken: string;
};

export type EmergencyContactCreatedDto = {
  contactId: string;
};

export type RequestEmergencyContactOtpBody = {
  phone: string;
};

export type VerifyEmergencyContactOtpBody = {
  phone: string;
  code: string;
};

export type CreateEmergencyContactBody = {
  verificationToken: string;
  name: string;
  relation?: string;
};

/** GET /v1/emergency-contacts — list account contacts (masked). */
export async function listEmergencyContacts(
  client: ApiClient,
  options?: { signal?: AbortSignal },
): Promise<EmergencyContactDto[]> {
  const response = await client.get<unknown>(endpoints.emergencyContacts.list, {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  const data = unwrapEnvelope(response);
  return Array.isArray(data) ? (data as EmergencyContactDto[]) : [];
}

/** POST /v1/emergency-contacts/otp/request */
export async function requestEmergencyContactOtp(
  client: ApiClient,
  body: RequestEmergencyContactOtpBody,
  options?: { signal?: AbortSignal },
): Promise<EmergencyContactOtpRequestedDto> {
  const response = await client.post<unknown>(
    endpoints.emergencyContacts.otpRequest,
    body,
    { ...(options?.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as EmergencyContactOtpRequestedDto;
}

/** POST /v1/emergency-contacts/otp/verify */
export async function verifyEmergencyContactOtp(
  client: ApiClient,
  body: VerifyEmergencyContactOtpBody,
  options?: { signal?: AbortSignal },
): Promise<EmergencyContactOtpVerifiedDto> {
  const response = await client.post<unknown>(
    endpoints.emergencyContacts.otpVerify,
    body,
    { ...(options?.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as EmergencyContactOtpVerifiedDto;
}

/** POST /v1/emergency-contacts */
export async function createEmergencyContact(
  client: ApiClient,
  body: CreateEmergencyContactBody,
  options?: { signal?: AbortSignal },
): Promise<EmergencyContactCreatedDto> {
  const response = await client.post<unknown>(endpoints.emergencyContacts.create, body, {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as EmergencyContactCreatedDto;
}

/** DELETE /v1/emergency-contacts/:id */
export async function deleteEmergencyContact(
  client: ApiClient,
  contactId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await client.delete(endpoints.emergencyContacts.delete(contactId), {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
}
