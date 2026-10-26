#!/usr/bin/env node
/**
 * Phase 11 invariants for admin-oa-smoke-matrix.ts (no Playwright, no Live mutations).
 * Run: node apps/admin/e2e/helpers/admin-oa-smoke-matrix.invariants.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const matrixPath = join(here, 'admin-oa-smoke-matrix.ts');
const src = readFileSync(matrixPath, 'utf8');

function extractStringArray(constName) {
  const re = new RegExp(`export const ${constName} = \\[([\\s\\S]*?)\\] as const;`);
  const m = src.match(re);
  if (!m) throw new Error(`missing array ${constName}`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

const errors = [];
const routes = extractStringArray('NEST_OA_ADMIN_ROUTES');
const supported = extractStringArray('OA_SUPPORTED_HERMETIC_SPECS');
const ahead = extractStringArray('FE_AHEAD_ADMIN_PATHS_NOT_IN_NEST_OA');
const liveMissing = extractStringArray('LIVE_DEV_MISSING_ADMIN_FE_CALLERS');

const expectedBlocked = [
  'POST /admin/v1/orders/{orderId}/refund',
  'POST /admin/v1/shipments/{orderId}/status',
  'POST /admin/v1/users/{userId}/roles',
  'DELETE /admin/v1/users/{userId}/roles/{role}',
  'GET /admin/v1/qr-batches/{id}/codes/export',
];

const presentMustBeInRoutes = [
  'GET /admin/v1/plans',
  'POST /admin/v1/plans',
  'GET /admin/v1/orders',
  'GET /admin/v1/orders/{orderId}',
  'GET /admin/v1/shipments',
  'GET /admin/v1/shipments/{orderId}',
  'GET /admin/v1/subscriptions',
  'GET /admin/v1/payments',
  'GET /admin/v1/audit-events',
  'POST /admin/v1/expert-bookings/{id}/confirm',
  'POST /admin/v1/qr-batches',
  'POST /admin/v1/qr-batches/{id}/generate',
  'POST /admin/v1/qr-batches/{id}/provision',
  'POST /admin/v1/qr-batches/{id}/distribute',
  'GET /admin/v1/qr-batches/{id}/codes',
  'GET /admin/v1/skus',
  'POST /admin/v1/skus',
  'PATCH /admin/v1/skus/{skuId}',
  'GET /admin/v1/users',
  'GET /admin/v1/users/{userId}',
  'GET /admin/v1/community/questions',
  'GET /admin/v1/community/reels',
];

const mustNotBeInRoutes = [
  ...expectedBlocked,
  'GET /admin/v1/support/tickets',
  'POST /admin/v1/experts/bookings/{id}/confirm',
];

const expectedSupported = [
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
  'shipments-list.hermetic.spec.ts',
  'subscriptions.hermetic.spec.ts',
  'taxi-policy.hermetic.spec.ts',
  'users-lookup.hermetic.spec.ts',
];

if (routes.length !== 91) {
  errors.push(`NEST_OA_ADMIN_ROUTES length ${routes.length} ≠ 91 (live Dev OA)`);
}
if (new Set(routes).size !== routes.length) {
  errors.push('NEST_OA_ADMIN_ROUTES has duplicates');
}
if (JSON.stringify(supported) !== JSON.stringify(expectedSupported)) {
  errors.push(
    `OA_SUPPORTED_HERMETIC_SPECS mismatch (got ${supported.length}, expected ${expectedSupported.length})`,
  );
}
if (ahead.length !== 5) {
  errors.push(`FE_AHEAD length ${ahead.length} ≠ 5`);
}
if (liveMissing.length === 0) {
  errors.push('LIVE_DEV_MISSING_ADMIN_FE_CALLERS is empty');
}
for (const p of liveMissing) {
  if (routes.includes(p))
    errors.push(`Live-missing FE caller is now in NEST_OA_ADMIN_ROUTES: ${p}`);
}
for (const b of expectedBlocked) {
  if (!ahead.includes(b)) errors.push(`FE_AHEAD missing blocked ${b}`);
  if (routes.includes(b))
    errors.push(`blocked op incorrectly listed in NEST_OA_ADMIN_ROUTES: ${b}`);
}
for (const extra of ahead) {
  if (!expectedBlocked.includes(extra)) errors.push(`FE_AHEAD unexpected entry ${extra}`);
}
for (const p of presentMustBeInRoutes) {
  if (!routes.includes(p)) errors.push(`Present Nest op missing from NEST_OA_ADMIN_ROUTES: ${p}`);
  if (ahead.includes(p)) errors.push(`Present Nest op falsely listed as FE_AHEAD: ${p}`);
}
for (const p of mustNotBeInRoutes) {
  if (routes.includes(p)) errors.push(`Live-absent/stale path still in NEST_OA_ADMIN_ROUTES: ${p}`);
}

const e2eDir = join(here, '..');
const stillSkipped = [
  'orders-refund.hermetic.spec.ts',
  'shipments.hermetic.spec.ts',
  'users-roles.hermetic.spec.ts',
  'support-tickets.hermetic.spec.ts',
];
for (const file of stillSkipped) {
  const body = readFileSync(join(e2eDir, file), 'utf8');
  if (!body.includes('test.describe.skip')) {
    errors.push(`${file} lost test.describe.skip (must stay skipped vs live Dev OA)`);
  }
}
const mustRun = [
  'orders-list.hermetic.spec.ts',
  'shipments-list.hermetic.spec.ts',
  'payments.hermetic.spec.ts',
  'audit-events.hermetic.spec.ts',
  'qr-batches.hermetic.spec.ts',
  'catalog-sku.hermetic.spec.ts',
  'discovery.hermetic.spec.ts',
  'users-lookup.hermetic.spec.ts',
];
for (const file of mustRun) {
  const body = readFileSync(join(e2eDir, file), 'utf8');
  if (body.includes('test.describe.skip')) {
    errors.push(`${file} still has describe.skip (live Dev Present contract)`);
  }
}

if (!src.includes('pathKeys: 327') || !src.includes('adminMethodPathOps: 91')) {
  errors.push('NEST_OA_ADMIN_SNAPSHOT must record live Dev 327 paths / 91 admin ops');
}

if (errors.length) {
  console.error('admin-oa-smoke-matrix invariants FAILED:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log('admin-oa-smoke-matrix invariants OK');
console.log(`  NEST_OA_ADMIN_ROUTES=${routes.length}`);
console.log(`  OA_SUPPORTED_HERMETIC_SPECS=${supported.length}`);
console.log(`  FE_AHEAD_ADMIN_PATHS_NOT_IN_NEST_OA=${ahead.length}`);
console.log(`  LIVE_DEV_MISSING_ADMIN_FE_CALLERS=${liveMissing.length}`);
console.log('  G0-4 Absents + live-missing FE callers stay describe.skip');
