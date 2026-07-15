import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope, readEnvelopeMeta } from './envelope';
import type { ApiPlanTier } from './plans';

/** OpenAPI `BatchSummaryDto.status` */
export type QrBatchStatus =
  | 'DRAFT'
  | 'CODES_GENERATED'
  | 'PRINTING'
  | 'QA'
  | 'PROVISIONED'
  | 'REPRINT'
  | 'ALLOCATED'
  | 'IN_DISTRIBUTION'
  | 'DEPLETED'
  | 'SCRAPPED';

/** OpenAPI `BatchSummaryDto.channel` */
export type QrBatchChannel = 'B2C' | 'B2B2C' | 'B2B';

/** OpenAPI `BatchSummaryDto` */
export type BatchSummaryDto = {
  id: string;
  batchCode: string;
  channel: QrBatchChannel;
  skuId: string;
  status: QrBatchStatus;
  totalCount: number;
  generatedCount: number;
  provisionedCount: number;
  createdAt: string;
  provisionedAt: string | null;
};

/** OpenAPI `PromoDto` */
export type AdminPromoDto = {
  id: string;
  code: string;
  discountPercent: number | null;
  discountPaise: number | null;
  validFrom: string | null;
  validTo: string | null;
  maxRedemptions: number | null;
  maxPerAccount: number | null;
  active: boolean;
};

/** OpenAPI `CreatePromoBodyDto` */
export type CreatePromoBody = {
  code: string;
  discountPercent?: number;
  discountPaise?: number;
  validFrom: string;
  validTo: string;
  maxRedemptions?: number;
  maxPerAccount?: number;
  active?: boolean;
};

/** OpenAPI audit action enum subset — extend as backend adds values. */
export type AuditAction =
  | 'PAYOUT_ISSUED'
  | 'TRANSFER_APPROVED'
  | 'REFUND_OR_CLAWBACK'
  | 'QR_CODE_DEACTIVATED'
  | 'BATCH_PROVISIONED'
  | 'RCRECORD_ACCESS'
  | 'OWNER_NAME_ACCESS'
  | 'PARK_PII_ACCESS'
  | 'EMERGENCY_MEDIA_ACCESS'
  | 'INCIDENT_PII_ACCESS'
  | 'CORPORATE_PII_ACCESS'
  | 'SETTLEMENT_DISCREPANCY'
  | 'INCIDENT_STALLED'
  | 'CHARGEBACK_AFTER_CLAIM'
  | 'ENTITLEMENT_DORMANT'
  | 'BATCH_CODES_GENERATED'
  | 'PRINTRUN_SUBMITTED'
  | 'QA_APPROVED'
  | 'QA_REJECTED'
  | 'BATCH_ALLOCATED'
  | 'BATCH_SCRAPPED'
  | 'BULK_ORDER_CONFIRMED'
  | 'INVOICE_ISSUED'
  | 'INVOICE_PAID'
  | 'CREDIT_NOTE_ISSUED'
  | 'ENTITLEMENTS_MINTED'
  | 'ENTITLEMENT_SUSPENDED'
  | 'ENTITLEMENT_REVOKED'
  | 'ACCOUNT_ERASURE'
  | 'CONSENT_WITHDRAWAL'
  | 'AUDIT_EXPORTED'
  | 'PARTNER_ENROLLED'
  | (string & {});

/** OpenAPI `AuditEventDto` — nullable object fields typed as `object | null`. */
export type AuditEventDto = {
  id: string;
  action: AuditAction;
  actorAccountId: object | null;
  actorAdminId: object | null;
  targetType: object | null;
  targetId: object | null;
  metadata: object | null;
  at: string;
};

/** OpenAPI `CreateBatchDto` — `planTier` required when `channel` is `B2B` (ops batch_code). */
export type CreateBatchBody = {
  channel: QrBatchChannel;
  skuId: string;
  totalCount: number;
  planTier?: ApiPlanTier;
};

/**
 * OpenAPI `SkuSummaryDto` — a catalog row. Carries the SHELF (`offeredTiers`), because the shelf is a
 * server-enforced money control, not a display hint: a tier that is not on it cannot be sold against this
 * Sku's stock ([09-sales-channels § Routing]). The console must be able to see and edit it.
 */
export type SkuSummaryDto = {
  id: string;
  skuCode: string;
  channel: QrBatchChannel;
  prepaid: boolean;
  listPricePaise: number;
  /** The sellable shelf. Empty is never legitimate — it sells nothing (fail-closed). */
  offeredTiers: ApiPlanTier[];
  defaultPlanId: string | null;
  /** Server-derived from the default plan row; never sent by a client. */
  defaultPlanVersion: number | null;
  riderDefault: number;
  sponsorOrgId: string | null;
  /** Eligible for NEW batches. Does NOT gate the sell path — stickers already printed keep selling. */
  active: boolean;
};

/** Query for `GET /admin/v1/skus`. */
export type ListSkusQuery = {
  channel?: QrBatchChannel;
  /** Default false — the picker only wants Skus you may still manufacture against. */
  includeInactive?: boolean;
};

/** Body for `POST /admin/v1/skus`. `defaultPlanVersion` is absent on purpose — the server derives it. */
export type CreateSkuBody = {
  skuCode: string;
  channel: QrBatchChannel;
  defaultPlanId: string;
  offeredTiers: ApiPlanTier[];
  listPricePaise: number;
  prepaid: boolean;
  riderDefault?: number;
  sponsorOrgId?: string;
  active?: boolean;
};

/**
 * Body for `PATCH /admin/v1/skus/{skuId}` — the MUTABLE set only. `skuCode`, `channel`, `prepaid` and
 * `sponsorOrgId` are immutable after create: a QrBatch freezes its `(channel, sku_id)` at generate, so
 * flipping a channel would retroactively rewrite the journey of every sticker already printed.
 */
export type UpdateSkuBody = {
  defaultPlanId?: string;
  offeredTiers?: ApiPlanTier[];
  listPricePaise?: number;
  riderDefault?: number;
  active?: boolean;
};

/** OpenAPI `AdminPlanDto` — one plan VERSION, including superseded/retired ones (the console needs history). */
export type AdminPlanDto = {
  id: string;
  tier: ApiPlanTier;
  version: number;
  name: string;
  pricePaise: number;
  riderEligible: boolean;
  period: 'YEARLY';
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isEffectiveNow: boolean;
};

/** Query for `GET /admin/v1/plans`. */
export type ListAdminPlansQuery = {
  tier?: ApiPlanTier;
};

/**
 * Body for `POST /admin/v1/plans` — mints a NEW `(tier, version)`. `version` is absent on purpose: plans are
 * IMMUTABLE, so a price/name change is a new row, and the server derives `version = max+1` under a lock.
 * `retireCurrent` stamps the outgoing version's `effective_to` in the same transaction.
 */
export type CreatePlanBody = {
  tier: ApiPlanTier;
  name: string;
  pricePaise: number;
  riderEligible: boolean;
  period: 'YEARLY';
  effectiveFrom?: string;
  retireCurrent?: boolean;
};

/**
 * Body for `PATCH /admin/v1/plans/{planId}` — LIFECYCLE ONLY (publish / retire). Price, tier and name are
 * absent by design: a live Subscription pins `(plan_id, plan_version)`, so editing a price in place would
 * retro-reprice customers who already paid. The server rejects a body naming them.
 */
export type UpdatePlanBody = {
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

/** OpenAPI `PlanFeaturesDto` — the plan card's copy, keyed by the PLAN VERSION it was authored for. */
export type PlanFeaturesDto = {
  planId: string;
  features: string[];
  badge: string | null;
  includesLabel: string | null;
};

/** Body for `PATCH /admin/v1/plans/{planId}/features`. An empty `features` renders a blank card → rejected. */
export type UpdatePlanFeaturesBody = {
  features: string[];
  badge?: string | null;
  includesLabel?: string | null;
};

/** OpenAPI `ReplacedDto` */
export type ReplacedDto = {
  oldCode: string;
  newCode: string;
  vehicleId: string;
  subscriptionId: string | null;
};

/** OpenAPI `RetiredDto` */
export type RetiredDto = {
  qrCodeId: string;
  code: string;
};

/** OpenAPI `QrAutoDetachResultDto` */
export type QrAutoDetachResultDto = {
  scanned: number;
  detached: number;
  skippedPaid: number;
};

/** OpenAPI `ClawbackBodyDto` */
export type ClawbackBody = {
  paymentRef: string;
};

/** OpenAPI `ClawbackResultDto` */
export type ClawbackResultDto = {
  paymentRef: string;
  paymentState: 'CB_LOST';
  commissionStatus: string | null;
};

/** OpenAPI `InitiateTransferDto` */
export type InitiateTransferBody = {
  code: string;
};

/** OpenAPI `ApproveTransferDto` */
export type ApproveTransferBody = {
  toAccountId: string;
};

/** OpenAPI `TransferInitiatedDto` */
export type TransferInitiatedDto = {
  transferId: string;
  vehicleId: string;
  status: 'INITIATED';
};

/** OpenAPI `TransferCompletedDto` */
export type TransferCompletedDto = {
  transferId: string;
  vehicleId: string;
  toAccountId: string;
  status: 'COMPLETED';
};

/** OpenAPI `SettlementBatchResultDto` */
export type SettlementBatchResultDto = {
  groups: number;
  payouts: number;
  skipped: number;
  errors: number;
  payoutIds: string[];
};

/** OpenAPI `ReorderFulfilResultDto` */
export type ReorderFulfilResultDto = {
  reorderId: string;
  status: 'CONFIRMED';
  allocated: number;
  locationId: string;
};

export type ListQrInventoryQuery = {
  state?: QrBatchStatus;
};

/** OpenAPI `BatchCodeDto.status` */
export type QrCodeStatus =
  | 'MANUFACTURED'
  | 'PROVISIONED'
  | 'DISTRIBUTED'
  | 'ATTACHED'
  | 'ATTACHED_UNPAID'
  | 'ACTIVATED'
  | 'LAPSED'
  | 'TRANSFERRED'
  | 'CANCELLED'
  | 'REPLACED_LOST'
  | 'RETIRED';

/** OpenAPI `BatchCodeDto` — opaque sticker drill-down (non-PII). */
export type BatchCodeDto = {
  id: string;
  code: string;
  status: QrCodeStatus;
  createdAt: string;
  activatedAt: string | null;
  retiredAt: string | null;
};

export type ListQrBatchCodesQuery = {
  status?: QrCodeStatus;
  cursor?: string;
  limit?: number;
};

export type QueryAuditEventsParams = {
  action?: AuditAction;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
};

/** OpenAPI `PaginationDto` */
export type PaginationDto = {
  limit: number;
  cursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
};

/** Paginated audit events response with envelope meta. */
export type AuditEventsPageResult = {
  events: AuditEventDto[];
  pagination: PaginationDto | null;
  requestId: string | null;
  correlationId: string | null;
};

/** Paginated batch codes response with envelope meta. */
export type QrBatchCodesPageResult = {
  codes: BatchCodeDto[];
  pagination: PaginationDto | null;
  requestId: string | null;
  correlationId: string | null;
};

/** OpenAPI `AdminOrderSummary.status` / `AdminOrderDetail.status` — the order lifecycle. */
export type AdminOrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';

/** OpenAPI `AdminOrderSummary.orderKind` — how the order was raised. */
export type AdminOrderKind = 'SCAN_SELF_PAY' | 'RETAIL_SHIP' | 'UPGRADE' | 'RENEWAL';

/** OpenAPI `AdminOrderDetail.paymentOutcome` — the settled result of the order's payment. */
export type AdminPaymentOutcome = 'PAID' | 'FAILED' | 'UNCONFIRMED' | 'PENDING' | 'REFUNDED';

/** Fulfillment projection carried by both the order summary and detail (null when nothing ships). */
export type AdminOrderFulfillment = {
  status: string;
  courier: string | null;
  awbNo: string | null;
  trackingUrl: string | null;
  deliveredAt: string | null;
};

/** OpenAPI `AdminOrderSummary` — one row in the admin orders list. */
export type AdminOrderSummary = {
  orderId: string;
  orderNumber: string;
  accountId: string | null;
  orderKind: AdminOrderKind;
  status: AdminOrderStatus;
  planName: string;
  planVersion: number;
  riderCount: number;
  totalPaise: number;
  createdAt: string;
  fulfillment: AdminOrderFulfillment | null;
};

/** OpenAPI `AdminOrderDetail` — a single order with its money breakdown and partner attribution. */
export type AdminOrderDetail = {
  orderId: string;
  orderNumber: string;
  accountId: string | null;
  orderKind: AdminOrderKind;
  qrCodeId: string | null;
  planId: string;
  planName: string;
  planVersion: number;
  riderCount: number;
  subtotalPaise: number;
  gstPaise: number;
  discountPaise: number;
  totalPaise: number;
  promoCodeId: string | null;
  status: AdminOrderStatus;
  paymentOutcome: AdminPaymentOutcome | null;
  partnerOrgId: string | null;
  partnerStaffId: string | null;
  partnerLocationId: string | null;
  attachEventId: string | null;
  createdAt: string;
  fulfillment: AdminOrderFulfillment | null;
};

/** Query for `GET /admin/v1/orders` — every field optional. */
export type ListAdminOrdersQuery = {
  status?: AdminOrderStatus;
  kind?: AdminOrderKind;
  accountId?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
};

/** Paginated orders response with envelope pagination meta. */
export type AdminOrdersPageResult = {
  items: AdminOrderSummary[];
  pagination: PaginationDto | null;
  requestId: string | null;
  correlationId: string | null;
};

/** OpenAPI `AdminSubscriptionSummary.status` / `AdminSubscriptionDetail.status` — the subscription lifecycle. */
export type AdminSubscriptionStatus = 'ACTIVE' | 'LAPSED' | 'CANCELLED' | 'REFUNDED';

/** OpenAPI `AdminSubscriptionSummary.activatedVia` — how the live subscription was activated. */
export type AdminSubscriptionActivatedVia =
  | 'PARTNER_PREPAID_B2B2C'
  | 'PARTNER_PREPAID_B2B'
  | 'CONSUMER_PREPAID_COMMERCE'
  | 'CONSUMER_PREPAID_RETAIL';

/** OpenAPI `AdminSubscriptionSummary` — one row in the admin subscriptions list (money-free, no PII). */
export type AdminSubscriptionSummary = {
  subscriptionId: string;
  accountId: string;
  qrCodeId: string;
  vehicleId: string;
  planId: string;
  planTier: ApiPlanTier;
  planVersion: number;
  status: AdminSubscriptionStatus;
  activatedVia: AdminSubscriptionActivatedVia;
  autoRenew: boolean;
  startedAt: string | null;
  renewsAt: string | null;
};

/** OpenAPI `AdminSubscriptionDetail` — a single subscription with its billing-mandate link (money-free, no PII). */
export type AdminSubscriptionDetail = AdminSubscriptionSummary & {
  billingMandateId: string | null;
};

/** Query for `GET /admin/v1/subscriptions` — offset-paginated; every field optional. */
export type ListAdminSubscriptionsQuery = {
  status?: AdminSubscriptionStatus;
  planId?: string;
  accountId?: string;
  limit?: number;
  offset?: number;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** GET /admin/v1/inventory */
export async function listQrInventory(
  client: ApiClient,
  query: ListQrInventoryQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<BatchSummaryDto[]> {
  const path = `${endpoints.admin.inventory}${buildQuery({ state: query.state })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as BatchSummaryDto[];
}

/** GET /admin/v1/qr-batches/{id}/codes — data only. */
export async function listQrBatchCodes(
  client: ApiClient,
  batchId: string,
  query: ListQrBatchCodesQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<BatchCodeDto[]> {
  const page = await listQrBatchCodesPage(client, batchId, query, options);
  return page.codes;
}

/** GET /admin/v1/qr-batches/{id}/codes — includes pagination meta. */
export async function listQrBatchCodesPage(
  client: ApiClient,
  batchId: string,
  query: ListQrBatchCodesQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<QrBatchCodesPageResult> {
  const path = `${endpoints.admin.qrBatchCodes(batchId)}${buildQuery({
    status: query.status,
    cursor: query.cursor,
    limit: query.limit,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  return {
    codes: unwrapEnvelope(response) as BatchCodeDto[],
    pagination:
      pagination &&
      typeof pagination === 'object' &&
      'hasMore' in pagination &&
      'limit' in pagination
        ? (pagination as PaginationDto)
        : null,
    requestId: meta?.requestId ?? null,
    correlationId: meta?.correlationId ?? null,
  };
}

/** GET /admin/v1/qr-batches/{id}/codes/export — print-house CSV download. */
export async function exportQrBatchCodesCsv(
  client: ApiClient,
  batchId: string,
  options: { signal?: AbortSignal } = {},
): Promise<{ blob: Blob; filename: string }> {
  const { blob, filename } = await client.getBlob(endpoints.admin.exportQrBatchCodes(batchId), {
    accept: 'text/csv',
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return {
    blob,
    filename: filename ?? `qr-batch-${batchId}-print.csv`,
  };
}

/** GET /admin/v1/promos */
export async function listAdminPromos(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<AdminPromoDto[]> {
  const response = await client.get<unknown>(endpoints.admin.promos, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminPromoDto[];
}

/** POST /admin/v1/promos */
export async function createAdminPromo(
  client: ApiClient,
  body: CreatePromoBody,
  options: { signal?: AbortSignal } = {},
): Promise<AdminPromoDto> {
  const response = await client.post<unknown>(endpoints.admin.promos, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminPromoDto;
}

/** GET /admin/v1/skus */
export async function listSkus(
  client: ApiClient,
  query: ListSkusQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<SkuSummaryDto[]> {
  const path = `${endpoints.admin.skus}${buildQuery({
    channel: query.channel,
    includeInactive: query.includeInactive ? 'true' : undefined,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as SkuSummaryDto[];
}

/** POST /admin/v1/skus */
export async function createSku(
  client: ApiClient,
  body: CreateSkuBody,
  options: { signal?: AbortSignal } = {},
): Promise<SkuSummaryDto> {
  const response = await client.post<unknown>(endpoints.admin.skus, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as SkuSummaryDto;
}

/** PATCH /admin/v1/skus/{skuId} */
export async function updateSku(
  client: ApiClient,
  skuId: string,
  body: UpdateSkuBody,
  options: { signal?: AbortSignal } = {},
): Promise<SkuSummaryDto> {
  const response = await client.patch<unknown>(endpoints.admin.sku(skuId), body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as SkuSummaryDto;
}

/** GET /admin/v1/plans — every version, including superseded/retired ones. */
export async function listAdminPlans(
  client: ApiClient,
  query: ListAdminPlansQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminPlanDto[]> {
  const path = `${endpoints.admin.plans}${buildQuery({ tier: query.tier })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminPlanDto[];
}

/** POST /admin/v1/plans — mint a new (tier, version). */
export async function createPlanVersion(
  client: ApiClient,
  body: CreatePlanBody,
  options: { signal?: AbortSignal } = {},
): Promise<AdminPlanDto> {
  const response = await client.post<unknown>(endpoints.admin.plans, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminPlanDto;
}

/** PATCH /admin/v1/plans/{planId} — lifecycle only (publish / retire). */
export async function updatePlan(
  client: ApiClient,
  planId: string,
  body: UpdatePlanBody,
  options: { signal?: AbortSignal } = {},
): Promise<AdminPlanDto> {
  const response = await client.patch<unknown>(endpoints.admin.plan(planId), body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminPlanDto;
}

/** GET /admin/v1/plans/{planId}/features */
export async function getPlanFeatures(
  client: ApiClient,
  planId: string,
  options: { signal?: AbortSignal } = {},
): Promise<PlanFeaturesDto> {
  const response = await client.get<unknown>(endpoints.admin.planFeatures(planId), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as PlanFeaturesDto;
}

/** PATCH /admin/v1/plans/{planId}/features */
export async function updatePlanFeatures(
  client: ApiClient,
  planId: string,
  body: UpdatePlanFeaturesBody,
  options: { signal?: AbortSignal } = {},
): Promise<PlanFeaturesDto> {
  const response = await client.patch<unknown>(endpoints.admin.planFeatures(planId), body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as PlanFeaturesDto;
}

/** POST /admin/v1/qr-batches */
export async function createQrBatch(
  client: ApiClient,
  body: CreateBatchBody,
  options: { signal?: AbortSignal } = {},
): Promise<BatchSummaryDto> {
  const response = await client.post<unknown>(endpoints.admin.qrBatches, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as BatchSummaryDto;
}

/** POST /admin/v1/qr-batches/{id}/generate */
export async function generateQrBatchCodes(
  client: ApiClient,
  batchId: string,
  options: { signal?: AbortSignal } = {},
): Promise<BatchSummaryDto> {
  const response = await client.post<unknown>(endpoints.admin.generateQrBatch(batchId), undefined, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as BatchSummaryDto;
}

/** POST /admin/v1/qr-batches/{id}/provision */
export async function provisionQrBatch(
  client: ApiClient,
  batchId: string,
  options: { signal?: AbortSignal } = {},
): Promise<BatchSummaryDto> {
  const response = await client.post<unknown>(
    endpoints.admin.provisionQrBatch(batchId),
    undefined,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as BatchSummaryDto;
}

/** POST /admin/v1/qr-auto-detach-sweep */
export async function qrAutoDetachSweep(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<QrAutoDetachResultDto> {
  const response = await client.post<unknown>(endpoints.admin.qrAutoDetachSweep, undefined, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as QrAutoDetachResultDto;
}

/** POST /admin/v1/qr/{code}/replace */
export async function replaceQrCode(
  client: ApiClient,
  code: string,
  options: { signal?: AbortSignal } = {},
): Promise<ReplacedDto> {
  const response = await client.post<unknown>(endpoints.admin.replaceQr(code), undefined, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ReplacedDto;
}

/** POST /admin/v1/qr/{code}/retire */
export async function retireQrCode(
  client: ApiClient,
  code: string,
  options: { signal?: AbortSignal } = {},
): Promise<RetiredDto> {
  const response = await client.post<unknown>(endpoints.admin.retireQr(code), undefined, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as RetiredDto;
}

/** POST /admin/v1/clawbacks */
export async function createClawback(
  client: ApiClient,
  body: ClawbackBody,
  options: { signal?: AbortSignal } = {},
): Promise<ClawbackResultDto> {
  const response = await client.post<unknown>(endpoints.admin.clawbacks, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ClawbackResultDto;
}

/** POST /admin/v1/ownership-transfers */
export async function initiateOwnershipTransfer(
  client: ApiClient,
  body: InitiateTransferBody,
  options: { signal?: AbortSignal } = {},
): Promise<TransferInitiatedDto> {
  const response = await client.post<unknown>(endpoints.admin.ownershipTransfers, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as TransferInitiatedDto;
}

/** POST /admin/v1/ownership-transfers/{id}/approve */
export async function approveOwnershipTransfer(
  client: ApiClient,
  transferId: string,
  body: ApproveTransferBody,
  options: { signal?: AbortSignal } = {},
): Promise<TransferCompletedDto> {
  const response = await client.post<unknown>(
    endpoints.admin.approveOwnershipTransfer(transferId),
    body,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as TransferCompletedDto;
}

/** POST /admin/v1/partner-reorders/{id}/fulfil */
export async function fulfilPartnerReorder(
  client: ApiClient,
  reorderId: string,
  options: { signal?: AbortSignal } = {},
): Promise<ReorderFulfilResultDto> {
  const response = await client.post<unknown>(
    endpoints.admin.fulfilPartnerReorder(reorderId),
    undefined,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as ReorderFulfilResultDto;
}

/** POST /admin/v1/settlement-batch */
export async function runSettlementBatch(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<SettlementBatchResultDto> {
  const response = await client.post<unknown>(endpoints.admin.settlementBatch, undefined, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as SettlementBatchResultDto;
}

/** GET /admin/v1/audit-events */
export async function queryAuditEvents(
  client: ApiClient,
  params: QueryAuditEventsParams = {},
  options: { signal?: AbortSignal } = {},
): Promise<AuditEventDto[]> {
  const page = await queryAuditEventsPage(client, params, options);
  return page.events;
}

/** GET /admin/v1/audit-events — includes pagination meta from envelope. */
export async function queryAuditEventsPage(
  client: ApiClient,
  params: QueryAuditEventsParams = {},
  options: { signal?: AbortSignal } = {},
): Promise<AuditEventsPageResult> {
  const path = `${endpoints.admin.auditEvents}${buildQuery({
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    from: params.from,
    to: params.to,
    cursor: params.cursor,
    limit: params.limit,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  return {
    events: unwrapEnvelope(response) as AuditEventDto[],
    pagination:
      pagination &&
      typeof pagination === 'object' &&
      'hasMore' in pagination &&
      'limit' in pagination
        ? (pagination as PaginationDto)
        : null,
    requestId: meta?.requestId ?? null,
    correlationId: meta?.correlationId ?? null,
  };
}

/** GET /admin/v1/orders — includes pagination meta from the envelope. */
export async function listAdminOrdersPage(
  client: ApiClient,
  query: ListAdminOrdersQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminOrdersPageResult> {
  const path = `${endpoints.admin.adminOrders}${buildQuery({
    status: query.status,
    kind: query.kind,
    accountId: query.accountId,
    from: query.from,
    to: query.to,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  return {
    items: unwrapEnvelope(response) as AdminOrderSummary[],
    pagination:
      pagination &&
      typeof pagination === 'object' &&
      'hasMore' in pagination &&
      'limit' in pagination
        ? (pagination as PaginationDto)
        : null,
    requestId: meta?.requestId ?? null,
    correlationId: meta?.correlationId ?? null,
  };
}

/** GET /admin/v1/orders/{orderId} */
export async function getAdminOrder(
  client: ApiClient,
  orderId: string,
  options: { signal?: AbortSignal } = {},
): Promise<AdminOrderDetail> {
  const response = await client.get<unknown>(endpoints.admin.adminOrder(orderId), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminOrderDetail;
}

/**
 * OpenAPI `RefundOrderResult` — the result of `POST /admin/v1/orders/{orderId}/refund`.
 * The refund is ASYNC: the response settles at `REFUND_PENDING`; the terminal `REFUNDED` state lands
 * later via the payment provider's webhook.
 */
export type RefundOrderResult = {
  paymentRef: string;
  state: 'REFUND_PENDING';
  amountPaise: number;
  refundRef: string;
};

/**
 * POST /admin/v1/orders/{orderId}/refund — initiate a FULL refund of a PAID order (FINANCE·step_up).
 * Only a PAID order with a captured payment is refundable; the server returns 409 `order_not_refundable`
 * (or 404) otherwise.
 */
export async function refundAdminOrder(
  client: ApiClient,
  orderId: string,
  body: { reason: string },
  options: { signal?: AbortSignal } = {},
): Promise<RefundOrderResult> {
  const response = await client.post<unknown>(endpoints.admin.refundAdminOrder(orderId), body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as RefundOrderResult;
}

/**
 * GET /admin/v1/subscriptions — the account-wide subscription list.
 * Offset-paginated on the server, so `data` is a bare array (no pagination meta on the envelope).
 */
export async function listAdminSubscriptions(
  client: ApiClient,
  query: ListAdminSubscriptionsQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminSubscriptionSummary[]> {
  const path = `${endpoints.admin.adminSubscriptions}${buildQuery({
    status: query.status,
    planId: query.planId,
    accountId: query.accountId,
    limit: query.limit,
    offset: query.offset,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminSubscriptionSummary[];
}

/** GET /admin/v1/subscriptions/{subscriptionId} */
export async function getAdminSubscription(
  client: ApiClient,
  subscriptionId: string,
  options: { signal?: AbortSignal } = {},
): Promise<AdminSubscriptionDetail> {
  const response = await client.get<unknown>(endpoints.admin.adminSubscription(subscriptionId), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminSubscriptionDetail;
}

/** OpenAPI `AdminShipmentSummary.status` / `AdminShipmentDetail.status` — the logistics (fulfilment) FSM. */
export type AdminShipmentStatus =
  | 'PAID'
  | 'ALLOCATED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'LOST';

/** OpenAPI `AdminShipmentSummary` — one row in the admin shipments list (no PII; pincode masked). */
export type AdminShipmentSummary = {
  orderId: string;
  orderNumber: string;
  accountId: string | null;
  status: AdminShipmentStatus;
  courier: string | null;
  awbNo: string | null;
  trackingUrl: string | null;
  maskedPincode: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

/** OpenAPI `AdminShipmentEventDto` — one checkpoint on the tracking timeline. */
export type AdminShipmentEvent = {
  status: AdminShipmentStatus;
  rawStatus: string | null;
  location: string | null;
  activity: string | null;
  occurredAt: string;
};

/** OpenAPI `AdminShipmentDetail` — a single shipment with its per-state timestamps and tracking timeline (no PII). */
export type AdminShipmentDetail = {
  orderId: string;
  orderNumber: string;
  accountId: string | null;
  status: AdminShipmentStatus;
  courier: string | null;
  awbNo: string | null;
  trackingUrl: string | null;
  maskedPincode: string;
  allocatedAt: string | null;
  shippedAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  cancelledAt: string | null;
  lostAt: string | null;
  events: AdminShipmentEvent[];
};

/** Query for `GET /admin/v1/shipments` — keyset-paginated; every field optional. */
export type ListAdminShipmentsQuery = {
  status?: AdminShipmentStatus;
  courier?: string;
  limit?: number;
  cursor?: string;
};

/** Paginated shipments response with envelope pagination meta. */
export type AdminShipmentsPageResult = {
  items: AdminShipmentSummary[];
  pagination: PaginationDto | null;
  requestId: string | null;
  correlationId: string | null;
};

/** GET /admin/v1/shipments — includes pagination meta from the envelope. */
export async function listAdminShipmentsPage(
  client: ApiClient,
  query: ListAdminShipmentsQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminShipmentsPageResult> {
  const path = `${endpoints.admin.adminShipments}${buildQuery({
    status: query.status,
    courier: query.courier,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  return {
    items: unwrapEnvelope(response) as AdminShipmentSummary[],
    pagination:
      pagination &&
      typeof pagination === 'object' &&
      'hasMore' in pagination &&
      'limit' in pagination
        ? (pagination as PaginationDto)
        : null,
    requestId: meta?.requestId ?? null,
    correlationId: meta?.correlationId ?? null,
  };
}

/** GET /admin/v1/shipments/{orderId} */
export async function getAdminShipment(
  client: ApiClient,
  orderId: string,
  options: { signal?: AbortSignal } = {},
): Promise<AdminShipmentDetail> {
  const response = await client.get<unknown>(endpoints.admin.adminShipment(orderId), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminShipmentDetail;
}

/** OpenAPI `AdminPaymentSummary.mode` / `AdminPaymentDetail.mode` — the payment channel. */
export type AdminPaymentMode = 'ONLINE' | 'CASH';

/** OpenAPI `AdminPaymentSummary.state` / `AdminPaymentDetail.state` — the fine-grained payment FSM state. */
export type AdminPaymentState =
  | 'CREATED'
  | 'REQUIRES_ACTION'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'PARTIALLY_CAPTURED'
  | 'FAILED'
  | 'EXPIRED'
  | 'VOIDED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'REFUND_FAILED'
  | 'CHARGEBACK'
  | 'CB_WON'
  | 'CB_LOST';

/** OpenAPI `AdminPaymentSummary` — one row in the admin payments list (money-inclusive, no PII). */
export type AdminPaymentSummary = {
  paymentId: string;
  orderId: string | null;
  orderNumber: string | null;
  ref: string;
  providerRef: string | null;
  mode: AdminPaymentMode;
  state: AdminPaymentState;
  outcome: AdminPaymentOutcome;
  amountPaise: number;
  createdAt: string;
};

/** OpenAPI `AdminPaymentDetail` — a single payment with its captured amount and FSM sequence (no PII). */
export type AdminPaymentDetail = AdminPaymentSummary & {
  capturedPaise: number | null;
  stateSeq: number;
};

/** Query for `GET /admin/v1/payments` — keyset-paginated; every field optional. */
export type ListAdminPaymentsQuery = {
  outcome?: AdminPaymentOutcome;
  mode?: AdminPaymentMode;
  state?: AdminPaymentState;
  orderId?: string;
  limit?: number;
  cursor?: string;
};

/** Paginated payments response with envelope pagination meta. */
export type AdminPaymentsPageResult = {
  items: AdminPaymentSummary[];
  pagination: PaginationDto | null;
  requestId: string | null;
  correlationId: string | null;
};

/** GET /admin/v1/payments — includes pagination meta from the envelope. */
export async function listAdminPaymentsPage(
  client: ApiClient,
  query: ListAdminPaymentsQuery = {},
  options: { signal?: AbortSignal } = {},
): Promise<AdminPaymentsPageResult> {
  const path = `${endpoints.admin.adminPayments}${buildQuery({
    outcome: query.outcome,
    mode: query.mode,
    state: query.state,
    orderId: query.orderId,
    limit: query.limit,
    cursor: query.cursor,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const meta = readEnvelopeMeta(response);
  const pagination = meta?.pagination;
  return {
    items: unwrapEnvelope(response) as AdminPaymentSummary[],
    pagination:
      pagination &&
      typeof pagination === 'object' &&
      'hasMore' in pagination &&
      'limit' in pagination
        ? (pagination as PaginationDto)
        : null,
    requestId: meta?.requestId ?? null,
    correlationId: meta?.correlationId ?? null,
  };
}

/** GET /admin/v1/payments/{paymentId} */
export async function getAdminPayment(
  client: ApiClient,
  paymentId: string,
  options: { signal?: AbortSignal } = {},
): Promise<AdminPaymentDetail> {
  const response = await client.get<unknown>(endpoints.admin.adminPayment(paymentId), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminPaymentDetail;
}

/** The platform roles the admin role console may grant or revoke (06-api-contracts.md § Admin plane). */
export type GrantableUserRole = 'ADMIN' | 'CONSUMER';

/** OpenAPI `AdminUserRoleDto` — one ACTIVE grant on an account. */
export type AdminUserRoleDto = {
  role: string;
  scopeRef: string | null;
  grantedAt: string;
};

/** OpenAPI `AdminUserDto` — an account and its ACTIVE roles. Never carries PII. */
export type AdminUserDto = {
  id: string;
  roles: AdminUserRoleDto[];
};

/**
 * GET /admin/v1/users?phone= — resolve ONE account by its OTP-verified phone.
 * The server matches on a keyed-HMAC blind index, so the number never round-trips as PII.
 * Throws `not_found` when no account carries that number.
 */
export async function findAdminUserByPhone(
  client: ApiClient,
  phone: string,
  options: { signal?: AbortSignal } = {},
): Promise<AdminUserDto> {
  const path = `${endpoints.admin.users}${buildQuery({ phone })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminUserDto;
}

/** POST /admin/v1/users/{userId}/roles — grant a platform role (idempotent). */
export async function grantUserRole(
  client: ApiClient,
  userId: string,
  role: GrantableUserRole,
  options: { signal?: AbortSignal } = {},
): Promise<AdminUserDto> {
  const response = await client.post<unknown>(
    endpoints.admin.userRoles(userId),
    { role },
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
  return unwrapEnvelope(response) as AdminUserDto;
}

/** DELETE /admin/v1/users/{userId}/roles/{role} — revoke a platform role (idempotent; `last_admin` 409 guards). */
export async function revokeUserRole(
  client: ApiClient,
  userId: string,
  role: GrantableUserRole,
  options: { signal?: AbortSignal } = {},
): Promise<AdminUserDto> {
  const response = await client.delete<unknown>(endpoints.admin.userRole(userId, role), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminUserDto;
}
