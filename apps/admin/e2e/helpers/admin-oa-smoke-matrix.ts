/**
 * Admin hermetic smoke matrix vs **live Dev** Nest OpenAPI (Phase 11).
 *
 * Source of truth (read-only): `GET https://d1wpatcmpyt0pw.cloudfront.net/openapi.json`
 * re-counted 2026-10-26 Asia/Calcutta:
 *   - 327 path keys / 386 ops overall
 *   - 91 `/admin/*` method+path ops
 * FE has no checked-in OpenAPI copy — do not invent endpoints.
 * A local BE worktree OA may list more paths — those are **not** Live Supported until Dev serves them.
 *
 * Supported = exact method+path present on live Dev OA.
 * G0-4 Absents = five product-blocked mutates/exports still absent from Nest (KEEP DISABLED).
 * Live-missing FE callers = FE still calls paths absent from live Dev — document BE decision; do not invent.
 */

/** Nest live Dev OA `/admin/v1/*` routes (method + template path). Sorted. */
export const NEST_OA_ADMIN_ROUTES = [
  'DELETE /admin/v1/services/providers/{id}',
  'GET /admin/v1/audit-events',
  'GET /admin/v1/break-glass/approvals/{approvalId}',
  'GET /admin/v1/community/questions',
  'GET /admin/v1/community/questions/{id}',
  'GET /admin/v1/community/reels',
  'GET /admin/v1/community/reels/{id}',
  'GET /admin/v1/garage/commercial-config',
  'GET /admin/v1/garage/commercial-config/history',
  'GET /admin/v1/incidents',
  'GET /admin/v1/incidents/{incidentId}',
  'GET /admin/v1/inventory',
  'GET /admin/v1/orders',
  'GET /admin/v1/orders/{orderId}',
  'GET /admin/v1/ownership-claims',
  'GET /admin/v1/partners',
  'GET /admin/v1/partners/requests',
  'GET /admin/v1/partners/requests/{id}',
  'GET /admin/v1/partners/{orgId}',
  'GET /admin/v1/payments',
  'GET /admin/v1/payments/{paymentId}',
  'GET /admin/v1/plans',
  'GET /admin/v1/plans/{planId}/features',
  'GET /admin/v1/promos',
  'GET /admin/v1/qr-batches/{id}/codes',
  'GET /admin/v1/shipments',
  'GET /admin/v1/shipments/{orderId}',
  'GET /admin/v1/skus',
  'GET /admin/v1/subscriptions',
  'GET /admin/v1/subscriptions/{subscriptionId}',
  'GET /admin/v1/taxi/policy',
  'GET /admin/v1/taxi/policy/history',
  'GET /admin/v1/taxi/requests',
  'GET /admin/v1/taxi/requests/{id}',
  'GET /admin/v1/users',
  'GET /admin/v1/users/{userId}',
  'GET /admin/v1/users/{userId}/emergency-contacts',
  'GET /admin/v1/users/{userId}/expenses',
  'GET /admin/v1/users/{userId}/maintenance-jobs',
  'GET /admin/v1/users/{userId}/maintenance-schedule',
  'GET /admin/v1/users/{userId}/service-logs',
  'GET /admin/v1/users/{userId}/vehicle-documents',
  'GET /admin/v1/users/{userId}/vehicles',
  'PATCH /admin/v1/community/questions/{id}',
  'PATCH /admin/v1/community/reels/{id}',
  'PATCH /admin/v1/plans/{planId}',
  'PATCH /admin/v1/plans/{planId}/features',
  'PATCH /admin/v1/skus/{skuId}',
  'PATCH /admin/v1/users/{userId}',
  'POST /admin/v1/break-glass/approvals',
  'POST /admin/v1/break-glass/approvals/{approvalId}/approve',
  'POST /admin/v1/break-glass/approvals/{approvalId}/deny',
  'POST /admin/v1/clawbacks',
  'POST /admin/v1/community/questions',
  'POST /admin/v1/community/reels',
  'POST /admin/v1/community/reels/{id}/archive',
  'POST /admin/v1/community/reels/{id}/publish',
  'POST /admin/v1/community/reels/{id}/unpublish',
  'POST /admin/v1/dev/fixture-accounts',
  'POST /admin/v1/dev/fixture-accounts/revoke-partner-roles',
  'POST /admin/v1/dev/retire-dev-test-partners',
  'POST /admin/v1/expert-bookings/{id}/confirm',
  'POST /admin/v1/experts/{id}/slots',
  'POST /admin/v1/garage/orgs/{orgId}/credits/adjust',
  'POST /admin/v1/garage/orgs/{orgId}/dev-location',
  'POST /admin/v1/garage/orgs/{orgId}/free-bids/adjust',
  'POST /admin/v1/garage/orgs/{orgId}/passes/grant',
  'POST /admin/v1/garage/orgs/{orgId}/publish-store',
  'POST /admin/v1/garage/provision',
  'POST /admin/v1/ownership-claims/{id}/review',
  'POST /admin/v1/ownership-transfers',
  'POST /admin/v1/ownership-transfers/{id}/approve',
  'POST /admin/v1/partner-reorders/{id}/fulfil',
  'POST /admin/v1/plans',
  'POST /admin/v1/promos',
  'POST /admin/v1/qr-auto-detach-sweep',
  'POST /admin/v1/qr-batches',
  'POST /admin/v1/qr-batches/{id}/distribute',
  'POST /admin/v1/qr-batches/{id}/generate',
  'POST /admin/v1/qr-batches/{id}/provision',
  'POST /admin/v1/qr/{code}/replace',
  'POST /admin/v1/qr/{code}/retire',
  'POST /admin/v1/services/ras/requests/{id}/transition',
  'POST /admin/v1/settlement-batch',
  'POST /admin/v1/skus',
  'POST /admin/v1/taxi/policy/publish',
  'POST /admin/v1/taxi/provision',
  'PUT /admin/v1/experts',
  'PUT /admin/v1/experts/{id}/session-types',
  'PUT /admin/v1/garage/commercial-config',
  'PUT /admin/v1/services/providers',
  'PUT /admin/v1/taxi/policy',
] as const;

export type NestOaAdminRoute = (typeof NEST_OA_ADMIN_ROUTES)[number];

/**
 * Hermetic specs whose primary Nest calls are on live Dev OA.
 * Hermetics mock HTTP — they do not prove Live OPERATOR/step_up.
 */
export const OA_SUPPORTED_HERMETIC_SPECS = [
  'audit-events.hermetic.spec.ts',
  'break-glass.hermetic.spec.ts',
  'catalog-sku.hermetic.spec.ts',
  'discovery.hermetic.spec.ts',
  'finance.hermetic.spec.ts',
  'garage-commercial.hermetic.spec.ts',
  'orders-list.hermetic.spec.ts',
  'ownership-claims.hermetic.spec.ts',
  'ownership-transfer.hermetic.spec.ts',
  'partner-reorder-fulfil.hermetic.spec.ts',
  'payments.hermetic.spec.ts',
  'promos.hermetic.spec.ts',
  'qr-batches.hermetic.spec.ts',
  'qr-replace-retire.hermetic.spec.ts',
  'services-catalogue.hermetic.spec.ts',
  'shipments-list.hermetic.spec.ts',
  'subscriptions.hermetic.spec.ts',
  'taxi-policy.hermetic.spec.ts',
  'users-lookup.hermetic.spec.ts',
] as const;

export type UnsupportedHermeticSpec = {
  file: string;
  missingContracts: readonly string[];
  skipReason: string;
};

/**
 * Specs quarantined for Live Dev contract truth.
 * G0-4 Absents and live-missing FE callers (support tickets) stay skipped —
 * hermetic mocks ≠ Live Supported.
 */
export const OA_UNSUPPORTED_HERMETIC_SPECS: readonly UnsupportedHermeticSpec[] = [
  {
    file: 'orders-refund.hermetic.spec.ts',
    missingContracts: ['POST /admin/v1/orders/{orderId}/refund'],
    skipReason:
      'G0-4: POST …/orders/{orderId}/refund KEEP DISABLED (absent from live Dev OA). GET list covered by orders-list — skipped ≠ passed.',
  },
  {
    file: 'shipments.hermetic.spec.ts',
    missingContracts: ['POST /admin/v1/shipments/{orderId}/status'],
    skipReason:
      'G0-4: POST …/shipments/{orderId}/status KEEP DISABLED (absent). GET list covered by shipments-list — skipped ≠ passed.',
  },
  {
    file: 'users-roles.hermetic.spec.ts',
    missingContracts: [
      'POST /admin/v1/users/{userId}/roles',
      'DELETE /admin/v1/users/{userId}/roles/{role}',
    ],
    skipReason:
      'G0-4: Role grant/revoke KEEP DISABLED (absent from live Dev OA). Directory lookup is covered by users-lookup — skipped ≠ passed.',
  },
  {
    file: 'support-tickets.hermetic.spec.ts',
    missingContracts: [
      'GET /admin/v1/support/tickets',
      'GET /admin/v1/support/tickets/{ticketId}',
      'PATCH /admin/v1/support/tickets/{ticketId}',
    ],
    skipReason:
      'Phase 11: /admin/v1/support/tickets* absent from live Dev OA. FE support callers exist — BE decision. Hermetic mock ≠ Live Supported.',
  },
] as const;

/** G0-4 Absents — KEEP DISABLED. Must never appear in NEST_OA_ADMIN_ROUTES. */
export const FE_AHEAD_ADMIN_PATHS_NOT_IN_NEST_OA = [
  'POST /admin/v1/orders/{orderId}/refund',
  'POST /admin/v1/shipments/{orderId}/status',
  'POST /admin/v1/users/{userId}/roles',
  'DELETE /admin/v1/users/{userId}/roles/{role}',
  'GET /admin/v1/qr-batches/{id}/codes/export',
] as const;

/**
 * Additional FE callers whose paths are absent from **live Dev** OA (not the G0-4 Absents).
 * Document for BE/product — do not invent Nest routes in FE.
 */
export const LIVE_DEV_MISSING_ADMIN_FE_CALLERS = [
  'GET /admin/v1/support/tickets',
  'GET /admin/v1/support/tickets/{ticketId}',
  'PATCH /admin/v1/support/tickets/{ticketId}',
] as const;

export function unsupportedSpecSkipReason(file: string): string | undefined {
  return OA_UNSUPPORTED_HERMETIC_SPECS.find((s) => s.file === file)?.skipReason;
}

/** Snapshot counts from live Dev OA used to author this matrix (Phase 11). */
export const NEST_OA_ADMIN_SNAPSHOT = {
  pathKeys: 327,
  ops: 386,
  adminMethodPathOps: 91,
  source: 'https://d1wpatcmpyt0pw.cloudfront.net/openapi.json',
  countedAt: '2026-10-26',
} as const;
