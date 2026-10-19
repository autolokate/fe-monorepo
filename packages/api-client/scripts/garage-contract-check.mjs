import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const endpointsSrc = readFileSync(join(root, 'src/endpoints.ts'), 'utf8');
assert.match(endpointsSrc, /garageCommercialConfig:\s*'\/admin\/v1\/garage\/commercial-config'/);
assert.match(
  endpointsSrc,
  /garageCommercialConfigHistory:\s*'\/admin\/v1\/garage\/commercial-config\/history'/,
);
assert.match(endpointsSrc, /garageOrgPassGrant:/);
assert.match(endpointsSrc, /garageOrgFreeBidsAdjust:/);

const garageSrc = readFileSync(join(root, 'src/garage.ts'), 'utf8');
assert.match(garageSrc, /export async function getGarageCommercialConfig/);
assert.match(garageSrc, /export async function updateGarageCommercialConfig/);
assert.match(garageSrc, /export async function grantGaragePass/);
assert.match(garageSrc, /export async function adjustGarageFreeBids/);
assert.match(garageSrc, /freeBidLifetimeCount/);
assert.match(garageSrc, /endpoints\.admin\.garageCommercialConfig/);

const indexSrc = readFileSync(join(root, 'src/index.ts'), 'utf8');
assert.match(indexSrc, /getGarageCommercialConfig/);
assert.match(indexSrc, /updateGarageCommercialConfig/);

const openapiPaths = [
  '/Users/kapil/autolokate/be-monorepo-garage-dev-integration/apps/api/openapi.json',
  '/Users/kapil/autolokate/be-monorepo/apps/api/openapi.json',
];
let openapi = null;
for (const p of openapiPaths) {
  try {
    openapi = JSON.parse(readFileSync(p, 'utf8'));
    break;
  } catch {
    /* try next */
  }
}
assert.ok(openapi, 'OpenAPI JSON not found in known BE paths');
const schema = openapi.components.schemas.GarageCommercialConfigDto;
assert.ok(schema.required.includes('freeBidLifetimeCount'));
assert.equal(
  openapi.paths['/admin/v1/garage/commercial-config'].get.operationId,
  'getGarageCommercialConfig',
);
assert.equal(
  openapi.paths['/admin/v1/garage/commercial-config'].put.operationId,
  'updateGarageCommercialConfig',
);
assert.ok(openapi.paths['/admin/v1/garage/orgs/{orgId}/passes/grant']);
assert.ok(openapi.paths['/admin/v1/garage/orgs/{orgId}/free-bids/adjust']);

// Drift note (Batch C): present in OpenAPI, intentionally NOT in api-client/Admin UI.
const unwiredAdminGarage = [
  '/admin/v1/garage/orgs/{orgId}/credits/adjust',
  '/admin/v1/garage/provision',
];
for (const path of unwiredAdminGarage) {
  assert.ok(openapi.paths[path], `expected OpenAPI path ${path}`);
  assert.doesNotMatch(endpointsSrc, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(garageSrc, /adjustGarageCredits|provisionGaragePartner/);
}

console.log('garage commercial-config OpenAPI + api-client contract check OK');
console.log('OpenAPI drift (documented, unwired):', unwiredAdminGarage.join(', '));
