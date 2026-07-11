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

/** OpenAPI `SkuSummaryDto` — active catalog row for the create-batch picker. */
export type SkuSummaryDto = {
  id: string;
  skuCode: string;
  channel: QrBatchChannel;
  prepaid: boolean;
  listPricePaise: number;
};

/** Query for `GET /admin/v1/skus`. */
export type ListSkusQuery = {
  channel?: QrBatchChannel;
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
  const path = `${endpoints.admin.skus}${buildQuery({ channel: query.channel })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as SkuSummaryDto[];
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
  const response = await client.post<unknown>(
    endpoints.admin.generateQrBatch(batchId),
    undefined,
    { ...(options.signal ? { signal: options.signal } : {}) },
  );
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
