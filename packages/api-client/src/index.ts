export {
  ApiClient,
  ApiError,
  createApiClient,
  createAuthenticatedApiClient,
  type ApiClientConfig,
  type ApiRequestOptions,
} from './client.js';
export {
  getOrSwitchSession,
  getProfile,
  logoutSession,
  refreshToken,
  requestOtp,
  toE164IndianMobile,
  updateProfile,
  verifyOtp,
  type OtpChannel,
  type Profile,
  type RequestOtpBody,
  type RequestOtpResult,
  type SessionRoles,
  type TokenPair,
  type VerifyOtpBody,
} from './auth.js';
export { grantConsent, listConsents, type ConsentItem, type ConsentPurpose } from './consent.js';
export {
  registerDeviceToken,
  type DevicePlatform,
  type DeviceRegistered,
  type RegisterDeviceBody,
} from './devices.js';
export {
  attachQr,
  resolveQr,
  type ConsumerAttachBody,
  type ConsumerAttachQrStatus,
  type ConsumerAttachResult,
  type QrChannel,
  type QrJourney,
  type QrOfferedSku,
  type QrPublicVehicle,
  type QrResolution,
  type QrStatus,
} from './qr.js';
export { getLegalDocuments, type LegalDocuments } from './legal.js';
export { lookupVehicle, listVehicles, getVehicleById, type RcRecordDto, type VehicleDetailDto, type VehicleSummaryDto } from './vehicles.js';
export { listPlans, type ApiPlanTier, type PlanOptionDto, type PlanPeriod, type RiderOptionDto } from './plans.js';
export {
  createOrder,
  payOrder,
  getOrderPayment,
  type CreateOrderBody,
  type OrderDto,
  type OrderStatus,
  type PayOrderBody,
  type PayOrderMode,
  type PaymentOutcome,
  type PaymentOutcomeDto,
  type PaymentRefDto,
} from './orders.js';
export {
  validatePromo,
  type PromoPreviewDto,
  type ValidatePromoBody,
} from './promos.js';
export { normalizeTokenPair } from './auth.js';
export {
  previewActivation,
  redeemActivation,
  type ActivationPreviewDto,
  type ActivationPreviewChannel,
  type ActivationPreviewPartner,
  type ActivationRedeemedDto,
  type RedeemActivationBody,
  type RedeemActivationB2b2cBody,
  type RedeemActivationB2bBody,
} from './activation.js';
export {
  listEmergencyContacts,
  requestEmergencyContactOtp,
  verifyEmergencyContactOtp,
  createEmergencyContact,
  deleteEmergencyContact,
  type EmergencyContactDto,
  type EmergencyContactOtpRequestedDto,
  type EmergencyContactOtpVerifiedDto,
  type EmergencyContactCreatedDto,
  type RequestEmergencyContactOtpBody,
  type VerifyEmergencyContactOtpBody,
  type CreateEmergencyContactBody,
} from './emergency-contacts.js';
export {
  listSubscriptionRiders,
  requestRiderOtp,
  verifyRiderOtp,
  createRider,
  deleteRider,
  type RiderDto,
  type RiderOtpRequestedDto,
  type RiderOtpVerifiedDto,
  type RiderCreatedDto,
  type RequestRiderOtpBody,
  type VerifyRiderOtpBody,
  type CreateRiderBody,
} from './riders.js';
export {
  requestParkOtp,
  verifyParkOtp,
  lookupParkVehicle,
  requestParkMediaUpload,
  completeParkMediaUpload,
  openPark,
  getParkStatus,
  requestEmergencyMediaUpload,
  completeEmergencyMediaUpload,
  acceptEmergency,
  cancelEmergencyAlert,
  getEmergencyAlertStatus,
  type ParkOtpRequestBody,
  type ParkOtpRequestedDto,
  type ParkOtpVerifyBody,
  type ParkSessionTokenDto,
  type ParkVehicleLookupBody,
  type BystanderRcRecordDto,
  type RequestScanUploadBody,
  type RequestParkUploadBody,
  type ScanUploadTargetDto,
  type RequestScanUploadResponseDto,
  type CompleteParkUploadBody,
  type ScanMediaCompletedDto,
  type OpenParkBody,
  type ParkOpenedDto,
  type ParkStatus,
  type ParkStatusDto,
  type AcceptEmergencyBody,
  type EmergencyAcceptedDto,
  type AlertStatus,
  type EmergencyDispatchPath,
  type AlertStatusDto,
  type CancelAlertResponseDto,
} from './scanner.js';
export { normalizeApiError, type NormalizedApiError, type NormalizedErrorCode } from './errors.js';
export { wireTokenRefresh } from './interceptors.js';
export { unwrapEnvelope, readEnvelopeMeta, type ApiEnvelope, type ApiErrorEnvelope } from './envelope.js';
export { endpoints, type EndpointGroup } from './endpoints.js';
export type { Plan, User, Vehicle } from '@autolokate/types';
