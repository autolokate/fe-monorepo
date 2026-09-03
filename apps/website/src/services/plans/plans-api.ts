'use client';

import { endpoints } from '@/lib/api/endpoints';
import { readArray, readObject, unbox } from '@/lib/catalogue/normalize';
import { ApiService } from '@/services/api.service';

/** Default catalogue SKU the marketing site sells. */
export const DEFAULT_PLANS_SKU = 'SKU-B2C-RETAIL';

export type PlanTier = 'SECURE' | 'SHIELD' | 'SHIELD_PLUS';
export type PlanPeriod = 'YEARLY' | 'MONTHLY';

export interface PlanRiderOption {
  riderCount: number;
  pricePaise: number;
  originalPricePaise: number;
  discountPercent: number;
}

/** A single protection plan as returned by `GET /v1/plans`. Money is in paise. */
export interface Plan {
  id: string;
  tier: string;
  version: number;
  name: string;
  pricePaise: number;
  period: string;
  riderEligible: boolean;
  features: string[];
  badge: string | null;
  includesLabel: string | null;
  riderOptions: PlanRiderOption[];
}

function numeric(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** Read a loosely-typed row field as a string, falling back when it isn't one. */
function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeRiderOption(raw: unknown): PlanRiderOption {
  const row = readObject(raw);
  return {
    riderCount: numeric(row.riderCount),
    pricePaise: numeric(row.pricePaise),
    originalPricePaise: numeric(row.originalPricePaise),
    discountPercent: numeric(row.discountPercent),
  };
}

function normalizePlan(raw: unknown): Plan {
  const row = readObject(raw);
  return {
    id: stringOr(row.id, ''),
    tier: stringOr(row.tier, '').trim(),
    version: numeric(row.version, 1),
    name: stringOr(row.name, '').trim(),
    pricePaise: numeric(row.pricePaise),
    period: stringOr(row.period, 'YEARLY').trim(),
    riderEligible: Boolean(row.riderEligible),
    features: Array.isArray(row.features)
      ? (row.features as unknown[]).map((f) => String(f)).filter(Boolean)
      : [],
    badge: stringOrNull(row.badge),
    includesLabel: stringOrNull(row.includesLabel),
    riderOptions: Array.isArray(row.riderOptions)
      ? (row.riderOptions as unknown[]).map(normalizeRiderOption)
      : [],
  };
}

/**
 * Shares one in-flight request per SKU across concurrent callers. React
 * StrictMode (dev) fires the query effect twice on mount, so without this we'd
 * hit `/v1/plans` twice; each entry clears once it settles so later reads are
 * fresh.
 */
const plansInFlight = new Map<string, Promise<Plan[]>>();

/**
 * GET /v1/plans?sku=… — the protection plans shown on Home and Pricing.
 * Public endpoint (no auth). Prices come back in paise.
 */
export function getPlans(sku: string = DEFAULT_PLANS_SKU): Promise<Plan[]> {
  const existing = plansInFlight.get(sku);
  if (existing) return existing;

  const request = (async () => {
    try {
      const res = await ApiService.get(endpoints.plans.list(sku), {
        withAuth: false,
      });
      const rows = readArray<unknown>(unbox(res.data));
      return rows.map(normalizePlan);
    } finally {
      plansInFlight.delete(sku);
    }
  })();

  plansInFlight.set(sku, request);
  return request;
}
