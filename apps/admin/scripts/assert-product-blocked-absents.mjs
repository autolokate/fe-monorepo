#!/usr/bin/env node
/**
 * Phase 11: G0-4 Absent Admin service wrappers must fail closed (no network imports of mutate APIs).
 * Run: node apps/admin/scripts/assert-product-blocked-absents.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

const orders = read('src/services/orders/orders-service.ts');
assert.match(orders, /throwAdminProductBlocked/);
assert.doesNotMatch(orders, /refundAdminOrder\(/);

const shipments = read('src/services/shipments/shipments-service.ts');
assert.match(shipments, /throwAdminProductBlocked/);
assert.doesNotMatch(shipments, /updateAdminShipmentStatus\(/);

const users = read('src/services/users/admin-users-service.ts');
assert.match(users, /throwAdminProductBlocked/);
assert.doesNotMatch(users, /grantUserRole\(/);
assert.doesNotMatch(users, /revokeUserRole\(/);

const qr = read('src/services/qr-batches/qr-batch-service.ts');
assert.match(qr, /throwAdminProductBlocked/);
assert.doesNotMatch(qr, /distributeQrBatch\(/);

const exportCsv = read('src/services/qr-batches/qr-batch-codes-export-service.ts');
assert.match(exportCsv, /throwAdminProductBlocked/);
assert.doesNotMatch(exportCsv, /exportQrBatchCodesCsv\(/);

const helper = read('src/platform/api/product-blocked.ts');
assert.match(helper, /admin_product_blocked/);
assert.match(helper, /501/);

console.log(
  JSON.stringify(
    {
      ok: true,
      absentsFailClosed: [
        'POST /admin/v1/orders/{orderId}/refund',
        'POST /admin/v1/shipments/{orderId}/status',
        'POST /admin/v1/users/{userId}/roles',
        'DELETE /admin/v1/users/{userId}/roles/{role}',
        'POST /admin/v1/qr-batches/{id}/distribute',
        'GET /admin/v1/qr-batches/{id}/codes/export',
      ],
    },
    null,
    2,
  ),
);
