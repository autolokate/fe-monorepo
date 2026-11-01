#!/usr/bin/env node
/**
 * Guards for the formerly product-blocked Admin ops. The be-integration backend now serves refund,
 * role grant/revoke, QR codes CSV export and support tickets, so their service wrappers must call the
 * real client (no fail-closed stub). Shipment status has NO backend route by design (shipments are a
 * read-only projection of paid orders) — no FE wrapper may call one.
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

const wired = [
  ['src/services/orders/orders-service.ts', /refundAdminOrder\(/],
  ['src/services/users/admin-users-service.ts', /grantUserRole\(/],
  ['src/services/users/admin-users-service.ts', /revokeUserRole\(/],
  ['src/services/qr-batches/qr-batch-codes-export-service.ts', /exportQrBatchCodesCsv\(/],
  ['src/services/support/support-service.ts', /updateAdminSupportTicketStatus\(/],
];
for (const [file, call] of wired) {
  const src = read(file);
  assert.match(src, call, `${file} must call ${call}`);
  assert.doesNotMatch(src, /throwAdminProductBlocked/, `${file} must not fail closed any more`);
}

const shipments = read('src/services/shipments/shipments-service.ts');
assert.doesNotMatch(shipments, /\/status|updateAdminShipmentStatus/);

const helper = read('src/platform/api/product-blocked.ts');
assert.match(helper, /admin_product_blocked/);

console.log(
  JSON.stringify(
    {
      ok: true,
      wired: [
        'POST /admin/v1/orders/{orderId}/refund',
        'POST /admin/v1/users/{userId}/roles',
        'DELETE /admin/v1/users/{userId}/roles/{role}',
        'GET /admin/v1/qr-batches/{id}/codes/export',
        'GET|PATCH /admin/v1/support/tickets*',
      ],
      noRouteByDesign: ['POST /admin/v1/shipments/{orderId}/status'],
    },
    null,
    2,
  ),
);
