import type { ApiClient } from './client';
import type { RcRecordDto } from './vehicles';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type ParkOtpRequestBody = {
  phone: string;
};

export type ParkOtpRequestedDto = {
  requested: boolean;
};

export type ParkOtpVerifyBody = {
  phone: string;
  code: string;
};

export type ParkSessionTokenDto = {
  bystanderSessionToken: string;
};

export type ParkVehicleLookupBody = {
  bystanderSessionToken: string;
  plate: string;
};

export type BystanderRcRecordDto = RcRecordDto;

export type RequestScanUploadBody = {
  contentType: string;
  sizeBytes: number;
};

export type RequestParkUploadBody = RequestScanUploadBody & {
  bystanderSessionToken: string;
};

export type ScanUploadTargetDto = {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresInSeconds: number;
};

export type RequestScanUploadResponseDto = {
  mediaId: string;
  upload: ScanUploadTargetDto;
};

export type CompleteParkUploadBody = {
  bystanderSessionToken: string;
};

export type ScanMediaCompletedDto = {
  mediaId: string;
  status: 'UPLOADED';
};

export type OpenParkBody = {
  bystanderSessionToken: string;
  name: string;
  photoIds: [string, string];
  reporterPlate?: string;
  geoLat?: number;
  geoLng?: number;
};

export type ParkOpenedDto = {
  notificationId: string;
};

export type ParkStatus = 'CHECKING' | 'CALLING' | 'RESOLVED' | 'PHOTO_INVALID' | 'EXPIRED';

export type ParkStatusDto = {
  status: ParkStatus;
};

export type AcceptEmergencyBody = {
  nonce: string;
  scenePhotoIds?: string[];
};

export type EmergencyAcceptedDto = {
  incidentId: string;
  alertId: string;
};

export type AlertStatus = 'RECEIVED' | 'DISPATCHED' | 'RESOLVED' | 'CANCELLED' | 'CONTACTS_ONLY';

export type EmergencyDispatchPath = 'FULL' | 'CONTACTS_ONLY';

export type AlertStatusDto = {
  status: AlertStatus;
  dispatchPath: EmergencyDispatchPath;
};

export type CancelAlertResponseDto = {
  /** true if this call flipped RECEIVED → CANCELLED; false if already CANCELLED (idempotent). */
  cancelled: boolean;
  status: 'CANCELLED';
};

const publicOpts = { skipAuth: true } as const;

/** POST /v1/qr/{code}/park/otp/request */
export async function requestParkOtp(
  client: ApiClient,
  code: string,
  body: ParkOtpRequestBody,
): Promise<ParkOtpRequestedDto> {
  const response = await client.post<unknown>(
    endpoints.scanner.parkOtpRequest(code),
    body,
    publicOpts,
  );
  return unwrapEnvelope(response) as ParkOtpRequestedDto;
}

/** POST /v1/qr/{code}/park/otp/verify */
export async function verifyParkOtp(
  client: ApiClient,
  code: string,
  body: ParkOtpVerifyBody,
): Promise<ParkSessionTokenDto> {
  const response = await client.post<unknown>(
    endpoints.scanner.parkOtpVerify(code),
    body,
    publicOpts,
  );
  return unwrapEnvelope(response) as ParkSessionTokenDto;
}

/** POST /v1/qr/{code}/park/vehicles/lookup */
export async function lookupParkVehicle(
  client: ApiClient,
  code: string,
  body: ParkVehicleLookupBody,
  options?: { signal?: AbortSignal },
): Promise<BystanderRcRecordDto> {
  const response = await client.post<unknown>(endpoints.scanner.parkVehicleLookup(code), body, {
    ...publicOpts,
    ...options,
  });
  return unwrapEnvelope(response) as BystanderRcRecordDto;
}

/** POST /v1/qr/{code}/park/media */
export async function requestParkMediaUpload(
  client: ApiClient,
  code: string,
  body: RequestParkUploadBody,
  options?: { signal?: AbortSignal },
): Promise<RequestScanUploadResponseDto> {
  const response = await client.post<unknown>(endpoints.scanner.parkMedia(code), body, {
    ...publicOpts,
    ...options,
  });
  return unwrapEnvelope(response) as RequestScanUploadResponseDto;
}

/** POST /v1/qr/{code}/park/media/{id}/complete */
export async function completeParkMediaUpload(
  client: ApiClient,
  code: string,
  mediaId: string,
  body: CompleteParkUploadBody,
  options?: { signal?: AbortSignal },
): Promise<ScanMediaCompletedDto> {
  const response = await client.post<unknown>(
    endpoints.scanner.parkMediaComplete(code, mediaId),
    body,
    { ...publicOpts, ...options },
  );
  return unwrapEnvelope(response) as ScanMediaCompletedDto;
}

/** POST /v1/qr/{code}/park */
export async function openPark(
  client: ApiClient,
  code: string,
  body: OpenParkBody,
  idempotencyKey?: string,
  options?: { signal?: AbortSignal },
): Promise<ParkOpenedDto> {
  const response = await client.post<unknown>(endpoints.scanner.parkOpen(code), body, {
    ...publicOpts,
    ...options,
    ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}),
  });
  return unwrapEnvelope(response) as ParkOpenedDto;
}

/** GET /v1/park/{notificationId} */
export async function getParkStatus(
  client: ApiClient,
  notificationId: string,
  options?: { signal?: AbortSignal },
): Promise<ParkStatusDto> {
  const response = await client.get<unknown>(endpoints.scanner.parkStatus(notificationId), {
    ...publicOpts,
    ...options,
  });
  return unwrapEnvelope(response) as ParkStatusDto;
}

/** POST /v1/qr/{code}/emergency/media */
export async function requestEmergencyMediaUpload(
  client: ApiClient,
  code: string,
  body: RequestScanUploadBody,
  options?: { signal?: AbortSignal },
): Promise<RequestScanUploadResponseDto> {
  const response = await client.post<unknown>(endpoints.scanner.emergencyMedia(code), body, {
    ...publicOpts,
    ...options,
  });
  return unwrapEnvelope(response) as RequestScanUploadResponseDto;
}

/** POST /v1/qr/{code}/emergency/media/{id}/complete */
export async function completeEmergencyMediaUpload(
  client: ApiClient,
  code: string,
  mediaId: string,
  options?: { signal?: AbortSignal },
): Promise<ScanMediaCompletedDto> {
  const response = await client.post<unknown>(
    endpoints.scanner.emergencyMediaComplete(code, mediaId),
    undefined,
    { ...publicOpts, ...options },
  );
  return unwrapEnvelope(response) as ScanMediaCompletedDto;
}

/** POST /v1/qr/{code}/emergency */
export async function acceptEmergency(
  client: ApiClient,
  code: string,
  body: AcceptEmergencyBody,
  idempotencyKey?: string,
  options?: { signal?: AbortSignal },
): Promise<EmergencyAcceptedDto> {
  const response = await client.post<unknown>(endpoints.scanner.emergencyOpen(code), body, {
    ...publicOpts,
    ...options,
    ...(idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}),
  });
  return unwrapEnvelope(response) as EmergencyAcceptedDto;
}

/** GET /v1/emergency/{alertId} */
export async function getEmergencyAlertStatus(
  client: ApiClient,
  alertId: string,
  options?: { signal?: AbortSignal },
): Promise<AlertStatusDto> {
  const response = await client.get<unknown>(endpoints.scanner.emergencyStatus(alertId), {
    ...publicOpts,
    ...options,
  });
  return unwrapEnvelope(response) as AlertStatusDto;
}

/** POST /v1/emergency/{alertId}/cancel — “I'm safe” (owner or anonymous bystander). */
export async function cancelEmergencyAlert(
  client: ApiClient,
  alertId: string,
  options?: { signal?: AbortSignal },
): Promise<CancelAlertResponseDto> {
  const response = await client.post<unknown>(
    endpoints.scanner.emergencyCancel(alertId),
    undefined,
    { ...publicOpts, ...options },
  );
  return unwrapEnvelope(response) as CancelAlertResponseDto;
}
