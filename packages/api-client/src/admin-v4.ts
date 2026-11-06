/**
 * Admin v4 reads/actions — be-monorepo PR #54 (admin gaps), be-anpr (plate scanning) and quotes v4.
 * Shapes mirror apps/api `openapi.json` on be-monorepo `origin/dev`. Every route is OPERATOR + step_up
 * with the `{data, meta}` envelope; lists page with keyset `meta.pagination`.
 *
 * Servers that predate a route answer 404 — callers render that as "not available on this server"
 * (never as empty data). Nothing here computes money or counts client-side.
 */
import type { ApiClient } from './client';
import { readEnvelopeMeta, unwrapEnvelope } from './envelope';

type RequestOptions = { signal?: AbortSignal };

function signalOption(options: RequestOptions): RequestOptions {
  return options.signal ? { signal: options.signal } : {};
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** OpenAPI `PaginationDto`. */
export type AdminV4Pagination = {
  limit: number;
  cursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
};

/** A keyset page: rows + `meta.pagination` (null when the server sent none). */
export type AdminV4Page<T> = {
  items: T[];
  pagination: AdminV4Pagination | null;
};

function readPage<T>(response: unknown): AdminV4Page<T> {
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  const data = unwrapEnvelope(response);
  return {
    items: Array.isArray(data) ? (data as T[]) : [],
    pagination:
      pagination && typeof pagination === 'object' && 'hasMore' in pagination
        ? (pagination as AdminV4Pagination)
        : null,
  };
}

/** `{items: [...]}` reads (plate-scanning admin) — not keyset paged. */
function readItems<T>(response: unknown): T[] {
  const data = unwrapEnvelope(response) as { items?: unknown } | null;
  return Array.isArray(data?.items) ? (data.items as T[]) : [];
}

type PageQuery = { limit?: number; cursor?: string };

/* ------------------------------------------------------------------------------------------------
 * Taxi fleet vehicles + camera media (flow v3)
 * ---------------------------------------------------------------------------------------------- */

export const ADMIN_TAXI_MEDIA_SLOTS = ['FRONT', 'REAR', 'SIDE', 'INTERIOR', 'VIDEO'] as const;
export type AdminTaxiMediaSlot = (typeof ADMIN_TAXI_MEDIA_SLOTS)[number];
export const ADMIN_TAXI_MEDIA_STATUSES = ['CURRENT', 'EXPIRING', 'EXPIRED', 'MISSING'] as const;
export type AdminTaxiMediaStatus = (typeof ADMIN_TAXI_MEDIA_STATUSES)[number];
export const ADMIN_TAXI_FLEET_STATUSES = ['ACTIVE', 'RETIRED'] as const;
export type AdminTaxiFleetStatus = (typeof ADMIN_TAXI_FLEET_STATUSES)[number];
export type AdminTaxiBidBlocker =
  | 'RC_NOT_APPROVED'
  | 'MEDIA_MISSING'
  | 'MEDIA_EXPIRED'
  | 'VEHICLE_RETIRED'
  | 'DRIVER_MISSING'
  | 'DRIVER_PHOTO_MISSING';

export type AdminTaxiMediaSlotState = {
  slot: AdminTaxiMediaSlot;
  status: AdminTaxiMediaStatus;
  mediaId: string | null;
  mediaAssetId?: string | null;
  capturedAt: string | null;
  expiresAt: string | null;
};

export type AdminTaxiMediaFreshness = {
  status: AdminTaxiMediaStatus;
  expiresAt: string | null;
  missingSlots: AdminTaxiMediaSlot[];
  expiredSlots: AdminTaxiMediaSlot[];
  current: boolean;
  slots: AdminTaxiMediaSlotState[];
};

export type AdminTaxiAssignedDriver = {
  assignmentId: string;
  accountId: string;
  username: string | null;
  phoneLast4: string | null;
};

export type AdminTaxiFleetDriverPhoto = {
  status: AdminTaxiMediaStatus;
  capturedAt: string | null;
  expiresAt: string | null;
  /** Signed GET (detail only); null on the list or when the bytes are gone. */
  url: string | null;
  urlExpiresInSeconds: number | null;
};

/** The vehicle's driver: the ACTIVE assigned driver, else the org owner once they captured a photo. */
export type AdminTaxiFleetDriver = {
  source: 'ASSIGNED' | 'OWNER';
  accountId: string;
  /** Name shown to customers on bid cards. */
  displayName: string | null;
  photo: AdminTaxiFleetDriverPhoto;
};

/** OpenAPI `AdminTaxiFleetVehicleDto` — the partner fleet card + `orgName`. */
export type AdminTaxiFleetVehicleDto = {
  id: string;
  orgId: string;
  orgName: string | null;
  registration: string;
  status: AdminTaxiFleetStatus;
  label: string | null;
  createdAt: string;
  updatedAt: string;
  vehicleId: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  role: 'OWNER' | 'PROVISIONAL_OWNER' | 'DRIVER' | null;
  rcStatus: 'NOT_SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  media: AdminTaxiMediaFreshness;
  assignedDriver: AdminTaxiAssignedDriver | null;
  driver?: AdminTaxiFleetDriver | null;
  canBid: boolean;
  bidBlockers: AdminTaxiBidBlocker[];
};

/** OpenAPI `AdminTaxiFleetMediaItemDto` — one live slot with a short-lived signed URL. */
export type AdminTaxiFleetMediaItemDto = {
  mediaId: string;
  slot: AdminTaxiMediaSlot;
  kind: 'PHOTO' | 'VIDEO';
  capturedAt: string | null;
  expiresAt: string | null;
  durationSeconds: number | null;
  /** Signed for 300 s; null when the bytes are gone. */
  url: string | null;
  urlExpiresInSeconds: number | null;
  contentType: string | null;
};

export type AdminTaxiFleetVehicleDetailDto = AdminTaxiFleetVehicleDto & {
  mediaItems: AdminTaxiFleetMediaItemDto[];
};

export type ListAdminTaxiFleetQuery = PageQuery & {
  orgId?: string;
  status?: AdminTaxiFleetStatus;
  canBid?: boolean;
  mediaStatus?: AdminTaxiMediaStatus;
};

/** GET /admin/v1/taxi/vehicles — a page scans ≤ 500 rows, so a short page may still carry a cursor. */
export async function listAdminTaxiFleetVehicles(
  client: ApiClient,
  query: ListAdminTaxiFleetQuery = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminTaxiFleetVehicleDto>> {
  const path = `/admin/v1/taxi/vehicles${buildQuery({
    orgId: query.orgId,
    status: query.status,
    canBid: query.canBid,
    mediaStatus: query.mediaStatus,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminTaxiFleetVehicleDto>(await client.get<unknown>(path, signalOption(options)));
}

/** GET /admin/v1/taxi/vehicles/{id} — card + `mediaItems` with signed URLs (300 s). */
export async function getAdminTaxiFleetVehicle(
  client: ApiClient,
  id: string,
  options: RequestOptions = {},
): Promise<AdminTaxiFleetVehicleDetailDto> {
  const response = await client.get<unknown>(
    `/admin/v1/taxi/vehicles/${enc(id)}`,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminTaxiFleetVehicleDetailDto;
}

/**
 * POST /admin/v1/taxi/vehicles/{id}/media/{mediaId}/remove {reason 3..500} — soft-deletes the slot
 * (vehicle becomes MEDIA_MISSING), purges bytes, notifies OWNER/MANAGER; audit `TAXI_MEDIA_REMOVED`.
 */
export async function removeAdminTaxiFleetMedia(
  client: ApiClient,
  id: string,
  mediaId: string,
  body: { reason: string },
  options: RequestOptions = {},
): Promise<AdminTaxiFleetVehicleDetailDto> {
  const response = await client.post<unknown>(
    `/admin/v1/taxi/vehicles/${enc(id)}/media/${enc(mediaId)}/remove`,
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminTaxiFleetVehicleDetailDto;
}

/* ------------------------------------------------------------------------------------------------
 * Taxi refunds queue + admin close of a taxi request
 * ---------------------------------------------------------------------------------------------- */

export const ADMIN_TAXI_REFUND_STATUSES = [
  'REQUESTED',
  'SUBMITTING',
  'PENDING',
  'PROCESSED',
  'FAILED',
  'NEEDS_RECONCILIATION',
] as const;
export type AdminTaxiRefundStatus = (typeof ADMIN_TAXI_REFUND_STATUSES)[number];

/** OpenAPI `AdminTaxiRefundQueueDto`. */
export type AdminTaxiRefundQueueDto = {
  id: string;
  bookingId: string;
  checkoutId: string;
  kind: 'CUSTOMER_ADVANCE' | 'PARTNER_DEPOSIT';
  reason: string;
  status: AdminTaxiRefundStatus;
  amountPaise: number;
  providerPaymentId: string;
  providerRefundId: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

/** GET /admin/v1/taxi/refunds?status — default (no status) = FAILED + NEEDS_RECONCILIATION. */
export async function listAdminTaxiRefunds(
  client: ApiClient,
  query: PageQuery & { status?: AdminTaxiRefundStatus } = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminTaxiRefundQueueDto>> {
  const path = `/admin/v1/taxi/refunds${buildQuery({
    status: query.status,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminTaxiRefundQueueDto>(await client.get<unknown>(path, signalOption(options)));
}

/**
 * POST /admin/v1/taxi/refunds/{id}/retry — `Idempotency-Key` (UUID) required + {reason}. Replay with
 * the same key is safe. 409 `taxi_refund_not_retryable` / `conflict_idempotency`.
 */
export async function retryAdminTaxiRefund(
  client: ApiClient,
  id: string,
  body: { reason: string },
  idempotencyKey: string,
  options: RequestOptions = {},
): Promise<AdminTaxiRefundQueueDto> {
  const response = await client.post<unknown>(`/admin/v1/taxi/refunds/${enc(id)}/retry`, body, {
    ...signalOption(options),
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return unwrapEnvelope(response) as AdminTaxiRefundQueueDto;
}

/* ------------------------------------------------------------------------------------------------
 * Driver invites (vehicle + user)
 * ---------------------------------------------------------------------------------------------- */

export type AdminDriverInviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

/** OpenAPI `AdminDriverInviteDto` — phone is last-4 masked; EXPIRED = PENDING past `expiresAt`. */
export type AdminDriverInviteDto = {
  id: string;
  vehicleId: string;
  status: AdminDriverInviteStatus;
  phoneMasked: string;
  inviteeAccountId: string | null;
  inviteeUsername: string | null;
  invitedByAccountId: string;
  invitedByUsername: string | null;
  note: string | null;
  membershipId: string | null;
  createdAt: string;
  expiresAt: string;
  resolvedAt: string | null;
};

/** GET /admin/v1/vehicles/{vehicleId}/driver-invites */
export async function listAdminVehicleDriverInvites(
  client: ApiClient,
  vehicleId: string,
  query: PageQuery = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminDriverInviteDto>> {
  const path = `/admin/v1/vehicles/${enc(vehicleId)}/driver-invites${buildQuery({
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminDriverInviteDto>(await client.get<unknown>(path, signalOption(options)));
}

/** GET /admin/v1/users/{userId}/driver-invites — sent to the account's phone or accepted by it. */
export async function listAdminUserDriverInvites(
  client: ApiClient,
  userId: string,
  query: PageQuery = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminDriverInviteDto>> {
  const path = `/admin/v1/users/${enc(userId)}/driver-invites${buildQuery({
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminDriverInviteDto>(await client.get<unknown>(path, signalOption(options)));
}

/* ------------------------------------------------------------------------------------------------
 * Garage org access, pass history and pass revenue
 * ---------------------------------------------------------------------------------------------- */

export type AdminGarageAccessDto = {
  orgId: string;
  orgName: string;
  state: 'Pass' | 'FreeBids' | 'Exhausted';
  canBid: boolean;
  storeEligible: boolean;
  reason:
    | 'store_not_provisioned'
    | 'store_not_published'
    | 'business_not_submitted'
    | 'exhausted_free_bids'
    | null;
  freeBidsPerWeek: number;
  freeBidsUsedThisWeek: number;
  freeBidsBonusThisWeek: number;
  freeBidsRemaining: number;
  freeBidsResetAt: string;
  activePass: {
    kind: 'DAY' | 'MONTH';
    startsAt: string;
    endsAt: string;
    purchaseId: string | null;
    source: 'CHECKOUT' | 'ADMIN_GRANT' | null;
  } | null;
  unlimitedUntil: string | null;
};

/** GET /admin/v1/garage/orgs/{orgId}/access */
export async function getAdminGarageAccess(
  client: ApiClient,
  orgId: string,
  options: RequestOptions = {},
): Promise<AdminGarageAccessDto> {
  const response = await client.get<unknown>(
    `/admin/v1/garage/orgs/${enc(orgId)}/access`,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminGarageAccessDto;
}

/** OpenAPI `GaragePassPurchaseDto` — checkout purchases and admin grants. */
export type AdminGaragePassPurchaseDto = {
  purchaseId: string;
  kind: 'DAY' | 'MONTH';
  amountRupees: number;
  startsAt: string;
  endsAt: string;
  purchasedAt: string;
  source: 'CHECKOUT' | 'ADMIN_GRANT';
  checkoutId: string | null;
  paymentRef: string | null;
  invoiceNumber: string | null;
};

/** GET /admin/v1/garage/orgs/{orgId}/passes?limit(1..50)&cursor */
export async function listAdminGaragePasses(
  client: ApiClient,
  orgId: string,
  query: PageQuery = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminGaragePassPurchaseDto>> {
  const path = `/admin/v1/garage/orgs/${enc(orgId)}/passes${buildQuery({
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminGaragePassPurchaseDto>(
    await client.get<unknown>(path, signalOption(options)),
  );
}

/** OpenAPI `AdminGarageRevenueDto` — PAID pass checkouts (GST-inclusive paise); grants excluded. */
export type AdminGarageRevenueDto = {
  id: string;
  purchaseId: string;
  checkoutId: string;
  orgId: string;
  orgName: string | null;
  kind: 'DAY_PASS' | 'MONTH_PASS';
  amountPaise: number;
  paymentRef: string;
  providerOrderId: string | null;
  createdAt: string;
};

/** GET /admin/v1/garage/revenue?from(incl.)&to(excl.)&orgId */
export async function listAdminGarageRevenue(
  client: ApiClient,
  query: PageQuery & { from?: string; to?: string; orgId?: string } = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminGarageRevenueDto>> {
  const path = `/admin/v1/garage/revenue${buildQuery({
    from: query.from,
    to: query.to,
    orgId: query.orgId,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminGarageRevenueDto>(await client.get<unknown>(path, signalOption(options)));
}

/* ------------------------------------------------------------------------------------------------
 * Notifications — user inbox (audited read), devices, SYSTEM broadcast
 * ---------------------------------------------------------------------------------------------- */

export type AdminNotificationAudience = 'CONSUMER' | 'PARTNER';

export const ADMIN_DEEP_LINK_SCREENS = [
  'CommunityReel',
  'GarageClip',
  'CommunityQuestion',
  'TaxiRequest',
  'TaxiBooking',
  'GarageRequest',
  'GarageJob',
  'StoreOrder',
  'VehicleDrivers',
  'Vehicle',
  'Plans',
  'Billing',
  'Trip',
  'DriveHome',
  'Streak',
  'DriverInvite',
  'Notifications',
  'PartnerTaxiRequest',
  'PartnerTaxiTrip',
  'PartnerTaxiFleet',
  'PartnerTaxiEnrollment',
  'PartnerGarageRequest',
  'PartnerGarageJob',
  'PartnerGaragePasses',
  'PartnerKyc',
  'PartnerClip',
  'PartnerStore',
] as const;
export type AdminDeepLinkScreen = (typeof ADMIN_DEEP_LINK_SCREENS)[number];

export type AdminDeepLinkDto = {
  screen: AdminDeepLinkScreen;
  params?: Record<string, unknown>;
};

/** OpenAPI `AdminUserNotificationDto`. `delivery: null` = the backend claims no send. */
export type AdminUserNotificationDto = {
  id: string;
  audience: AdminNotificationAudience;
  category: string;
  sourceCategory: string;
  title: string;
  body: string;
  deepLink: AdminDeepLinkDto;
  referenceId: string | null;
  createdAt: string;
  readAt: string | null;
  delivery: {
    status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
    channel: 'PUSH' | 'WHATSAPP' | 'SMS' | 'INAPP' | null;
    sentAt: string | null;
  } | null;
};

/** GET /admin/v1/users/{userId}/notifications — **writes an audit row** per page read. */
export async function listAdminUserNotifications(
  client: ApiClient,
  userId: string,
  query: PageQuery & { audience?: AdminNotificationAudience } = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminUserNotificationDto>> {
  const path = `/admin/v1/users/${enc(userId)}/notifications${buildQuery({
    audience: query.audience,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminUserNotificationDto>(await client.get<unknown>(path, signalOption(options)));
}

/** OpenAPI `AdminUserDeviceDto` — never a full token. */
export type AdminUserDeviceDto = {
  app: 'CONSUMER' | 'PARTNER';
  platform: 'ANDROID' | 'IOS' | 'WEB';
  registeredAt: string;
  lastSeenAt: string | null;
  tokenSuffix: string;
};

/** GET /admin/v1/users/{userId}/devices */
export async function listAdminUserDevices(
  client: ApiClient,
  userId: string,
  options: RequestOptions = {},
): Promise<AdminUserDeviceDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/users/${enc(userId)}/devices`,
    signalOption(options),
  );
  const data = unwrapEnvelope(response);
  return Array.isArray(data) ? (data as AdminUserDeviceDto[]) : [];
}

export const ADMIN_SYSTEM_NOTIFICATION_LIMITS = {
  accountIdsMax: 500,
  titleMax: 80,
  bodyMax: 500,
  reasonMin: 3,
  reasonMax: 500,
} as const;

export type AdminSystemNotificationBody = {
  audience: AdminNotificationAudience;
  accountIds: string[];
  title: string;
  body: string;
  deepLink?: AdminDeepLinkDto;
  reason: string;
};

export type AdminSystemNotificationResultDto = {
  broadcastId: string;
  queued: number;
  skipped: number;
};

/** POST /admin/v1/notifications/system → 202. 10/admin/hour (`rate_limited` 429). */
export async function sendAdminSystemNotification(
  client: ApiClient,
  body: AdminSystemNotificationBody,
  options: RequestOptions = {},
): Promise<AdminSystemNotificationResultDto> {
  const response = await client.post<unknown>(
    '/admin/v1/notifications/system',
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminSystemNotificationResultDto;
}

/* ------------------------------------------------------------------------------------------------
 * Community comment moderation
 * ---------------------------------------------------------------------------------------------- */

export type AdminCommunityCommentStatus = 'VISIBLE' | 'HIDDEN';

export type AdminCommunityCommentDto = {
  id: string;
  reelId: string;
  reelTitle: string;
  partnerOrgId: string | null;
  parentCommentId: string | null;
  authorAccountId: string;
  authorUsername: string | null;
  body: string;
  mentions: string[];
  status: AdminCommunityCommentStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListAdminCommunityCommentsQuery = PageQuery & {
  reelId?: string;
  partnerOrgId?: string;
  status?: AdminCommunityCommentStatus;
  q?: string;
};

/** GET /admin/v1/community/comments */
export async function listAdminCommunityComments(
  client: ApiClient,
  query: ListAdminCommunityCommentsQuery = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminCommunityCommentDto>> {
  const path = `/admin/v1/community/comments${buildQuery({
    reelId: query.reelId,
    partnerOrgId: query.partnerOrgId,
    status: query.status,
    q: query.q?.trim(),
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminCommunityCommentDto>(await client.get<unknown>(path, signalOption(options)));
}

/** PATCH /admin/v1/community/comments/{id} {status, reason?} — audit `COMMUNITY_COMMENT_MODERATION`. */
export async function moderateAdminCommunityComment(
  client: ApiClient,
  id: string,
  body: { status: AdminCommunityCommentStatus; reason?: string },
  options: RequestOptions = {},
): Promise<AdminCommunityCommentDto> {
  const response = await client.patch<unknown>(
    `/admin/v1/community/comments/${enc(id)}`,
    body,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminCommunityCommentDto;
}

/* ------------------------------------------------------------------------------------------------
 * Roadside assistance (RAS) requests
 * ---------------------------------------------------------------------------------------------- */

export const ADMIN_RAS_STATUSES = [
  'REQUESTING',
  'ASSIGNED',
  'EN_ROUTE',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
] as const;
export type AdminRasStatus = (typeof ADMIN_RAS_STATUSES)[number];

/** OpenAPI `AdminRasRequestDto` — no phone / name. `status` is display text; `statusCode` the enum. */
export type AdminRasRequestDto = {
  id: string;
  status: string;
  statusCode: AdminRasStatus;
  issueType: string;
  vehicleId: string;
  vehicleLabel: string;
  locationLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  detail: string;
  providerId?: string | null;
  providerName?: string | null;
  etaMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
  accountId: string;
};

/** GET /admin/v1/services/ras/requests?status */
export async function listAdminRasRequests(
  client: ApiClient,
  query: PageQuery & { status?: AdminRasStatus } = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminRasRequestDto>> {
  const path = `/admin/v1/services/ras/requests${buildQuery({
    status: query.status,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminRasRequestDto>(await client.get<unknown>(path, signalOption(options)));
}

/** GET /admin/v1/services/ras/requests/{id} */
export async function getAdminRasRequest(
  client: ApiClient,
  id: string,
  options: RequestOptions = {},
): Promise<AdminRasRequestDto> {
  const response = await client.get<unknown>(
    `/admin/v1/services/ras/requests/${enc(id)}`,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminRasRequestDto;
}

/* ------------------------------------------------------------------------------------------------
 * DriveQuant trips + driver score (both reads write an audit row `DRIVER_TRIP_ACCESS`)
 * ---------------------------------------------------------------------------------------------- */

export type AdminUserTripDto = {
  tripId: string;
  vehicleId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  distanceKm: number | null;
  durationMinutes: number | null;
  drivingDurationMinutes: number | null;
  scores: {
    safety: number | null;
    eco: number | null;
    distraction: number | null;
    speeding: number | null;
  };
  verified: boolean;
  receivedAt: string;
  source: 'PUSH' | 'PULL' | 'CLIENT';
};

/** GET /admin/v1/users/{userId}/trips?from&to&limit(1..50)&cursor — audited read. */
export async function listAdminUserTrips(
  client: ApiClient,
  userId: string,
  query: PageQuery & { from?: string; to?: string } = {},
  options: RequestOptions = {},
): Promise<AdminV4Page<AdminUserTripDto>> {
  const path = `/admin/v1/users/${enc(userId)}/trips${buildQuery({
    from: query.from,
    to: query.to,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  return readPage<AdminUserTripDto>(await client.get<unknown>(path, signalOption(options)));
}

/** OpenAPI `DriverScoreDto` (the `/v1/me/driver-score` view). */
export type AdminDriverScoreDto = {
  accountId: string;
  score: number | null;
  tripCount: number;
  source: 'NONE' | 'ACCOUNT_TRIPS' | 'DRIVEQUANT';
  disclaimer: string;
  driveQuant?: {
    scale: number | string;
    windowDays: number;
    windowTripCount: number;
    windowDistanceKm: number;
    safety: number | null;
    eco: number | null;
    distraction: number | null;
    speeding: number | null;
    lastTripAt: string | null;
  };
};

/** GET /admin/v1/users/{userId}/driver-score — audited read. */
export async function getAdminUserDriverScore(
  client: ApiClient,
  userId: string,
  options: RequestOptions = {},
): Promise<AdminDriverScoreDto> {
  const response = await client.get<unknown>(
    `/admin/v1/users/${enc(userId)}/driver-score`,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminDriverScoreDto;
}

/** DriveQuant event kinds (`DqTripEventDto.kind`). */
export type AdminDqEventKind = 'SAFETY' | 'DISTRACTION' | 'CALL' | 'SPEEDING' | 'STOP';

/** Decrypted event location — present only when the server returns it. */
export type AdminDqGeoPoint = { lat: number; lng: number; heading?: number; elevation?: number };

/** OpenAPI `DqTripEventDto`. */
export type AdminDqTripEvent = {
  /** {@link AdminDqEventKind} (kept open for forward-compatible values). */
  kind: string;
  seq: number;
  /** Seconds since trip start. */
  offsetS: number | null;
  at: string | null;
  /** SAFETY 1 adherence / 2 acceleration / 3 braking; DISTRACTION 1 screen on / 2 off; CALL 3 start / 4 end; SPEEDING 1 start / 0 end. */
  type: number | null;
  /** SAFETY: 1 strong, 2 harsh. */
  level: number | null;
  /** SAFETY: m/s² (acceleration / braking) or 0–1 (adherence). */
  value: number | null;
  velocityKmh: number | null;
  distanceM: number | null;
  durationS: number | null;
  attrs: Record<string, unknown>;
  location: AdminDqGeoPoint | null;
};

/** OpenAPI `DqTripTelemetryDto` — the admin read never carries `route`. */
export type AdminDqTripTelemetry = {
  schemaVersion: number;
  processingDate: string | null;
  timezoneOffsetMin: number | null;
  /** PUSH | PULL (kept open for forward-compatible values). */
  source: string;
  versionsReceived: number;
  /** DriveQuant metric sections keyed by DriveQuant name (DriveQuant units). */
  metrics: Record<string, unknown>;
  places: Record<string, string> | null;
  events: AdminDqTripEvent[];
  routePoints: number | null;
  receivedAt: string;
  updatedAt: string;
};

/** OpenAPI `AdminUserTripDetailDto` — the trip summary + telemetry (null for a phone-reported trip). */
export type AdminUserTripDetailDto = Omit<AdminUserTripDto, 'source'> & {
  telemetry: AdminDqTripTelemetry | null;
};

/** GET /admin/v1/users/{userId}/trips/{tripId} — audited (`DRIVER_TRIP_ACCESS`), `no-store`. */
export async function getAdminUserTrip(
  client: ApiClient,
  userId: string,
  tripId: string,
  options: RequestOptions = {},
): Promise<AdminUserTripDetailDto> {
  const response = await client.get<unknown>(
    `/admin/v1/users/${enc(userId)}/trips/${enc(tripId)}`,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminUserTripDetailDto;
}

/** `dq_crashes.state`: FAILED_TO_PREDICT is stored for admin review and never escalated. */
export type AdminDqCrashState = 'CONFIRMED' | 'UNCONFIRMED' | 'FAILED_TO_PREDICT';

/** `dq_crashes.outcome` (`DqCrashAck.outcome`). */
export type AdminDqCrashOutcome =
  | 'DISPATCHED'
  | 'UNCONFIRMED'
  | 'UNATTRIBUTED'
  | 'NO_VEHICLE'
  | 'NOT_ENTITLED'
  | 'CANCELLED'
  | 'QUARANTINED';

/** Consent / plan gap recorded at receipt (a CONFIRMED crash still escalates). */
export type AdminDqWithheldReason = 'NO_CONSENT' | 'NOT_ENTITLED';

/** The account's own paid-plan state at receipt (null on rows stored before 0250). */
export type AdminDqEntitlementStatus = 'ENTITLED' | 'NOT_ENTITLED';

/** How the crash vehicle was chosen (`dq_crashes.vehicle_attribution`). */
export type AdminDqVehicleAttribution =
  | 'TRIP_MATCH'
  | 'SINGLE_BINDING'
  | 'LAST_TRIP'
  | 'FIRST_BINDING_FALLBACK'
  | 'ACCOUNT_VEHICLE_FALLBACK'
  | 'APP_SOS';

/** OpenAPI `DqAdminCrashDto` — one crash of a user (no location). */
export type AdminDqUserCrashDto = {
  crashId: string;
  /** {@link AdminDqCrashState} (kept open for forward-compatible values). */
  state: string;
  /** 0–100 (integer). */
  probability: number | null;
  /** {@link AdminDqCrashOutcome} (kept open). */
  outcome: string;
  crashAt: string | null;
  incidentId: string | null;
  vehicleId: string | null;
  dqTripId: string | null;
  /** {@link AdminDqVehicleAttribution} (kept open). */
  vehicleAttribution: string | null;
  /** {@link AdminDqWithheldReason} — absent on servers that predate it. */
  withheldReason?: string | null;
  /** {@link AdminDqEntitlementStatus} — absent on servers that predate it. */
  entitlementStatus?: string | null;
  /** km/h at impact. */
  velocityKmh: number | null;
  crashType: number | null;
  hasSensorData: boolean;
  receivedAt: string;
};

/** GET /admin/v1/users/{userId}/crashes?limit=1..200 — audited (`DRIVER_TRIP_ACCESS`). */
export async function listAdminUserCrashes(
  client: ApiClient,
  userId: string,
  query: { limit?: number } = {},
  options: RequestOptions = {},
): Promise<AdminDqUserCrashDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/users/${enc(userId)}/crashes${buildQuery({ limit: query.limit })}`,
    signalOption(options),
  );
  const data = unwrapEnvelope(response);
  return Array.isArray(data) ? (data as AdminDqUserCrashDto[]) : [];
}

/** OpenAPI `DqCrashTelemetryDto` — decrypted crash telemetry (admin SOS console). */
export type AdminDqCrashTelemetryDto = {
  crashId: string;
  /** {@link AdminDqCrashState} */
  state: string;
  /** 0–100 (integer). */
  probability: number | null;
  outcome: string;
  crashAt: string | null;
  tripStartedAt: string | null;
  dqTripId: string | null;
  vehicleId: string | null;
  vehicleAttribution: string | null;
  /** {@link AdminDqWithheldReason} — absent on servers that predate it. */
  withheldReason?: string | null;
  /** {@link AdminDqEntitlementStatus} — absent on servers that predate it. */
  entitlementStatus?: string | null;
  predictionVersion: string | null;
  crashType: number | null;
  velocityClass: number | null;
  /** km/h at impact. */
  velocityKmh: number | null;
  velocityOffsetNearKmh: number | null;
  /** gpsFeatures (no lat/lng), movementFeatures, windows, metaData. */
  features: Record<string, unknown> | null;
  gpsSamples: number | null;
  imuSamples: number | null;
  gpsAccuracyM: { min: number | null; max: number | null };
  location: { lat: number; lng: number } | null;
  userLocationUrl: string | null;
  /** GPS window: timestamp (s), latitude, longitude, velocity (km/h), heading, accuracy (m), elevation. */
  gps: Record<string, number[]> | null;
  /** IMU window: timestamp (ms), accelerationX/Y/Z (mG) + any further series DriveQuant adds. */
  imu: Record<string, number[]> | null;
  /** Crash Report push: tripConditions, driverFatigue, aggressiveDriving, phoneUsage, speeding, riskFactors. */
  report: Record<string, unknown> | null;
  versionsReceived: number;
  receivedAt: string;
};

/** GET /admin/v1/sos-incidents/{incidentId}/crash-telemetry — audited `INCIDENT_PII_ACCESS`, `no-store`. */
export async function getAdminSosCrashTelemetry(
  client: ApiClient,
  incidentId: string,
  options: RequestOptions = {},
): Promise<AdminDqCrashTelemetryDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/sos-incidents/${enc(incidentId)}/crash-telemetry`,
    signalOption(options),
  );
  const data = unwrapEnvelope(response);
  return Array.isArray(data) ? (data as AdminDqCrashTelemetryDto[]) : [];
}

/** OpenAPI `DqOpsAlertDto.kind`. */
export type AdminDqOpsAlertKind =
  | 'NO_VEHICLE_CONFIRMED_CRASH'
  | 'UNPAID_CONFIRMED_CRASH'
  | 'FAILED_TO_PREDICT_CRASH'
  | 'MALFORMED_CRASH'
  | 'VEHICLE_FALLBACK_CRASH';

/** OpenAPI `DqOpsAlertDto` — PII-free (ids, reason codes, timestamps; no account id, no location). */
export type AdminDqOpsAlertDto = {
  id: string;
  /** {@link AdminDqOpsAlertKind} (kept open). */
  kind: string;
  /** crashId, or the quarantined payload digest. */
  ref: string;
  incidentId: string | null;
  /** Reason codes only. */
  detail: unknown;
  createdAt: string;
  acknowledgedAt: string | null;
};

/** GET /admin/v1/drivequant/ops-alerts?limit=1..200&includeAcknowledged= (open only by default). */
export async function listAdminDriveQuantOpsAlerts(
  client: ApiClient,
  query: { limit?: number; includeAcknowledged?: boolean } = {},
  options: RequestOptions = {},
): Promise<AdminDqOpsAlertDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/drivequant/ops-alerts${buildQuery({
      limit: query.limit,
      includeAcknowledged: query.includeAcknowledged ? true : undefined,
    })}`,
    signalOption(options),
  );
  const data = unwrapEnvelope(response);
  return Array.isArray(data) ? (data as AdminDqOpsAlertDto[]) : [];
}

/** POST /admin/v1/drivequant/ops-alerts/{id}/acknowledge → `{acknowledged:true}` (404 when not open). */
export async function acknowledgeAdminDriveQuantOpsAlert(
  client: ApiClient,
  id: string,
  options: RequestOptions = {},
): Promise<{ acknowledged: boolean }> {
  const response = await client.post<unknown>(
    `/admin/v1/drivequant/ops-alerts/${enc(id)}/acknowledge`,
    undefined,
    signalOption(options),
  );
  return unwrapEnvelope(response) as { acknowledged: boolean };
}

/* ------------------------------------------------------------------------------------------------
 * Dashboard queue counters
 * ---------------------------------------------------------------------------------------------- */

/** OpenAPI `AdminQueueStatsDto` — exact integer counters, no PII, not audited. */
export type AdminQueueStatsDto = {
  ownershipClaimsPending: number;
  taxiDisputed: number;
  taxiFlagged: number;
  taxiPendingPartnerDeposit: number;
  kycPendingReview: number;
  supportOpen: number;
  websiteBookingsPending: number;
  taxiRefundsNeedingAction: number;
};

/** GET /admin/v1/stats/queues */
export async function getAdminQueueStats(
  client: ApiClient,
  options: RequestOptions = {},
): Promise<AdminQueueStatsDto> {
  const response = await client.get<unknown>('/admin/v1/stats/queues', signalOption(options));
  return unwrapEnvelope(response) as AdminQueueStatsDto;
}

/* ------------------------------------------------------------------------------------------------
 * Plate scanning (ANPR) admin
 * ---------------------------------------------------------------------------------------------- */

export type AdminPlateProtection = 'PROTECTED' | 'EXPIRING' | 'UNPROTECTED';

/** OpenAPI `AdminPlateVehicleDto`. */
export type AdminPlateVehicleDto = {
  vehicleId: string;
  registration: string;
  plateKey: string | null;
  ownerAccountId: string | null;
  ownershipVerified: boolean;
  protection: AdminPlateProtection;
  make: string | null;
  model: string | null;
  color: string | null;
};

/** GET /admin/v1/vehicles?plate= — matched on the normalized plate key. */
export async function searchAdminVehiclesByPlate(
  client: ApiClient,
  plate: string,
  options: RequestOptions = {},
): Promise<AdminPlateVehicleDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/vehicles${buildQuery({ plate: plate.trim() })}`,
    signalOption(options),
  );
  return readItems<AdminPlateVehicleDto>(response);
}

export type AdminPlateCollisionDto = {
  plateKey: string;
  vehicleCount: number;
  verifiedCount: number;
  vehicles: AdminPlateVehicleDto[];
};

/** GET /admin/v1/vehicles/plate-collisions?limit */
export async function listAdminPlateCollisions(
  client: ApiClient,
  query: { limit?: number } = {},
  options: RequestOptions = {},
): Promise<AdminPlateCollisionDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/vehicles/plate-collisions${buildQuery({ limit: query.limit })}`,
    signalOption(options),
  );
  return readItems<AdminPlateCollisionDto>(response);
}

/** GET /admin/v1/vehicles/plate-keys/unparsed?limit */
export async function listAdminUnparsedPlates(
  client: ApiClient,
  query: { limit?: number } = {},
  options: RequestOptions = {},
): Promise<AdminPlateVehicleDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/vehicles/plate-keys/unparsed${buildQuery({ limit: query.limit })}`,
    signalOption(options),
  );
  return readItems<AdminPlateVehicleDto>(response);
}

export type AdminPlateKeyBackfillResultDto = {
  processed: number;
  keyed: number;
  unparsed: number;
  remaining: number;
};

/** POST /admin/v1/vehicles/plate-keys/backfill — one batch; re-run while `remaining > 0`. */
export async function runAdminPlateKeyBackfill(
  client: ApiClient,
  options: RequestOptions = {},
): Promise<AdminPlateKeyBackfillResultDto> {
  const response = await client.post<unknown>(
    '/admin/v1/vehicles/plate-keys/backfill',
    undefined,
    signalOption(options),
  );
  return unwrapEnvelope(response) as AdminPlateKeyBackfillResultDto;
}

export const ADMIN_SCAN_LOOKUP_RESULTS = [
  'MATCH',
  'NO_MATCH',
  'RETRY_LATER',
  'STEP_UP',
  'INVALID',
] as const;
export type AdminScanLookupResult = (typeof ADMIN_SCAN_LOOKUP_RESULTS)[number];

/** OpenAPI `AdminScanLookupDto` — the plate is only ever an HMAC here. */
export type AdminScanLookupDto = {
  id: string;
  createdAt: string;
  accountId: string | null;
  webSessionId: string | null;
  result: AdminScanLookupResult;
  source: 'OCR' | 'MANUAL' | 'LEGACY_QR';
  channel: 'APP' | 'WEB' | 'LEGACY_QR';
  score: number;
  attestation: 'VERIFIED' | 'DEV_ALLOWED' | 'MISSING' | 'FAILED' | 'NOT_APPLICABLE';
  stepUpPassed: 'CAPTCHA' | 'OTP' | null;
  plateHmac: string | null;
  vehicleId: string | null;
  ambiguous: boolean;
  hotPlate: boolean;
};

export type ListAdminScanLookupsQuery = {
  accountId?: string;
  result?: AdminScanLookupResult;
  hours?: number;
  limit?: number;
};

/** GET /admin/v1/scan/lookups?accountId&result&hours&limit */
export async function listAdminScanLookups(
  client: ApiClient,
  query: ListAdminScanLookupsQuery = {},
  options: RequestOptions = {},
): Promise<AdminScanLookupDto[]> {
  const response = await client.get<unknown>(
    `/admin/v1/scan/lookups${buildQuery({
      accountId: query.accountId?.trim(),
      result: query.result,
      hours: query.hours,
      limit: query.limit,
    })}`,
    signalOption(options),
  );
  return readItems<AdminScanLookupDto>(response);
}

export type AdminScanScannerDto = {
  accountId: string | null;
  webSessionId: string | null;
  lookups: number;
  noMatch: number;
  stepUps: number;
  retryLater: number;
  maxScore: number;
  distinctPlates: number;
};

export type AdminScanFlagDto = {
  id: string;
  accountId: string | null;
  webSessionId: string | null;
  reason: 'DISTINCT_PLATES' | 'ABUSE_SCORE';
  score: number;
  blockedUntil: string;
  createdAt: string;
  clearedAt: string | null;
};

export type AdminScanAbuseDto = {
  scanners: AdminScanScannerDto[];
  flags: AdminScanFlagDto[];
};

/** GET /admin/v1/scan/abuse?hours */
export async function getAdminScanAbuse(
  client: ApiClient,
  query: { hours?: number } = {},
  options: RequestOptions = {},
): Promise<AdminScanAbuseDto> {
  const response = await client.get<unknown>(
    `/admin/v1/scan/abuse${buildQuery({ hours: query.hours })}`,
    signalOption(options),
  );
  const data = unwrapEnvelope(response) as Partial<AdminScanAbuseDto> | null;
  return {
    scanners: Array.isArray(data?.scanners) ? data.scanners : [],
    flags: Array.isArray(data?.flags) ? data.flags : [],
  };
}

/**
 * POST /admin/v1/scan/flags/{id}/clear — unblocks the scanner. The server records who cleared it
 * (`cleared_by`); it accepts no body, so no reason is sent. 404 = no such active flag.
 */
export async function clearAdminScanFlag(
  client: ApiClient,
  id: string,
  options: RequestOptions = {},
): Promise<{ cleared: boolean }> {
  const response = await client.post<unknown>(
    `/admin/v1/scan/flags/${enc(id)}/clear`,
    undefined,
    signalOption(options),
  );
  return unwrapEnvelope(response) as { cleared: boolean };
}

export type AdminActiveVehicleDuplicatesDto = {
  /** Whether migration 0146's unique index (one ACTIVE plan per vehicle) exists. */
  indexPresent: boolean;
  duplicates: { vehicleId: string; subscriptionIds: string[] }[];
};

/** GET /admin/v1/subscriptions/active-vehicle-duplicates — 0146 pre-deploy check. */
export async function getAdminActiveVehicleDuplicates(
  client: ApiClient,
  options: RequestOptions = {},
): Promise<AdminActiveVehicleDuplicatesDto> {
  const response = await client.get<unknown>(
    '/admin/v1/subscriptions/active-vehicle-duplicates',
    signalOption(options),
  );
  const data = unwrapEnvelope(response) as Partial<AdminActiveVehicleDuplicatesDto> | null;
  return {
    indexPresent: data?.indexPresent === true,
    duplicates: Array.isArray(data?.duplicates) ? data.duplicates : [],
  };
}
