#!/usr/bin/env node
/**
 * Validates purchase API client shapes against cached consumer OpenAPI.
 * Live E2E: set VERIFY_API_BASE_URL (or VITE_API_BASE_URL) when backend is up.
 */
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const OPENAPI_PATH = process.env.OPENAPI_PATH ?? '/tmp/live-openapi.json';

const API_BASE = (process.env.VERIFY_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '').replace(
  /\/$/,
  '',
);

function loadSpec() {
  return JSON.parse(readFileSync(OPENAPI_PATH, 'utf8'));
}

function schemaProps(spec, name) {
  const schema = spec.components.schemas[name];
  if (!schema?.properties) {
    return { required: schema?.required ?? [], properties: {} };
  }
  return {
    required: schema.required ?? [],
    properties: Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [key, value.type ?? 'object']),
    ),
  };
}

function assertShape(label, actual, expected) {
  const actualKeys = Object.keys(actual.properties).sort();
  const expectedKeys = Object.keys(expected.properties).sort();
  const extra = actualKeys.filter((k) => !expectedKeys.includes(k));
  const missing = expectedKeys.filter((k) => !actualKeys.includes(k));
  if (extra.length || missing.length) {
    console.error(`FAIL ${label}`);
    if (missing.length) console.error('  missing keys:', missing.join(', '));
    if (extra.length) console.error('  extra keys (not in OpenAPI):', extra.join(', '));
    return false;
  }
  console.log(`PASS ${label}: keys match OpenAPI — ${actualKeys.join(', ')}`);
  return true;
}

async function probeLive(baseUrl) {
  console.log(`\n--- Live probe: ${baseUrl} ---`);
  const headers = { 'ngrok-skip-browser-warning': 'true', Accept: 'application/json' };

  async function request(method, path, options = {}) {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: { ...headers, ...(options.headers ?? {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      // non-json
    }
    return { url, method, status: response.status, json, text: text.slice(0, 300) };
  }

  const resolve = await request('GET', '/v1/qr/ALK-7Q2K9F/resolve');
  console.log(
    'GET resolve',
    resolve.status,
    resolve.json?.data ? Object.keys(resolve.json.data) : resolve.text,
  );

  if (!resolve.json?.data) {
    console.log('Live probe stopped — backend unreachable or non-envelope response.');
    return false;
  }

  const paySchema = schemaProps(loadSpec(), 'PaymentRefDto');
  console.log('OpenAPI PaymentRefDto required:', paySchema.required.join(', '));

  return true;
}

const spec = loadSpec();
let ok = true;

ok &= assertShape(
  'PaymentRefDto (api-client)',
  { properties: { paymentRef: 'string', providerOrderId: 'string', razorpayKeyId: 'string' } },
  schemaProps(spec, 'PaymentRefDto'),
);

ok &= assertShape(
  'CreateOrderBodyDto (api-client)',
  { properties: { cartId: 'string' } },
  schemaProps(spec, 'CreateOrderBodyDto'),
);

ok &= assertShape(
  'CreateCartBodyDto (api-client)',
  { properties: { code: 'string', planId: 'string', riderCount: 'number', promoCode: 'string' } },
  schemaProps(spec, 'CreateCartBodyDto'),
);

ok &= assertShape(
  'CartDto (api-client)',
  {
    properties: {
      cartId: 'string',
      planPricePaise: 'number',
      riderCoverPaise: 'number',
      subtotalPaise: 'number',
      gstPaise: 'number',
      discountPaise: 'number',
      totalPaise: 'number',
      appliedPromoCode: 'string',
      expiresAt: 'string',
    },
  },
  schemaProps(spec, 'CartDto'),
);

ok &= assertShape(
  'OrderDto (api-client)',
  {
    properties: {
      orderId: 'string',
      subtotalPaise: 'number',
      gstPaise: 'number',
      discountPaise: 'number',
      totalPaise: 'number',
      appliedPromoCode: 'string',
      status: 'string',
    },
  },
  schemaProps(spec, 'OrderDto'),
);

ok &= assertShape(
  'ValidatePromoBodyDto (api-client)',
  { properties: { code: 'string', planTier: 'string', riderCount: 'number', promoCode: 'string' } },
  schemaProps(spec, 'ValidatePromoBodyDto'),
);

ok &= assertShape(
  'PromoPreviewDto (api-client)',
  {
    properties: {
      promoCode: 'string',
      subtotalPaise: 'number',
      gstPaise: 'number',
      discountPaise: 'number',
      totalPaise: 'number',
    },
  },
  schemaProps(spec, 'PromoPreviewDto'),
);

ok &= assertShape(
  'PayOrderBodyDto (api-client)',
  { properties: { setupMandate: 'boolean', mandateConsent: 'boolean' } },
  schemaProps(spec, 'PayOrderBodyDto'),
);

ok &= assertShape(
  'ConsumerAttachBodyDto (api-client)',
  { properties: { registration: 'string' } },
  schemaProps(spec, 'ConsumerAttachBodyDto'),
);

console.log(`\nIdempotency-Key sample: ${randomUUID()}`);

if (API_BASE) {
  const live = await probeLive(API_BASE);
  ok &= live;
} else {
  console.log('\nSet VERIFY_API_BASE_URL to run live network verification.');
}

process.exit(ok ? 0 : 1);
