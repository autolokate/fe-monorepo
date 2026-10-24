import type { Page, Route } from '@playwright/test';

/** Synthetic fixture identities only — never real accounts / QR / transfer rows. */
export const HERMETIC_QR_CODE = 'ALK-HERM-OT';
/** Synthetic replacement code returned by Nest OA replace stub. */
export const HERMETIC_QR_CODE_REPLACEMENT = 'ALK-HERM-NW';
export const HERMETIC_QR_CODE_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeabcd';
export const HERMETIC_SUBSCRIPTION_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeabce';
export const HERMETIC_TRANSFER_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
export const HERMETIC_VEHICLE_ID = '11111111-2222-4333-8444-555555555555';
export const HERMETIC_TO_ACCOUNT_ID = '66666666-7777-4888-8999-aaaaaaaaaaaa';
export const HERMETIC_USER_ID = 'hermetic-admin-user';
export const HERMETIC_GARAGE_ORG_ID = 'hermetic-garage-org';
export const HERMETIC_GARAGE_PURCHASE_ID = '99999999-aaaa-4bbb-8ccc-dddddddddddd';
export const HERMETIC_GARAGE_IDEMPOTENCY_KEY = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
/** Synthetic account receiving GARAGE_PARTNER enrollment via provision. */
export const HERMETIC_GARAGE_ACCOUNT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee2222';
export const HERMETIC_GARAGE_STAFF_ID = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
export const HERMETIC_GARAGE_STORE_ID = 'cccccccc-dddd-4eee-8fff-000000000010';
export const HERMETIC_GARAGE_KYC_ID = 'dddddddd-eeee-4fff-8000-111111111112';
/** Nest OA GarageCommercialConfigAuditDto.id for seeded history. */
export const HERMETIC_GARAGE_AUDIT_ID = 'eeeeeeee-ffff-4000-8000-222222222222';

export const HERMETIC_TOKENS = {
  accessToken: 'hermetic-admin-access',
  refreshToken: 'hermetic-admin-refresh',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  userId: HERMETIC_USER_ID,
};

const ADMIN_TOKEN_KEY = 'al-admin-auth-tokens-v1';

export type HermeticSessionRole =
  | 'ADMIN'
  | 'OPERATOR'
  | 'READ_ONLY'
  | 'SUPPORT'
  | 'OPS'
  | 'CONSUMER';

export type HermeticCapture = {
  initiate: Array<{ method: string; path: string; body: unknown }>;
  approve: Array<{ method: string; path: string; body: unknown }>;
  garageConfigGet: number;
  garageConfigHistoryGet: Array<{ method: string; path: string; limit: string | null }>;
  garageConfigPut: Array<{ method: string; path: string; body: unknown }>;
  garagePassGrant: Array<{ method: string; path: string; body: unknown }>;
  garageFreeBidsAdjust: Array<{ method: string; path: string; body: unknown }>;
  garageProvision: Array<{ method: string; path: string; body: unknown }>;
  taxiPolicyGet: number;
  taxiPolicyPut: Array<{ method: string; path: string; body: unknown }>;
  taxiPolicyPublish: number;
  breakGlassRequest: Array<{ method: string; path: string; body: unknown }>;
  breakGlassApprove: string[];
  ownershipClaimsGet: number;
  /** Captured `status` query values (`null` when ALL / omitted). */
  ownershipClaimsGetStatusParams: Array<string | null>;
  ownershipClaimsReview: Array<{ method: string; path: string; body: unknown }>;
  incidentsGet: number;
  incidentsDetailGet: number;
  ordersGet: number;
  ordersRefund: Array<{ method: string; path: string; body: unknown }>;
  clawbacksPost: Array<{ method: string; path: string; body: unknown }>;
  settlementBatchPost: number;
  supportTicketsGet: number;
  supportTicketsPatch: Array<{ method: string; path: string; body: unknown }>;
  shipmentsGet: number;
  shipmentsStatusPost: Array<{ method: string; path: string; body: unknown }>;
  promosGet: number;
  promosCreate: Array<{ method: string; path: string; body: unknown }>;
  plansGet: number;
  skusGet: number;
  skusCreate: Array<{ method: string; path: string; body: unknown }>;
  inventoryGet: number;
  qrBatchesCreate: Array<{ method: string; path: string; body: unknown }>;
  qrBatchesGenerate: Array<{ method: string; path: string }>;
  qrBatchesProvision: Array<{ method: string; path: string }>;
  partnerReorderFulfil: Array<{ method: string; path: string; body: unknown }>;
  qrReplace: Array<{ method: string; path: string; body: unknown }>;
  qrRetire: Array<{ method: string; path: string; body: unknown }>;
  qrAutoDetachSweep: Array<{ method: string; path: string; body: unknown }>;
  auditEventsGet: number;
  /** Captured query strings for each audit-events GET (empty string when none). */
  auditEventsGetQueries: string[];
  usersLookupGet: Array<{ phone: string | null }>;
  usersGrantPost: Array<{ method: string; path: string; body: unknown }>;
  usersRevokeDelete: Array<{ method: string; path: string }>;
  subscriptionsGet: number;
  paymentsGet: number;
  qrBatchCodesGet: number;
  qrBatchCodesExportGet: number;
  unexpected: string[];
};

export type HermeticTaxiPolicy = {
  id: string;
  status: 'DRAFT' | 'PUBLISHED';
  customerAdvanceBps: number;
  partnerDepositBps: number;
};

export const HERMETIC_TAXI_POLICY: HermeticTaxiPolicy = {
  id: 'dddddddd-eeee-4fff-8000-111111111111',
  status: 'DRAFT',
  customerAdvanceBps: 500,
  partnerDepositBps: 1000,
};

export const HERMETIC_BREAK_GLASS_APPROVAL_ID = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
export const HERMETIC_OWNERSHIP_CLAIM_ID = 'cccccccc-dddd-4eee-8fff-000000000002';
export const HERMETIC_OWNERSHIP_CLAIM_ID_APPROVED = 'cccccccc-dddd-4eee-8fff-000000000003';
export const HERMETIC_INCIDENT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee1111';
export const HERMETIC_ORDER_ID = 'eeeeeeee-ffff-4aaa-8bbb-cccccccccccc';
export const HERMETIC_ORDER_NUMBER = 'ALK-HERM-ORD-1';
export const HERMETIC_ORDER_DRAFT_ID = 'ffffffff-aaaa-4bbb-8ccc-dddddddddddd';
export const HERMETIC_ORDER_DRAFT_NUMBER = 'ALK-HERM-ORD-2';
export const HERMETIC_PAYMENT_REF = 'pay_hermetic_refund_1';
export const HERMETIC_REFUND_REF = 'rfnd_hermetic_1';
export const HERMETIC_CLAWBACK_PAYMENT_REF = 'pay_hermetic_cb_1';
export const HERMETIC_SETTLEMENT_PAYOUT_ID = 'payout_hermetic_1';
export const HERMETIC_SUPPORT_TICKET_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee3333';
export const HERMETIC_SUPPORT_TICKET_SUBJECT = 'Hermetic lost QR help';
export const HERMETIC_SHIPMENT_ORDER_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee4444';
export const HERMETIC_SHIPMENT_ORDER_NUMBER = 'ALK-HERM-SHIP-1';
export const HERMETIC_SHIPMENT_QR = 'ALK-HERM-SHIP';
export const HERMETIC_PROMO_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee5555';
export const HERMETIC_PROMO_CODE = 'HERM10';
export const HERMETIC_PLAN_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee6666';
export const HERMETIC_SKU_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7777';
export const HERMETIC_SKU_CODE = 'SKU-B2C-HERM';
/** Synthetic Nest-OA QR batch (create → generate → provision). */
export const HERMETIC_QR_BATCH_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeaaaa';
export const HERMETIC_QR_BATCH_CODE = 'B2C-HERM-5-20261020';
/** Synthetic Nest OA partner reorder (QrDistribution) id for fulfil. */
export const HERMETIC_REORDER_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeebbbb';
export const HERMETIC_REORDER_LOCATION_ID = 'cccccccc-dddd-4eee-8fff-000000000020';
export const HERMETIC_REORDER_ALLOCATED = 100;
export const HERMETIC_AUDIT_EVENT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee8888';
export const HERMETIC_AUDIT_EVENT_ID_2 = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee8889';
export const HERMETIC_AUDIT_BATCH_ID = 'hermetic-batch-1';
export const HERMETIC_CUSTOMER_ACCOUNT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee9999';
export const HERMETIC_CUSTOMER_PHONE = '+919876543210';
export const HERMETIC_UNKNOWN_PHONE = '+919000000123';

export const HERMETIC_AUDIT_EVENT = {
  id: HERMETIC_AUDIT_EVENT_ID,
  action: 'BATCH_PROVISIONED' as const,
  actorAccountId: null,
  actorAdminId: HERMETIC_USER_ID,
  targetType: 'batch',
  targetId: HERMETIC_AUDIT_BATCH_ID,
  metadata: { channel: 'B2C', totalCount: 100 },
  at: '2026-10-19T12:00:00.000Z',
};

export const HERMETIC_AUDIT_EVENT_REFUND = {
  id: HERMETIC_AUDIT_EVENT_ID_2,
  action: 'REFUND_OR_CLAWBACK' as const,
  actorAccountId: null,
  actorAdminId: HERMETIC_USER_ID,
  targetType: 'order',
  targetId: HERMETIC_ORDER_ID,
  metadata: { reason: 'hermetic-refund' },
  at: '2026-10-18T12:00:00.000Z',
};

export const HERMETIC_PLAN = {
  id: HERMETIC_PLAN_ID,
  tier: 'SHIELD' as const,
  version: 1,
  name: 'Hermetic Shield',
  pricePaise: 199_900,
  riderEligible: true,
  period: 'YEARLY' as const,
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  effectiveTo: null,
  isEffectiveNow: true,
};

export const HERMETIC_OWNERSHIP_CLAIM = {
  id: HERMETIC_OWNERSHIP_CLAIM_ID,
  status: 'SUBMITTED' as const,
  vehicleId: HERMETIC_VEHICLE_ID,
  claimantAccountId: HERMETIC_USER_ID,
  createdAt: '2026-10-19T00:00:00.000Z',
};

export const HERMETIC_OWNERSHIP_CLAIM_APPROVED = {
  id: HERMETIC_OWNERSHIP_CLAIM_ID_APPROVED,
  status: 'APPROVED' as const,
  vehicleId: HERMETIC_VEHICLE_ID,
  claimantAccountId: HERMETIC_USER_ID,
  createdAt: '2026-10-18T00:00:00.000Z',
};

export const HERMETIC_GARAGE_CONFIG = {
  id: 'cccccccc-dddd-4eee-8fff-000000000001',
  welcomeCredits: 20,
  creditsPerFirstBid: 10,
  freeBidLifetimeCount: 2,
  dayPassPriceRupees: 100,
  monthPassPriceRupees: 1800,
  dayPassDurationHours: 24,
  monthPassDurationKind: 'CALENDAR_MONTH_IST' as const,
  gstRateBps: 1800,
  updatedByAdminId: null,
  updatedAt: '2026-10-18T00:00:00.000Z',
};

const HERMETIC_GARAGE_CONFIG_BODY = {
  welcomeCredits: HERMETIC_GARAGE_CONFIG.welcomeCredits,
  creditsPerFirstBid: HERMETIC_GARAGE_CONFIG.creditsPerFirstBid,
  freeBidLifetimeCount: HERMETIC_GARAGE_CONFIG.freeBidLifetimeCount,
  dayPassPriceRupees: HERMETIC_GARAGE_CONFIG.dayPassPriceRupees,
  monthPassPriceRupees: HERMETIC_GARAGE_CONFIG.monthPassPriceRupees,
  dayPassDurationHours: HERMETIC_GARAGE_CONFIG.dayPassDurationHours,
  monthPassDurationKind: HERMETIC_GARAGE_CONFIG.monthPassDurationKind,
  gstRateBps: HERMETIC_GARAGE_CONFIG.gstRateBps,
};

/** Seeded Nest OA GarageCommercialConfigAuditDto (newest-first list). */
export const HERMETIC_GARAGE_CONFIG_AUDIT = {
  id: HERMETIC_GARAGE_AUDIT_ID,
  configId: HERMETIC_GARAGE_CONFIG.id,
  adminAccountId: HERMETIC_USER_ID,
  requestId: null,
  before: {
    ...HERMETIC_GARAGE_CONFIG_BODY,
    dayPassPriceRupees: 90,
  },
  after: { ...HERMETIC_GARAGE_CONFIG_BODY },
  createdAt: '2026-10-18T12:00:00.000Z',
};

function envelope<T>(data: T) {
  return {
    data,
    meta: { requestId: 'hermetic-req', correlationId: 'hermetic-corr' },
  };
}

function errorEnvelope(statusMessage: string, code = 'forbidden') {
  return {
    error: {
      code,
      message: statusMessage,
      requestId: 'hermetic-req',
      correlationId: 'hermetic-corr',
    },
  };
}

async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export type InstallHermeticRoutesOptions = {
  sessionRole?: HermeticSessionRole;
  /** When set, initiate POST returns this status instead of 201. */
  initiateStatus?: number;
  /** When set, approve POST returns this status instead of 200. */
  approveStatus?: number;
  /** When set, garage commercial-config GET returns this status instead of 200. */
  garageConfigGetStatus?: number;
  /** When set, garage commercial-config/history GET returns this status instead of 200. */
  garageConfigHistoryGetStatus?: number;
  /** When set, garage commercial-config PUT returns this status instead of 200. */
  garageConfigPutStatus?: number;
  /** When set, garage pass grant POST returns this status instead of 200. */
  garagePassGrantStatus?: number;
  /** When set, garage free-bids adjust POST returns this status instead of 200. */
  garageFreeBidsAdjustStatus?: number;
  /** When set, garage provision POST returns this status instead of 201. */
  garageProvisionStatus?: number;
  /** When set, taxi policy GET returns this status instead of 200. */
  taxiPolicyGetStatus?: number;
  /** When set, taxi policy PUT returns this status instead of 200. */
  taxiPolicyPutStatus?: number;
  /** When set, taxi policy publish POST returns this status instead of 200. */
  taxiPolicyPublishStatus?: number;
  /** When set, break-glass request POST returns this status instead of 200. */
  breakGlassRequestStatus?: number;
  /** When set, ownership-claims GET returns this status instead of 200. */
  ownershipClaimsGetStatus?: number;
  /** When set, orders GET returns this status instead of 200. */
  ordersGetStatus?: number;
  /** When set, order refund POST returns this status instead of 200. */
  ordersRefundStatus?: number;
  /** When set, clawbacks POST returns this status instead of 200. */
  clawbacksPostStatus?: number;
  /** When set, settlement-batch POST returns this status instead of 200. */
  settlementBatchPostStatus?: number;
  /** When set, support tickets GET returns this status instead of 200. */
  supportTicketsGetStatus?: number;
  /** When set, support ticket PATCH returns this status instead of 200. */
  supportTicketsPatchStatus?: number;
  /** When set, shipments GET returns this status instead of 200. */
  shipmentsGetStatus?: number;
  /** When set, shipment status POST returns this status instead of 200. */
  shipmentsStatusPostStatus?: number;
  /** When set, promos GET returns this status instead of 200. */
  promosGetStatus?: number;
  /** When set, promos POST returns this status instead of 201. */
  promosCreateStatus?: number;
  /** When set, plans GET returns this status instead of 200. */
  plansGetStatus?: number;
  /** When set, skus GET returns this status instead of 200. */
  skusGetStatus?: number;
  /** When set, skus POST returns this status instead of 201. */
  skusCreateStatus?: number;
  /** When set, inventory GET returns this status instead of 200. */
  inventoryGetStatus?: number;
  /** When set, qr-batches POST returns this status instead of 201. */
  qrBatchesCreateStatus?: number;
  /** When set, qr-batches/{id}/generate POST returns this status instead of 200. */
  qrBatchesGenerateStatus?: number;
  /** When set, qr-batches/{id}/provision POST returns this status instead of 200. */
  qrBatchesProvisionStatus?: number;
  /** When set, partner-reorders/{id}/fulfil POST returns this status instead of 200. */
  partnerReorderFulfilStatus?: number;
  /** When set, qr/{code}/replace POST returns this status instead of 200. */
  qrReplaceStatus?: number;
  /** When set, qr/{code}/retire POST returns this status instead of 200. */
  qrRetireStatus?: number;
  /** When set, qr-auto-detach-sweep POST returns this status instead of 200. */
  qrAutoDetachSweepStatus?: number;
  /**
   * Seed a PROVISIONED inventory batch so batch-detail replace/retire can open
   * without running create → generate → provision first.
   */
  seedProvisionedQrBatch?: boolean;
  /** When set, audit-events GET returns this status instead of 200. */
  auditEventsGetStatus?: number;
  /** When set, users GET (phone lookup) returns this status instead of 200. */
  usersLookupGetStatus?: number;
  /** When set, users roles POST returns this status instead of 200. */
  usersGrantPostStatus?: number;
  /** When set, users roles DELETE returns this status instead of 200. */
  usersRevokeDeleteStatus?: number;
};

/**
 * Stub AdminAuthProvider bootstrap + ownership-transfer + garage admin endpoints.
 * Unhandled `/v1/*` and `/admin/v1/*` → 404 recorded as unexpected (network isolation).
 */
export async function installHermeticApiRoutes(
  page: Page,
  options: InstallHermeticRoutesOptions = {},
): Promise<HermeticCapture> {
  const sessionRole = options.sessionRole ?? 'ADMIN';
  const initiateStatus = options.initiateStatus ?? 201;
  const approveStatus = options.approveStatus ?? 200;
  const garageConfigGetStatus = options.garageConfigGetStatus ?? 200;
  const garageConfigHistoryGetStatus = options.garageConfigHistoryGetStatus ?? 200;
  const garageConfigPutStatus = options.garageConfigPutStatus ?? 200;
  const garagePassGrantStatus = options.garagePassGrantStatus ?? 200;
  const garageFreeBidsAdjustStatus = options.garageFreeBidsAdjustStatus ?? 200;
  const garageProvisionStatus = options.garageProvisionStatus ?? 201;
  const taxiPolicyGetStatus = options.taxiPolicyGetStatus ?? 200;
  const taxiPolicyPutStatus = options.taxiPolicyPutStatus ?? 200;
  const taxiPolicyPublishStatus = options.taxiPolicyPublishStatus ?? 200;
  const breakGlassRequestStatus = options.breakGlassRequestStatus ?? 200;
  const ownershipClaimsGetStatus = options.ownershipClaimsGetStatus ?? 200;
  const ordersGetStatus = options.ordersGetStatus ?? 200;
  const ordersRefundStatus = options.ordersRefundStatus ?? 200;
  const clawbacksPostStatus = options.clawbacksPostStatus ?? 200;
  const settlementBatchPostStatus = options.settlementBatchPostStatus ?? 200;
  const supportTicketsGetStatus = options.supportTicketsGetStatus ?? 200;
  const supportTicketsPatchStatus = options.supportTicketsPatchStatus ?? 200;
  const shipmentsGetStatus = options.shipmentsGetStatus ?? 200;
  const shipmentsStatusPostStatus = options.shipmentsStatusPostStatus ?? 200;
  const promosGetStatus = options.promosGetStatus ?? 200;
  const promosCreateStatus = options.promosCreateStatus ?? 201;
  const plansGetStatus = options.plansGetStatus ?? 200;
  const skusGetStatus = options.skusGetStatus ?? 200;
  const skusCreateStatus = options.skusCreateStatus ?? 201;
  const inventoryGetStatus = options.inventoryGetStatus ?? 200;
  const qrBatchesCreateStatus = options.qrBatchesCreateStatus ?? 201;
  const qrBatchesGenerateStatus = options.qrBatchesGenerateStatus ?? 200;
  const qrBatchesProvisionStatus = options.qrBatchesProvisionStatus ?? 200;
  const partnerReorderFulfilStatus = options.partnerReorderFulfilStatus ?? 200;
  const qrReplaceStatus = options.qrReplaceStatus ?? 200;
  const qrRetireStatus = options.qrRetireStatus ?? 200;
  const qrAutoDetachSweepStatus = options.qrAutoDetachSweepStatus ?? 200;
  const seedProvisionedQrBatch = options.seedProvisionedQrBatch ?? false;
  const auditEventsGetStatus = options.auditEventsGetStatus ?? 200;
  const usersLookupGetStatus = options.usersLookupGetStatus ?? 200;
  const usersGrantPostStatus = options.usersGrantPostStatus ?? 200;
  const usersRevokeDeleteStatus = options.usersRevokeDeleteStatus ?? 200;

  const capture: HermeticCapture = {
    initiate: [],
    approve: [],
    garageConfigGet: 0,
    garageConfigHistoryGet: [],
    garageConfigPut: [],
    garagePassGrant: [],
    garageFreeBidsAdjust: [],
    garageProvision: [],
    taxiPolicyGet: 0,
    taxiPolicyPut: [],
    taxiPolicyPublish: 0,
    breakGlassRequest: [],
    breakGlassApprove: [],
    ownershipClaimsGet: 0,
    ownershipClaimsGetStatusParams: [],
    ownershipClaimsReview: [],
    incidentsGet: 0,
    incidentsDetailGet: 0,
    ordersGet: 0,
    ordersRefund: [],
    clawbacksPost: [],
    settlementBatchPost: 0,
    supportTicketsGet: 0,
    supportTicketsPatch: [],
    shipmentsGet: 0,
    shipmentsStatusPost: [],
    promosGet: 0,
    promosCreate: [],
    plansGet: 0,
    skusGet: 0,
    skusCreate: [],
    inventoryGet: 0,
    qrBatchesCreate: [],
    qrBatchesGenerate: [],
    qrBatchesProvision: [],
    partnerReorderFulfil: [],
    qrReplace: [],
    qrRetire: [],
    qrAutoDetachSweep: [],
    auditEventsGet: 0,
    auditEventsGetQueries: [],
    usersLookupGet: [],
    usersGrantPost: [],
    usersRevokeDelete: [],
    subscriptionsGet: 0,
    paymentsGet: 0,
    qrBatchCodesGet: 0,
    qrBatchCodesExportGet: 0,
    unexpected: [],
  };

  let hermeticCustomerRoles: Array<{
    role: string;
    scopeRef: string | null;
    grantedAt: string;
  }> = [{ role: 'CONSUMER', scopeRef: null, grantedAt: '2026-10-01T00:00:00.000Z' }];

  let promosCatalog: Array<{
    id: string;
    code: string;
    discountPercent: number | null;
    discountPaise: number | null;
    validFrom: string | null;
    validTo: string | null;
    maxRedemptions: number | null;
    maxPerAccount: number | null;
    active: boolean;
  }> = [];

  type HermeticBatchSummary = {
    id: string;
    batchCode: string;
    channel: 'B2C' | 'B2B2C' | 'B2B';
    skuId: string;
    status:
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
    totalCount: number;
    generatedCount: number;
    provisionedCount: number;
    createdAt: string;
    provisionedAt: string | null;
  };

  /** Seed one active B2C SKU so Create batch picker works (FE-ahead Admin SKU list). */
  let skusCatalog: Array<{
    id: string;
    skuCode: string;
    channel: string;
    prepaid: boolean;
    listPricePaise: number;
    offeredTiers: string[];
    defaultPlanId: string | null;
    defaultPlanVersion: number | null;
    riderDefault: number;
    sponsorOrgId: string | null;
    active: boolean;
  }> = [
    {
      id: HERMETIC_SKU_ID,
      skuCode: HERMETIC_SKU_CODE,
      channel: 'B2C',
      prepaid: false,
      listPricePaise: 99_900,
      offeredTiers: ['SHIELD'],
      defaultPlanId: HERMETIC_PLAN_ID,
      defaultPlanVersion: 1,
      riderDefault: 0,
      sponsorOrgId: null,
      active: true,
    },
  ];

  let inventoryBatches: HermeticBatchSummary[] = seedProvisionedQrBatch
    ? [
        {
          id: HERMETIC_QR_BATCH_ID,
          batchCode: HERMETIC_QR_BATCH_CODE,
          channel: 'B2C',
          skuId: HERMETIC_SKU_ID,
          status: 'PROVISIONED',
          totalCount: 5,
          generatedCount: 5,
          provisionedCount: 5,
          createdAt: '2026-10-20T12:00:00.000Z',
          provisionedAt: '2026-10-20T12:30:00.000Z',
        },
      ]
    : [];

  let taxiPolicyState: HermeticTaxiPolicy = { ...HERMETIC_TAXI_POLICY };
  let breakGlassState = {
    id: HERMETIC_BREAK_GLASS_APPROVAL_ID,
    status: 'PENDING',
    scopeKey: 'INCIDENT_LIST',
    justification: '',
    requesterAdminId: HERMETIC_USER_ID,
    approverAdminId: null as string | null,
    denierAdminId: null as string | null,
    expiresAt: '2026-10-20T12:00:00.000Z',
    approvedAt: null as string | null,
    deniedAt: null as string | null,
    consumedAt: null as string | null,
    createdAt: '2026-10-20T11:00:00.000Z',
  };
  let ownershipClaimState = { ...HERMETIC_OWNERSHIP_CLAIM };
  const ownershipClaimsCatalog = [ownershipClaimState, { ...HERMETIC_OWNERSHIP_CLAIM_APPROVED }];

  /** Mutable Nest OA commercial-config audit list (newest first). */
  let garageConfigHistory: Array<typeof HERMETIC_GARAGE_CONFIG_AUDIT> = [
    { ...HERMETIC_GARAGE_CONFIG_AUDIT },
  ];
  let garageConfigAuditSeq = 0;

  const availableRoles =
    sessionRole === 'ADMIN' || sessionRole === 'OPERATOR'
      ? [sessionRole, 'CONSUMER']
      : sessionRole === 'CONSUMER'
        ? ['CONSUMER']
        : [sessionRole, 'CONSUMER'];

  await page.route('**/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (method === 'GET' && path === '/v1/profiles') {
      await fulfillJson(
        route,
        200,
        envelope({
          name: 'Hermetic Admin',
          locale: 'en',
          photoMediaId: null,
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/v1/auth/session') {
      await fulfillJson(
        route,
        200,
        envelope({
          role: sessionRole,
          availableRoles,
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/v1/auth/refresh') {
      await fulfillJson(
        route,
        200,
        envelope({
          accessToken: HERMETIC_TOKENS.accessToken,
          refreshToken: HERMETIC_TOKENS.refreshToken,
          expiresAt: HERMETIC_TOKENS.expiresAt,
          userId: HERMETIC_TOKENS.userId,
        }),
      );
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled hermetic stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  await page.route('**/admin/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    // Nest OA: GET /admin/v1/inventory — batch list + detail refresh source of truth.
    if (method === 'GET' && path === '/admin/v1/inventory') {
      capture.inventoryGet += 1;
      if (inventoryGetStatus >= 400) {
        await fulfillJson(
          route,
          inventoryGetStatus,
          errorEnvelope('Unable to load inventory', 'forbidden'),
        );
        return;
      }
      const state = url.searchParams.get('state');
      const rows = !state
        ? [...inventoryBatches]
        : inventoryBatches.filter((batch) => batch.status === state);
      await fulfillJson(route, inventoryGetStatus, envelope(rows));
      return;
    }

    // Nest OA: POST /admin/v1/qr-batches (DRAFT).
    if (method === 'POST' && path === '/admin/v1/qr-batches') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.qrBatchesCreate.push({ method, path, body });
      if (qrBatchesCreateStatus >= 400) {
        await fulfillJson(route, qrBatchesCreateStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const totalCount = typeof body.totalCount === 'number' ? body.totalCount : 5;
      const channel =
        body.channel === 'B2B' || body.channel === 'B2B2C' || body.channel === 'B2C'
          ? body.channel
          : 'B2C';
      const created: HermeticBatchSummary = {
        id: HERMETIC_QR_BATCH_ID,
        batchCode: HERMETIC_QR_BATCH_CODE,
        channel,
        skuId: typeof body.skuId === 'string' ? body.skuId : HERMETIC_SKU_ID,
        status: 'DRAFT',
        totalCount,
        generatedCount: 0,
        provisionedCount: 0,
        createdAt: '2026-10-20T12:00:00.000Z',
        provisionedAt: null,
      };
      inventoryBatches = [created, ...inventoryBatches.filter((row) => row.id !== created.id)];
      await fulfillJson(route, qrBatchesCreateStatus, envelope(created));
      return;
    }

    const qrGenerateMatch = path.match(/^\/admin\/v1\/qr-batches\/([^/]+)\/generate$/);
    if (method === 'POST' && qrGenerateMatch) {
      capture.qrBatchesGenerate.push({ method, path });
      if (qrBatchesGenerateStatus >= 400) {
        await fulfillJson(
          route,
          qrBatchesGenerateStatus,
          errorEnvelope(
            qrBatchesGenerateStatus === 409 ? 'Batch state invalid' : 'Forbidden',
            qrBatchesGenerateStatus === 409 ? 'batch_state_invalid' : 'forbidden',
          ),
        );
        return;
      }
      const batchId = decodeURIComponent(qrGenerateMatch[1] ?? HERMETIC_QR_BATCH_ID);
      const current = inventoryBatches.find((row) => row.id === batchId);
      if (!current) {
        await fulfillJson(route, 404, errorEnvelope('Batch not found', 'not_found'));
        return;
      }
      const generated: HermeticBatchSummary = {
        ...current,
        status: 'CODES_GENERATED',
        generatedCount: current.totalCount,
      };
      inventoryBatches = inventoryBatches.map((row) => (row.id === batchId ? generated : row));
      await fulfillJson(route, qrBatchesGenerateStatus, envelope(generated));
      return;
    }

    const qrProvisionMatch = path.match(/^\/admin\/v1\/qr-batches\/([^/]+)\/provision$/);
    if (method === 'POST' && qrProvisionMatch) {
      capture.qrBatchesProvision.push({ method, path });
      if (qrBatchesProvisionStatus >= 400) {
        await fulfillJson(
          route,
          qrBatchesProvisionStatus,
          errorEnvelope(
            qrBatchesProvisionStatus === 409 ? 'Batch state invalid' : 'Forbidden',
            qrBatchesProvisionStatus === 409 ? 'batch_state_invalid' : 'forbidden',
          ),
        );
        return;
      }
      const batchId = decodeURIComponent(qrProvisionMatch[1] ?? HERMETIC_QR_BATCH_ID);
      const current = inventoryBatches.find((row) => row.id === batchId);
      if (!current) {
        await fulfillJson(route, 404, errorEnvelope('Batch not found', 'not_found'));
        return;
      }
      const provisioned: HermeticBatchSummary = {
        ...current,
        status: 'PROVISIONED',
        provisionedCount: current.totalCount,
        provisionedAt: '2026-10-20T12:30:00.000Z',
      };
      inventoryBatches = inventoryBatches.map((row) => (row.id === batchId ? provisioned : row));
      await fulfillJson(route, qrBatchesProvisionStatus, envelope(provisioned));
      return;
    }

    // Nest OA: GET /admin/v1/qr-batches/{id}/codes (CL-BE-14). Export remains product-blocked.
    if (method === 'GET' && /^\/admin\/v1\/qr-batches\/[^/]+\/codes$/.test(path)) {
      capture.qrBatchCodesGet += 1;
      await fulfillJson(
        route,
        200,
        envelope([
          {
            id: 'cccccccc-dddd-4eee-8fff-0000000000aa',
            code: 'ALK-HERM-CODE-1',
            status: 'GENERATED',
            createdAt: '2026-10-20T12:00:00.000Z',
            activatedAt: null,
            retiredAt: null,
            retailOrderId: null,
            retailOrderNumber: null,
          },
        ]),
      );
      return;
    }
    if (method === 'GET' && /^\/admin\/v1\/qr-batches\/[^/]+\/codes\/export$/.test(path)) {
      capture.qrBatchCodesExportGet += 1;
      // Soft stub only — Admin UI must not call export (product-blocked).
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Not found', 'not_found')),
      });
      return;
    }

    // Nest OA: POST /admin/v1/partner-reorders/{id}/fulfil — empty body; id in path.
    const partnerReorderFulfilMatch = path.match(
      /^\/admin\/v1\/partner-reorders\/([^/]+)\/fulfil$/,
    );
    if (method === 'POST' && partnerReorderFulfilMatch) {
      const raw = req.postData();
      let body: unknown = null;
      if (raw && raw.trim() !== '' && raw.trim() !== 'undefined') {
        try {
          body = JSON.parse(raw) as unknown;
        } catch {
          body = raw;
        }
      }
      capture.partnerReorderFulfil.push({ method, path, body });
      if (partnerReorderFulfilStatus >= 400) {
        await fulfillJson(
          route,
          partnerReorderFulfilStatus,
          errorEnvelope(
            partnerReorderFulfilStatus === 404 ? 'Reorder not found' : 'Forbidden',
            partnerReorderFulfilStatus === 404 ? 'not_found' : 'forbidden',
          ),
        );
        return;
      }
      const reorderId = decodeURIComponent(partnerReorderFulfilMatch[1] ?? HERMETIC_REORDER_ID);
      await fulfillJson(
        route,
        partnerReorderFulfilStatus,
        envelope({
          reorderId,
          status: 'CONFIRMED',
          allocated: HERMETIC_REORDER_ALLOCATED,
          locationId: HERMETIC_REORDER_LOCATION_ID,
        }),
      );
      return;
    }

    // Nest OA: POST /admin/v1/qr/{code}/replace — empty body; code in path.
    const qrReplaceMatch = path.match(/^\/admin\/v1\/qr\/([^/]+)\/replace$/);
    if (method === 'POST' && qrReplaceMatch) {
      const raw = req.postData();
      let body: unknown = null;
      if (raw && raw.trim() !== '' && raw.trim() !== 'undefined') {
        try {
          body = JSON.parse(raw) as unknown;
        } catch {
          body = raw;
        }
      }
      capture.qrReplace.push({ method, path, body });
      if (qrReplaceStatus >= 400) {
        await fulfillJson(
          route,
          qrReplaceStatus,
          errorEnvelope(
            qrReplaceStatus === 409
              ? 'Code is not replaceable'
              : qrReplaceStatus === 404
                ? 'QR code not found'
                : 'Forbidden',
            qrReplaceStatus === 409
              ? 'not_replaceable'
              : qrReplaceStatus === 404
                ? 'not_found'
                : 'forbidden',
          ),
        );
        return;
      }
      const oldCode = decodeURIComponent(qrReplaceMatch[1] ?? HERMETIC_QR_CODE);
      await fulfillJson(
        route,
        qrReplaceStatus,
        envelope({
          oldCode,
          newCode: HERMETIC_QR_CODE_REPLACEMENT,
          vehicleId: HERMETIC_VEHICLE_ID,
          subscriptionId: HERMETIC_SUBSCRIPTION_ID,
        }),
      );
      return;
    }

    // Nest OA: POST /admin/v1/qr/{code}/retire — empty body; code in path.
    const qrRetireMatch = path.match(/^\/admin\/v1\/qr\/([^/]+)\/retire$/);
    if (method === 'POST' && qrRetireMatch) {
      const raw = req.postData();
      let body: unknown = null;
      if (raw && raw.trim() !== '' && raw.trim() !== 'undefined') {
        try {
          body = JSON.parse(raw) as unknown;
        } catch {
          body = raw;
        }
      }
      capture.qrRetire.push({ method, path, body });
      if (qrRetireStatus >= 400) {
        await fulfillJson(
          route,
          qrRetireStatus,
          errorEnvelope(
            qrRetireStatus === 409
              ? 'Code is not retirable'
              : qrRetireStatus === 404
                ? 'QR code not found'
                : 'Forbidden',
            qrRetireStatus === 409
              ? 'not_retirable'
              : qrRetireStatus === 404
                ? 'not_found'
                : 'forbidden',
          ),
        );
        return;
      }
      const code = decodeURIComponent(qrRetireMatch[1] ?? HERMETIC_QR_CODE);
      await fulfillJson(
        route,
        qrRetireStatus,
        envelope({
          qrCodeId: HERMETIC_QR_CODE_ID,
          code,
        }),
      );
      return;
    }

    // Nest OA: POST /admin/v1/qr-auto-detach-sweep — empty body.
    if (method === 'POST' && path === '/admin/v1/qr-auto-detach-sweep') {
      const raw = req.postData();
      let body: unknown = null;
      if (raw && raw.trim() !== '' && raw.trim() !== 'undefined') {
        try {
          body = JSON.parse(raw) as unknown;
        } catch {
          body = raw;
        }
      }
      capture.qrAutoDetachSweep.push({ method, path, body });
      if (qrAutoDetachSweepStatus >= 400) {
        await fulfillJson(route, qrAutoDetachSweepStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(
        route,
        qrAutoDetachSweepStatus,
        envelope({
          scanned: 3,
          detached: 2,
          skippedPaid: 1,
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/promos') {
      capture.promosGet += 1;
      if (promosGetStatus >= 400) {
        await fulfillJson(
          route,
          promosGetStatus,
          errorEnvelope('Unable to load promos', 'forbidden'),
        );
        return;
      }
      await fulfillJson(route, promosGetStatus, envelope([...promosCatalog]));
      return;
    }

    if (method === 'POST' && path === '/admin/v1/promos') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.promosCreate.push({ method, path, body });
      if (promosCreateStatus >= 400) {
        await fulfillJson(route, promosCreateStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const created = {
        id: HERMETIC_PROMO_ID,
        code: typeof body.code === 'string' ? body.code : HERMETIC_PROMO_CODE,
        discountPercent: typeof body.discountPercent === 'number' ? body.discountPercent : null,
        discountPaise: typeof body.discountPaise === 'number' ? body.discountPaise : null,
        validFrom: typeof body.validFrom === 'string' ? body.validFrom : null,
        validTo: typeof body.validTo === 'string' ? body.validTo : null,
        maxRedemptions: typeof body.maxRedemptions === 'number' ? body.maxRedemptions : null,
        maxPerAccount: typeof body.maxPerAccount === 'number' ? body.maxPerAccount : null,
        active: typeof body.active === 'boolean' ? body.active : true,
      };
      promosCatalog = [created, ...promosCatalog];
      await fulfillJson(route, promosCreateStatus, envelope(created));
      return;
    }
    if (method === 'GET' && path === '/admin/v1/audit-events') {
      capture.auditEventsGet += 1;
      capture.auditEventsGetQueries.push(
        url.search.startsWith('?') ? url.search.slice(1) : url.search,
      );
      if (auditEventsGetStatus >= 400) {
        await fulfillJson(route, auditEventsGetStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const action = url.searchParams.get('action');
      const targetType = url.searchParams.get('targetType');
      const targetId = url.searchParams.get('targetId');
      const catalog = [{ ...HERMETIC_AUDIT_EVENT }, { ...HERMETIC_AUDIT_EVENT_REFUND }];
      const rows = catalog.filter((row) => {
        if (action && row.action !== action) {
          return false;
        }
        if (targetType && row.targetType !== targetType) {
          return false;
        }
        if (targetId && row.targetId !== targetId) {
          return false;
        }
        return true;
      });
      await fulfillJson(route, auditEventsGetStatus, {
        data: rows,
        meta: {
          requestId: 'hermetic-req',
          correlationId: 'hermetic-corr',
          pagination: {
            limit: Number(url.searchParams.get('limit') ?? 50),
            cursor: null,
            nextCursor: null,
            hasMore: false,
          },
        },
      });
      return;
    }
    if (method === 'GET' && path === '/admin/v1/users') {
      const phone = url.searchParams.get('phone');
      capture.usersLookupGet.push({ phone });
      if (usersLookupGetStatus >= 400) {
        await fulfillJson(
          route,
          usersLookupGetStatus,
          errorEnvelope(
            usersLookupGetStatus === 404
              ? 'No account is registered for that phone number.'
              : 'Forbidden',
            usersLookupGetStatus === 404 ? 'not_found' : 'forbidden',
          ),
        );
        return;
      }
      const summary = {
        id: HERMETIC_CUSTOMER_ACCOUNT_ID,
        accountType: 'CONSUMER' as const,
        status: 'ACTIVE' as const,
        locale: 'en',
        fraudFlagged: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        roles: [...hermeticCustomerRoles],
      };
      const rows =
        !phone || phone === HERMETIC_CUSTOMER_PHONE || phone === '9876543210' ? [summary] : [];
      await fulfillJson(route, usersLookupGetStatus, {
        data: rows,
        meta: {
          requestId: 'hermetic-req',
          correlationId: 'hermetic-corr',
          pagination: {
            limit: Number(url.searchParams.get('limit') ?? 20),
            cursor: null,
            nextCursor: null,
            hasMore: false,
          },
        },
      });
      return;
    }

    const userDetailMatch = path.match(/^\/admin\/v1\/users\/([^/]+)$/);
    if (method === 'GET' && userDetailMatch) {
      await fulfillJson(
        route,
        200,
        envelope({
          id: decodeURIComponent(userDetailMatch[1] ?? HERMETIC_CUSTOMER_ACCOUNT_ID),
          accountType: 'CONSUMER',
          status: 'ACTIVE',
          locale: 'en',
          fraudFlagged: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          roles: [...hermeticCustomerRoles],
          name: 'Hermetic Customer',
        }),
      );
      return;
    }

    if (method === 'PATCH' && userDetailMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      await fulfillJson(
        route,
        200,
        envelope({
          id: decodeURIComponent(userDetailMatch[1] ?? HERMETIC_CUSTOMER_ACCOUNT_ID),
          accountType: 'CONSUMER',
          status: 'ACTIVE',
          locale: typeof body.locale === 'string' ? body.locale : 'en',
          fraudFlagged: typeof body.fraudFlagged === 'boolean' ? body.fraudFlagged : false,
          createdAt: '2026-01-01T00:00:00.000Z',
          roles: [...hermeticCustomerRoles],
        }),
      );
      return;
    }

    const userVehiclesMatch = path.match(/^\/admin\/v1\/users\/([^/]+)\/vehicles$/);
    if (method === 'GET' && userVehiclesMatch) {
      await fulfillJson(
        route,
        200,
        envelope([
          {
            vehicleId: HERMETIC_VEHICLE_ID,
            plate: 'DL7CQ1939',
            color: null,
            make: 'Honda',
            model: 'City',
            fuelType: 'PETROL',
            year: 2020,
            rcValidTillLabel: null,
            protection: 'UNPROTECTED',
          },
        ]),
      );
      return;
    }

    const userRolesGrantMatch = path.match(/^\/admin\/v1\/users\/([^/]+)\/roles$/);
    if (method === 'POST' && userRolesGrantMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.usersGrantPost.push({ method, path, body });
      if (usersGrantPostStatus >= 400) {
        await fulfillJson(route, usersGrantPostStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const role = typeof body.role === 'string' ? body.role : 'ADMIN';
      if (!hermeticCustomerRoles.some((entry) => entry.role === role)) {
        hermeticCustomerRoles = [
          ...hermeticCustomerRoles,
          { role, scopeRef: null, grantedAt: '2026-10-20T12:00:00.000Z' },
        ];
      }
      await fulfillJson(
        route,
        usersGrantPostStatus,
        envelope({
          id: decodeURIComponent(userRolesGrantMatch[1] ?? HERMETIC_CUSTOMER_ACCOUNT_ID),
          roles: [...hermeticCustomerRoles],
        }),
      );
      return;
    }

    const userRolesRevokeMatch = path.match(/^\/admin\/v1\/users\/([^/]+)\/roles\/([^/]+)$/);
    if (method === 'DELETE' && userRolesRevokeMatch) {
      capture.usersRevokeDelete.push({ method, path });
      if (usersRevokeDeleteStatus >= 400) {
        await fulfillJson(
          route,
          usersRevokeDeleteStatus,
          errorEnvelope(
            usersRevokeDeleteStatus === 409
              ? 'Cannot revoke the last remaining ADMIN.'
              : 'Forbidden',
            usersRevokeDeleteStatus === 409 ? 'conflict' : 'forbidden',
          ),
        );
        return;
      }
      const role = decodeURIComponent(userRolesRevokeMatch[2] ?? 'ADMIN');
      hermeticCustomerRoles = hermeticCustomerRoles.filter((entry) => entry.role !== role);
      await fulfillJson(
        route,
        usersRevokeDeleteStatus,
        envelope({
          id: decodeURIComponent(userRolesRevokeMatch[1] ?? HERMETIC_CUSTOMER_ACCOUNT_ID),
          roles: [...hermeticCustomerRoles],
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/subscriptions') {
      capture.subscriptionsGet += 1;
      await fulfillJson(
        route,
        200,
        envelope([
          {
            subscriptionId: HERMETIC_SUBSCRIPTION_ID,
            accountId: HERMETIC_USER_ID,
            qrCodeId: HERMETIC_QR_CODE,
            vehicleId: HERMETIC_VEHICLE_ID,
            planId: HERMETIC_PLAN_ID,
            planTier: 'SHIELD',
            planVersion: 1,
            status: 'ACTIVE',
            activatedVia: 'CONSUMER_SELF',
            autoRenew: false,
            startedAt: '2026-10-01T00:00:00.000Z',
            renewsAt: '2027-10-01T00:00:00.000Z',
          },
        ]),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/payments') {
      capture.paymentsGet += 1;
      await fulfillJson(
        route,
        200,
        envelope([
          {
            paymentId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee7777',
            orderId: HERMETIC_ORDER_ID,
            orderNumber: HERMETIC_ORDER_NUMBER,
            ref: HERMETIC_PAYMENT_REF,
            providerRef: null,
            mode: 'ONLINE',
            state: 'CAPTURED',
            outcome: 'PAID',
            amountPaise: 19900,
            createdAt: '2026-10-19T00:00:00.000Z',
          },
        ]),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/plans') {
      capture.plansGet += 1;
      if (plansGetStatus >= 400) {
        await fulfillJson(route, plansGetStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(route, plansGetStatus, envelope([{ ...HERMETIC_PLAN }]));
      return;
    }
    const planFeaturesMatch = path.match(/^\/admin\/v1\/plans\/([^/]+)\/features$/);
    if (method === 'GET' && planFeaturesMatch) {
      await fulfillJson(
        route,
        200,
        envelope({
          planId: decodeURIComponent(planFeaturesMatch[1] ?? HERMETIC_PLAN_ID),
          features: ['Hermetic roadside cover'],
          badge: null,
          includesLabel: null,
        }),
      );
      return;
    }
    if (method === 'GET' && path === '/admin/v1/skus') {
      capture.skusGet += 1;
      if (skusGetStatus >= 400) {
        await fulfillJson(route, skusGetStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(route, skusGetStatus, envelope([...skusCatalog]));
      return;
    }
    if (method === 'POST' && path === '/admin/v1/skus') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.skusCreate.push({ method, path, body });
      if (skusCreateStatus >= 400) {
        await fulfillJson(route, skusCreateStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const offeredTiers = Array.isArray(body.offeredTiers)
        ? (body.offeredTiers as string[])
        : ['SHIELD'];
      const created = {
        id: HERMETIC_SKU_ID,
        skuCode: typeof body.skuCode === 'string' ? body.skuCode : HERMETIC_SKU_CODE,
        channel: typeof body.channel === 'string' ? body.channel : 'B2C',
        prepaid: typeof body.prepaid === 'boolean' ? body.prepaid : false,
        listPricePaise: typeof body.listPricePaise === 'number' ? body.listPricePaise : 99_900,
        offeredTiers,
        defaultPlanId:
          typeof body.defaultPlanId === 'string' ? body.defaultPlanId : HERMETIC_PLAN_ID,
        defaultPlanVersion: HERMETIC_PLAN.version,
        riderDefault: typeof body.riderDefault === 'number' ? body.riderDefault : 0,
        sponsorOrgId: typeof body.sponsorOrgId === 'string' ? body.sponsorOrgId : null,
        active: typeof body.active === 'boolean' ? body.active : true,
      };
      skusCatalog = [created, ...skusCatalog];
      await fulfillJson(route, skusCreateStatus, envelope(created));
      return;
    }

    if (method === 'POST' && path === '/admin/v1/ownership-transfers') {
      const body = JSON.parse(req.postData() ?? '{}') as unknown;
      capture.initiate.push({ method, path, body });
      if (initiateStatus >= 400) {
        await fulfillJson(route, initiateStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(
        route,
        initiateStatus,
        envelope({
          transferId: HERMETIC_TRANSFER_ID,
          vehicleId: HERMETIC_VEHICLE_ID,
          status: 'INITIATED',
        }),
      );
      return;
    }

    const approveMatch = path.match(/^\/admin\/v1\/ownership-transfers\/([^/]+)\/approve$/);
    if (method === 'POST' && approveMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as unknown;
      capture.approve.push({ method, path, body });
      if (approveStatus >= 400) {
        await fulfillJson(route, approveStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(
        route,
        approveStatus,
        envelope({
          transferId: approveMatch[1],
          vehicleId: HERMETIC_VEHICLE_ID,
          toAccountId: HERMETIC_TO_ACCOUNT_ID,
          status: 'COMPLETED',
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/garage/commercial-config') {
      capture.garageConfigGet += 1;
      if (garageConfigGetStatus >= 400) {
        await fulfillJson(
          route,
          garageConfigGetStatus,
          errorEnvelope('Unable to load commercial config', 'forbidden'),
        );
        return;
      }
      await fulfillJson(route, garageConfigGetStatus, envelope(HERMETIC_GARAGE_CONFIG));
      return;
    }

    if (method === 'PUT' && path === '/admin/v1/garage/commercial-config') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.garageConfigPut.push({ method, path, body });
      if (garageConfigPutStatus >= 400) {
        await fulfillJson(route, garageConfigPutStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const previousAfter = garageConfigHistory[0]?.after ?? { ...HERMETIC_GARAGE_CONFIG_BODY };
      const nextAfter = {
        ...HERMETIC_GARAGE_CONFIG_BODY,
        ...previousAfter,
        ...body,
      };
      garageConfigAuditSeq += 1;
      garageConfigHistory = [
        {
          id: `ffffffff-0000-4000-8000-${String(garageConfigAuditSeq).padStart(12, '0')}`,
          configId: HERMETIC_GARAGE_CONFIG.id,
          adminAccountId: HERMETIC_USER_ID,
          requestId: null,
          before: { ...previousAfter },
          after: nextAfter,
          createdAt: `2026-10-19T0${String(Math.min(garageConfigAuditSeq, 9))}:00:00.000Z`,
        },
        ...garageConfigHistory,
      ];
      await fulfillJson(
        route,
        garageConfigPutStatus,
        envelope({
          ...HERMETIC_GARAGE_CONFIG,
          ...body,
          updatedAt: '2026-10-19T00:00:00.000Z',
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/garage/commercial-config/history') {
      capture.garageConfigHistoryGet.push({
        method,
        path,
        limit: url.searchParams.get('limit'),
      });
      if (garageConfigHistoryGetStatus >= 400) {
        await fulfillJson(
          route,
          garageConfigHistoryGetStatus,
          errorEnvelope('Forbidden', 'forbidden'),
        );
        return;
      }
      const limitRaw = url.searchParams.get('limit');
      const limit = limitRaw ? Number(limitRaw) : undefined;
      const rows =
        typeof limit === 'number' && Number.isFinite(limit) && limit > 0
          ? garageConfigHistory.slice(0, limit)
          : garageConfigHistory;
      await fulfillJson(route, garageConfigHistoryGetStatus, envelope(rows));
      return;
    }

    const grantMatch = path.match(/^\/admin\/v1\/garage\/orgs\/([^/]+)\/passes\/grant$/);
    if (method === 'POST' && grantMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as unknown;
      capture.garagePassGrant.push({ method, path, body });
      if (garagePassGrantStatus >= 400) {
        await fulfillJson(route, garagePassGrantStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const kind =
        typeof body === 'object' &&
        body !== null &&
        'kind' in body &&
        (body.kind === 'DAY' || body.kind === 'MONTH')
          ? body.kind
          : 'DAY';
      await fulfillJson(
        route,
        garagePassGrantStatus,
        envelope({
          orgId: decodeURIComponent(grantMatch[1] ?? HERMETIC_GARAGE_ORG_ID),
          kind,
          startsAt: '2026-10-19T00:00:00.000Z',
          endsAt: '2026-10-20T00:00:00.000Z',
          amountRupees: kind === 'MONTH' ? 1800 : 100,
          purchaseId: HERMETIC_GARAGE_PURCHASE_ID,
        }),
      );
      return;
    }

    const adjustMatch = path.match(/^\/admin\/v1\/garage\/orgs\/([^/]+)\/free-bids\/adjust$/);
    if (method === 'POST' && adjustMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as { delta?: number };
      capture.garageFreeBidsAdjust.push({ method, path, body });
      if (garageFreeBidsAdjustStatus >= 400) {
        await fulfillJson(
          route,
          garageFreeBidsAdjustStatus,
          errorEnvelope('Forbidden', 'forbidden'),
        );
        return;
      }
      const delta = typeof body.delta === 'number' ? body.delta : 0;
      await fulfillJson(
        route,
        garageFreeBidsAdjustStatus,
        envelope({
          orgId: decodeURIComponent(adjustMatch[1] ?? HERMETIC_GARAGE_ORG_ID),
          remaining: Math.max(0, 2 + delta),
          lifetimeGranted: Math.max(2, 2 + delta),
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/admin/v1/garage/provision') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.garageProvision.push({ method, path, body });
      if (garageProvisionStatus >= 400) {
        await fulfillJson(route, garageProvisionStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      await fulfillJson(
        route,
        garageProvisionStatus,
        envelope({
          orgId: HERMETIC_GARAGE_ORG_ID,
          staffId: HERMETIC_GARAGE_STAFF_ID,
          storeId: HERMETIC_GARAGE_STORE_ID,
          kycRecordId: HERMETIC_GARAGE_KYC_ID,
          storeStatus: 'DRAFT',
          freeBidsGranted: true,
          freeBidsRemaining: 2,
          freeBidLifetimeGranted: 2,
          converged: true,
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/taxi/policy') {
      capture.taxiPolicyGet += 1;
      if (taxiPolicyGetStatus >= 400) {
        await fulfillJson(
          route,
          taxiPolicyGetStatus,
          errorEnvelope('Taxi policy unavailable', 'taxi_policy_unavailable'),
        );
        return;
      }
      await fulfillJson(route, taxiPolicyGetStatus, envelope(taxiPolicyState));
      return;
    }

    if (method === 'PUT' && path === '/admin/v1/taxi/policy') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.taxiPolicyPut.push({ method, path, body });
      if (taxiPolicyPutStatus >= 400) {
        await fulfillJson(route, taxiPolicyPutStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      taxiPolicyState = {
        ...taxiPolicyState,
        status: 'DRAFT',
        customerAdvanceBps:
          typeof body.customerAdvanceBps === 'number'
            ? body.customerAdvanceBps
            : taxiPolicyState.customerAdvanceBps,
        partnerDepositBps:
          typeof body.partnerDepositBps === 'number'
            ? body.partnerDepositBps
            : taxiPolicyState.partnerDepositBps,
      };
      await fulfillJson(route, taxiPolicyPutStatus, envelope(taxiPolicyState));
      return;
    }

    if (method === 'POST' && path === '/admin/v1/taxi/policy/publish') {
      capture.taxiPolicyPublish += 1;
      if (taxiPolicyPublishStatus >= 400) {
        await fulfillJson(
          route,
          taxiPolicyPublishStatus,
          errorEnvelope('Draft unavailable', 'taxi_policy_draft_unavailable'),
        );
        return;
      }
      taxiPolicyState = { ...taxiPolicyState, status: 'PUBLISHED' };
      await fulfillJson(route, taxiPolicyPublishStatus, envelope(taxiPolicyState));
      return;
    }

    if (method === 'GET' && path === '/admin/v1/taxi/policy/history') {
      await fulfillJson(
        route,
        200,
        envelope(
          taxiPolicyState.status === 'PUBLISHED'
            ? [{ ...taxiPolicyState, publishedAt: '2026-10-20T00:00:00.000Z' }]
            : [],
        ),
      );
      return;
    }

    if (method === 'POST' && path === '/admin/v1/break-glass/approvals') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.breakGlassRequest.push({ method, path, body });
      if (breakGlassRequestStatus >= 400) {
        await fulfillJson(
          route,
          breakGlassRequestStatus,
          errorEnvelope('Break-glass policy unconfigured', 'break_glass_policy_unconfigured'),
        );
        return;
      }
      breakGlassState = {
        ...breakGlassState,
        status: 'PENDING',
        justification:
          typeof body.justification === 'string'
            ? body.justification
            : breakGlassState.justification,
        scopeKey:
          body.scopeKind === 'INCIDENT_DETAIL' && typeof body.incidentId === 'string'
            ? `INCIDENT_DETAIL:${body.incidentId}`
            : 'INCIDENT_LIST',
        approverAdminId: null,
        approvedAt: null,
        deniedAt: null,
        consumedAt: null,
      };
      await fulfillJson(route, breakGlassRequestStatus, envelope(breakGlassState));
      return;
    }

    const breakGlassGetMatch = path.match(/^\/admin\/v1\/break-glass\/approvals\/([^/]+)$/);
    if (method === 'GET' && breakGlassGetMatch) {
      await fulfillJson(
        route,
        200,
        envelope({ ...breakGlassState, id: decodeURIComponent(breakGlassGetMatch[1] ?? '') }),
      );
      return;
    }

    const breakGlassApproveMatch = path.match(
      /^\/admin\/v1\/break-glass\/approvals\/([^/]+)\/approve$/,
    );
    if (method === 'POST' && breakGlassApproveMatch) {
      const id = decodeURIComponent(breakGlassApproveMatch[1] ?? '');
      capture.breakGlassApprove.push(id);
      breakGlassState = {
        ...breakGlassState,
        id,
        status: 'APPROVED',
        approverAdminId: 'hermetic-peer-admin',
        approvedAt: '2026-10-20T11:05:00.000Z',
      };
      await fulfillJson(route, 200, envelope(breakGlassState));
      return;
    }

    const breakGlassDenyMatch = path.match(/^\/admin\/v1\/break-glass\/approvals\/([^/]+)\/deny$/);
    if (method === 'POST' && breakGlassDenyMatch) {
      const id = decodeURIComponent(breakGlassDenyMatch[1] ?? '');
      breakGlassState = {
        ...breakGlassState,
        id,
        status: 'DENIED',
        denierAdminId: 'hermetic-peer-admin',
        deniedAt: '2026-10-20T11:05:00.000Z',
      };
      await fulfillJson(route, 200, envelope(breakGlassState));
      return;
    }

    if (method === 'GET' && path === '/admin/v1/incidents') {
      capture.incidentsGet += 1;
      const approvalId = url.searchParams.get('approvalId');
      if (!approvalId) {
        await fulfillJson(route, 403, errorEnvelope('approvalId required', 'forbidden'));
        return;
      }
      breakGlassState = {
        ...breakGlassState,
        status: 'CONSUMED',
        consumedAt: '2026-10-20T11:10:00.000Z',
      };
      // listAdminIncidentsPage unwraps envelope data as the items array.
      await fulfillJson(
        route,
        200,
        envelope([
          {
            incidentId: HERMETIC_INCIDENT_ID,
            status: 'OPEN',
            source: 'SOS_BUTTON',
            openedAt: '2026-10-19T00:00:00.000Z',
            qrCodeId: null,
            vehicleId: HERMETIC_VEHICLE_ID,
          },
        ]),
      );
      return;
    }

    const incidentDetailMatch = path.match(/^\/admin\/v1\/incidents\/([^/]+)$/);
    if (method === 'GET' && incidentDetailMatch) {
      capture.incidentsDetailGet += 1;
      const approvalId = url.searchParams.get('approvalId');
      if (!approvalId) {
        await fulfillJson(route, 403, errorEnvelope('approvalId required', 'forbidden'));
        return;
      }
      const incidentId = decodeURIComponent(incidentDetailMatch[1] ?? HERMETIC_INCIDENT_ID);
      breakGlassState = {
        ...breakGlassState,
        status: 'CONSUMED',
        consumedAt: '2026-10-20T11:10:00.000Z',
      };
      await fulfillJson(
        route,
        200,
        envelope({
          incidentId,
          qrCodeId: null,
          vehicleId: HERMETIC_VEHICLE_ID,
          source: 'SOS_BUTTON',
          status: 'OPEN',
          coverageSnapshot: null,
          openedAt: '2026-10-19T00:00:00.000Z',
          windowExpiresAt: '2026-10-19T01:00:00.000Z',
          lastProgressAt: '2026-10-19T00:05:00.000Z',
          dispatchOrchestrator: 'hermetic',
          suspectedFalseAlarm: false,
          resolvedAt: null,
          alerts: [{ id: 'alert-1', contentPii: false, createdAt: '2026-10-19T00:00:00.000Z' }],
          timeline: [{ id: 'step-1', createdAt: '2026-10-19T00:01:00.000Z' }],
          media: [],
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/ownership-claims') {
      capture.ownershipClaimsGet += 1;
      const status = url.searchParams.get('status');
      capture.ownershipClaimsGetStatusParams.push(status);
      if (ownershipClaimsGetStatus >= 400) {
        await fulfillJson(
          route,
          ownershipClaimsGetStatus,
          errorEnvelope('Unable to load ownership claims', 'forbidden'),
        );
        return;
      }
      // Keep catalog in sync with mutable submitted claim.
      ownershipClaimsCatalog[0] = ownershipClaimState;
      const rows = !status
        ? [...ownershipClaimsCatalog]
        : ownershipClaimsCatalog.filter((row) => row.status === status);
      await fulfillJson(route, ownershipClaimsGetStatus, envelope(rows));
      return;
    }

    const claimReviewMatch = path.match(/^\/admin\/v1\/ownership-claims\/([^/]+)\/review$/);
    if (method === 'POST' && claimReviewMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.ownershipClaimsReview.push({ method, path, body });
      const decision =
        typeof body.decision === 'string' ? body.decision : ownershipClaimState.status;
      ownershipClaimState = {
        ...ownershipClaimState,
        id: decodeURIComponent(claimReviewMatch[1] ?? HERMETIC_OWNERSHIP_CLAIM_ID),
        status: decision as typeof ownershipClaimState.status,
      };
      ownershipClaimsCatalog[0] = ownershipClaimState;
      await fulfillJson(route, 200, envelope(ownershipClaimState));
      return;
    }

    if (method === 'GET' && path === '/admin/v1/orders') {
      capture.ordersGet += 1;
      if (ordersGetStatus >= 400) {
        await fulfillJson(
          route,
          ordersGetStatus,
          errorEnvelope('Unable to load orders', 'forbidden'),
        );
        return;
      }
      const status = url.searchParams.get('status');
      const catalog = [
        {
          orderId: HERMETIC_ORDER_ID,
          orderNumber: HERMETIC_ORDER_NUMBER,
          accountId: HERMETIC_USER_ID,
          orderKind: 'PARTNER_ATTACH',
          status: 'PAID',
          planName: 'Hermetic Plan',
          planVersion: 1,
          riderCount: 1,
          totalPaise: 19900,
          createdAt: '2026-10-19T00:00:00.000Z',
          fulfillment: null,
        },
        {
          orderId: HERMETIC_ORDER_DRAFT_ID,
          orderNumber: HERMETIC_ORDER_DRAFT_NUMBER,
          accountId: HERMETIC_USER_ID,
          orderKind: 'SCAN_SELF_PAY',
          status: 'DRAFT',
          planName: 'Hermetic Plan',
          planVersion: 1,
          riderCount: 1,
          totalPaise: 9900,
          createdAt: '2026-10-18T00:00:00.000Z',
          fulfillment: null,
        },
      ];
      const rows = !status ? catalog : catalog.filter((row) => row.status === status);
      await fulfillJson(route, ordersGetStatus, envelope(rows));
      return;
    }

    const orderRefundMatch = path.match(/^\/admin\/v1\/orders\/([^/]+)\/refund$/);
    if (method === 'POST' && orderRefundMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.ordersRefund.push({ method, path, body });
      if (ordersRefundStatus >= 400) {
        await fulfillJson(
          route,
          ordersRefundStatus,
          errorEnvelope(
            ordersRefundStatus === 409 ? 'Order is not refundable' : 'Forbidden',
            ordersRefundStatus === 409 ? 'order_not_refundable' : 'forbidden',
          ),
        );
        return;
      }
      await fulfillJson(
        route,
        ordersRefundStatus,
        envelope({
          paymentRef: HERMETIC_PAYMENT_REF,
          state: 'REFUND_PENDING',
          amountPaise: 19900,
          refundRef: HERMETIC_REFUND_REF,
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/admin/v1/clawbacks') {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.clawbacksPost.push({ method, path, body });
      if (clawbacksPostStatus >= 400) {
        await fulfillJson(route, clawbacksPostStatus, errorEnvelope('Forbidden', 'forbidden'));
        return;
      }
      const paymentRef =
        typeof body.paymentRef === 'string' ? body.paymentRef : HERMETIC_CLAWBACK_PAYMENT_REF;
      await fulfillJson(
        route,
        clawbacksPostStatus,
        envelope({
          paymentRef,
          paymentState: 'CB_LOST',
          commissionStatus: 'CLAWED_BACK',
        }),
      );
      return;
    }

    if (method === 'POST' && path === '/admin/v1/settlement-batch') {
      capture.settlementBatchPost += 1;
      if (settlementBatchPostStatus >= 400) {
        await fulfillJson(
          route,
          settlementBatchPostStatus,
          errorEnvelope('Forbidden', 'forbidden'),
        );
        return;
      }
      await fulfillJson(
        route,
        settlementBatchPostStatus,
        envelope({
          groups: 3,
          payouts: 2,
          skipped: 1,
          errors: 0,
          payoutIds: [HERMETIC_SETTLEMENT_PAYOUT_ID],
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/support/tickets') {
      capture.supportTicketsGet += 1;
      if (supportTicketsGetStatus >= 400) {
        await fulfillJson(
          route,
          supportTicketsGetStatus,
          errorEnvelope('Unable to load support tickets', 'forbidden'),
        );
        return;
      }
      const status = url.searchParams.get('status');
      const type = url.searchParams.get('type');
      const catalog = [
        {
          ticketId: HERMETIC_SUPPORT_TICKET_ID,
          accountId: HERMETIC_USER_ID,
          type: 'LOST_QR',
          subject: HERMETIC_SUPPORT_TICKET_SUBJECT,
          status: 'OPEN',
          createdAt: '2026-10-19T00:00:00.000Z',
          updatedAt: '2026-10-19T00:00:00.000Z',
        },
      ];
      const rows = catalog.filter((row) => {
        if (status && row.status !== status) return false;
        if (type && row.type !== type) return false;
        return true;
      });
      await fulfillJson(route, supportTicketsGetStatus, envelope(rows));
      return;
    }

    const supportTicketPatchMatch = path.match(/^\/admin\/v1\/support\/tickets\/([^/]+)$/);
    if (method === 'PATCH' && supportTicketPatchMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.supportTicketsPatch.push({ method, path, body });
      if (supportTicketsPatchStatus >= 400) {
        await fulfillJson(
          route,
          supportTicketsPatchStatus,
          errorEnvelope('Forbidden', 'forbidden'),
        );
        return;
      }
      const ticketId = decodeURIComponent(supportTicketPatchMatch[1] ?? HERMETIC_SUPPORT_TICKET_ID);
      const nextStatus = typeof body.status === 'string' ? body.status : 'IN_PROGRESS';
      await fulfillJson(
        route,
        supportTicketsPatchStatus,
        envelope({
          ticketId,
          accountId: HERMETIC_USER_ID,
          type: 'LOST_QR',
          subject: HERMETIC_SUPPORT_TICKET_SUBJECT,
          body: 'Hermetic ticket body',
          status: nextStatus,
          metadata: { qr_code: 'ALK-HERM-ST' },
          createdAt: '2026-10-19T00:00:00.000Z',
          updatedAt: '2026-10-20T12:00:00.000Z',
        }),
      );
      return;
    }

    if (method === 'GET' && path === '/admin/v1/shipments') {
      capture.shipmentsGet += 1;
      if (shipmentsGetStatus >= 400) {
        await fulfillJson(
          route,
          shipmentsGetStatus,
          errorEnvelope('Unable to load shipments', 'forbidden'),
        );
        return;
      }
      const status = url.searchParams.get('status');
      const catalog = [
        {
          orderId: HERMETIC_SHIPMENT_ORDER_ID,
          orderNumber: HERMETIC_SHIPMENT_ORDER_NUMBER,
          accountId: HERMETIC_USER_ID,
          status: 'PAID',
          courier: null,
          awbNo: null,
          trackingUrl: null,
          maskedPincode: '560***',
          allocatedQrCode: null,
          shippedAt: null,
          deliveredAt: null,
          createdAt: '2026-10-19T00:00:00.000Z',
        },
      ];
      const rows = !status ? catalog : catalog.filter((row) => row.status === status);
      await fulfillJson(route, shipmentsGetStatus, envelope(rows));
      return;
    }

    const shipmentStatusMatch = path.match(/^\/admin\/v1\/shipments\/([^/]+)\/status$/);
    if (method === 'POST' && shipmentStatusMatch) {
      const body = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
      capture.shipmentsStatusPost.push({ method, path, body });
      if (shipmentsStatusPostStatus >= 400) {
        await fulfillJson(
          route,
          shipmentsStatusPostStatus,
          errorEnvelope(
            shipmentsStatusPostStatus === 409 ? 'Shipment state invalid' : 'Forbidden',
            shipmentsStatusPostStatus === 409 ? 'shipment_state_invalid' : 'forbidden',
          ),
        );
        return;
      }
      const orderId = decodeURIComponent(shipmentStatusMatch[1] ?? HERMETIC_SHIPMENT_ORDER_ID);
      const nextStatus = typeof body.status === 'string' ? body.status : 'SHIPPED';
      await fulfillJson(
        route,
        shipmentsStatusPostStatus,
        envelope({
          orderId,
          orderNumber: HERMETIC_SHIPMENT_ORDER_NUMBER,
          accountId: HERMETIC_USER_ID,
          status: nextStatus,
          courier: 'HermeticCourier',
          awbNo: 'HERM-AWB-1',
          trackingUrl: null,
          maskedPincode: '560***',
          allocatedQrCode: HERMETIC_SHIPMENT_QR,
          allocatedAt: '2026-10-19T00:00:00.000Z',
          shippedAt:
            nextStatus === 'SHIPPED' || nextStatus === 'IN_TRANSIT' || nextStatus === 'DELIVERED'
              ? '2026-10-20T12:00:00.000Z'
              : null,
          inTransitAt: null,
          deliveredAt: nextStatus === 'DELIVERED' ? '2026-10-20T12:00:00.000Z' : null,
          returnedAt: null,
          cancelledAt: null,
          lostAt: null,
          events: [
            {
              status: nextStatus,
              rawStatus: null,
              location: null,
              activity: 'Hermetic manual mark',
              occurredAt: '2026-10-20T12:00:00.000Z',
            },
          ],
        }),
      );
      return;
    }

    capture.unexpected.push(`${method} ${path}`);
    await fulfillJson(
      route,
      404,
      errorEnvelope(`Unhandled hermetic stub: ${method} ${path}`, 'NOT_MOCKED'),
    );
  });

  return capture;
}

/** Inject synthetic session tokens before the Admin app mounts. */
export async function seedHermeticSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    { key: ADMIN_TOKEN_KEY, value: HERMETIC_TOKENS },
  );
}

/** Land on ownership-transfers after auth bootstrap. */
export async function openOwnershipTransfersPage(page: Page): Promise<void> {
  await page.goto('/ownership-transfers', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Ownership' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on garage commercial after auth bootstrap. */
export async function openGarageCommercialPage(page: Page): Promise<void> {
  await page.goto('/garage-commercial', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Garage commercial' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on taxi policy after auth bootstrap. */
export async function openTaxiPolicyPage(page: Page): Promise<void> {
  await page.goto('/taxi-policy', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Taxi policy' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on incidents (break-glass) after auth bootstrap. */
export async function openIncidentsPage(page: Page): Promise<void> {
  await page.goto('/incidents', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Incidents' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on ownership claims after auth bootstrap. */
export async function openOwnershipClaimsPage(page: Page): Promise<void> {
  await page.goto('/ownership-claims', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Ownership claims' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on orders after auth bootstrap. */
export async function openOrdersPage(page: Page): Promise<void> {
  await page.goto('/orders', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Orders' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on finance settlements after auth bootstrap. */
export async function openFinancePage(page: Page): Promise<void> {
  await page.goto('/finance', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Settlements' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on support tickets after auth bootstrap. */
export async function openSupportTicketsPage(page: Page): Promise<void> {
  await page.goto('/support', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Tickets' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on shipments (Deliveries) after auth bootstrap. */
export async function openShipmentsPage(page: Page): Promise<void> {
  await page.goto('/shipments', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Deliveries' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on promos after auth bootstrap. */
export async function openPromosPage(page: Page): Promise<void> {
  await page.goto('/promos', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Promos', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on catalog after auth bootstrap. */
export async function openCatalogPage(page: Page): Promise<void> {
  await page.goto('/catalog', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Catalog', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on audit Activity Log after auth bootstrap. */
export async function openAuditEventsPage(page: Page): Promise<void> {
  await page.goto('/audit-events', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Activity Log', exact: true })
    .waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on Customers (users & roles) after auth bootstrap. */
export async function openSubscriptionsPage(page: Page): Promise<void> {
  await page.goto('/subscriptions', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Coverage' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

export async function openPaymentsPage(page: Page): Promise<void> {
  await page.goto('/payments', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Payments' }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

export async function openUsersPage(page: Page): Promise<void> {
  await page.goto('/users', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Customers', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on QR Batch Management after auth bootstrap. */
export async function openQrBatchesPage(page: Page): Promise<void> {
  await page.goto('/qr-batches', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Batches', exact: true }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}

/** Land on a seeded QR batch detail page (requires `seedProvisionedQrBatch: true`). */
export async function openQrBatchDetailPage(
  page: Page,
  batchId: string = HERMETIC_QR_BATCH_ID,
): Promise<void> {
  await page.goto(`/qr-batches/${batchId}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: HERMETIC_QR_BATCH_CODE }).waitFor({ timeout: 30_000 });
  await page.getByText('Sign out').waitFor({ timeout: 15_000 });
}
