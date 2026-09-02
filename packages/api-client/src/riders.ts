import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type RiderDto = {
  id: string;
  name: string;
  relation: string | null;
  phoneMasked: string;
};

export type RiderOtpRequestedDto = {
  requested: boolean;
};

export type RiderOtpVerifiedDto = {
  verificationToken: string;
};

export type RiderCreatedDto = {
  riderId: string;
};

export type RequestRiderOtpBody = {
  phone: string;
};

export type VerifyRiderOtpBody = {
  phone: string;
  code: string;
};

export type CreateRiderBody = {
  verificationToken: string;
  subscriptionId: string;
  name: string;
  relation?: string;
};

/** GET /v1/subscriptions/:subscriptionId/riders */
export async function listSubscriptionRiders(
  client: ApiClient,
  subscriptionId: string,
  options?: { signal?: AbortSignal },
): Promise<RiderDto[]> {
  const response = await client.get<unknown>(endpoints.riders.list(subscriptionId), {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  const data = unwrapEnvelope(response);
  return Array.isArray(data) ? (data as RiderDto[]) : [];
}

/** POST /v1/riders/otp/request */
export async function requestRiderOtp(
  client: ApiClient,
  body: RequestRiderOtpBody,
  options?: { signal?: AbortSignal },
): Promise<RiderOtpRequestedDto> {
  const response = await client.post<unknown>(endpoints.riders.otpRequest, body, {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as RiderOtpRequestedDto;
}

/** POST /v1/riders/otp/verify */
export async function verifyRiderOtp(
  client: ApiClient,
  body: VerifyRiderOtpBody,
  options?: { signal?: AbortSignal },
): Promise<RiderOtpVerifiedDto> {
  const response = await client.post<unknown>(endpoints.riders.otpVerify, body, {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as RiderOtpVerifiedDto;
}

/** POST /v1/riders */
export async function createRider(
  client: ApiClient,
  body: CreateRiderBody,
  options?: { signal?: AbortSignal },
): Promise<RiderCreatedDto> {
  const response = await client.post<unknown>(endpoints.riders.create, body, {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as RiderCreatedDto;
}

/** DELETE /v1/riders/:id */
export async function deleteRider(
  client: ApiClient,
  riderId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await client.delete(endpoints.riders.delete(riderId), {
    ...(options?.signal ? { signal: options.signal } : {}),
  });
}
