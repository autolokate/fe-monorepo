"use client";

import { endpoints } from "@/lib/api/endpoints";
import { readArray, unbox } from "@/lib/catalogue/normalize";
import { ApiService } from "@/services/api.service";

type Envelope<T> = { success?: boolean; data?: T };

export type TcoBreakdown = {
  variant_id: string;
  city: string;
  years: number;
  km_per_year: number;
  purchase_price: number;
  fuel_cost: number;
  insurance_cost: number;
  maintenance_cost: number;
  depreciation: number;
  total_cost: number;
  cost_per_km: number;
};

export type EmiQuote = {
  principal: number;
  rate: number;
  tenure_months: number;
  monthly_emi: number;
  total_interest: number;
  total_payable: number;
};

export type ResaleEstimate = {
  variant_id: string;
  year: number;
  estimated_value: number;
  depreciation_pct: number;
};

export async function getTco(
  variantId: string,
  city: string,
  options?: { signal?: AbortSignal },
): Promise<TcoBreakdown> {
  const res = await ApiService.get<Envelope<TcoBreakdown>>(
    endpoints.prices.tco(variantId, city),
    { withAuth: false, signal: options?.signal },
  );
  return unbox(res.data) as TcoBreakdown;
}

export async function getEmiQuote(params: {
  principal: number;
  rate: number;
  tenure_months: number;
}): Promise<EmiQuote> {
  const q = new URLSearchParams({
    principal: String(params.principal),
    rate: String(params.rate),
    tenure_months: String(params.tenure_months),
  });
  const res = await ApiService.get<Envelope<EmiQuote>>(
    `${endpoints.prices.emi}?${q.toString()}`,
    { withAuth: false },
  );
  return unbox(res.data) as EmiQuote;
}

export async function getResaleEstimate(
  variantId: string,
  params: { year: number },
): Promise<ResaleEstimate> {
  const q = new URLSearchParams({ year: String(params.year) });
  const res = await ApiService.get<Envelope<ResaleEstimate>>(
    `${endpoints.prices.resale(variantId)}?${q.toString()}`,
    { withAuth: false },
  );
  return unbox(res.data) as ResaleEstimate;
}

export async function getEvSubsidies(): Promise<unknown[]> {
  const res = await ApiService.get<Envelope<unknown>>(
    endpoints.prices.evSubsidies,
    { withAuth: false },
  );
  return readArray(unbox(res.data));
}

export async function getFuelPrices(
  city: string,
  params?: { fuel_type?: string },
): Promise<unknown[]> {
  const q = new URLSearchParams({ city });
  if (params?.fuel_type) q.set("fuel_type", params.fuel_type);
  const res = await ApiService.get<Envelope<unknown>>(
    `${endpoints.prices.fuel}?${q.toString()}`,
    { withAuth: false },
  );
  return readArray(unbox(res.data));
}

export async function getFuelPriceHistory(
  city: string,
  params?: { from?: string; to?: string; fuel_type?: string },
): Promise<unknown[]> {
  const q = new URLSearchParams({ city });
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  if (params?.fuel_type) q.set("fuel_type", params.fuel_type);
  const res = await ApiService.get<Envelope<unknown>>(
    `${endpoints.prices.fuelHistory}?${q.toString()}`,
    { withAuth: false },
  );
  return readArray(unbox(res.data));
}
