'use client';

import { endpoints } from '@/lib/api/endpoints';
import { ApiService } from '@/services/api.service';
import { readObject, toStr, unbox } from '@/lib/catalogue/normalize';

type Envelope<T> = { success?: boolean; data?: T };

export type TaxonomySpecRow = {
  canonical_key: string;
  display_name: string;
  spec_group: string;
};

export type TaxonomyFeatureRow = {
  canonical_key: string;
  display_name: string;
  feature_group: string;
};

export type TaxonomyBundle = {
  specs: TaxonomySpecRow[];
  features: TaxonomyFeatureRow[];
};

function normalizeSpec(raw: unknown): TaxonomySpecRow {
  const row = readObject(raw);
  return {
    canonical_key: toStr(row.canonical_key ?? row.key).trim(),
    display_name: toStr(row.display_name).trim(),
    spec_group: row.spec_group != null ? toStr(row.spec_group).trim() : 'other',
  };
}

function normalizeFeature(raw: unknown): TaxonomyFeatureRow {
  const row = readObject(raw);
  return {
    canonical_key: toStr(row.canonical_key ?? row.key).trim(),
    display_name: toStr(row.display_name).trim(),
    feature_group: row.feature_group != null ? toStr(row.feature_group).trim() : 'other',
  };
}

function parseBundle(payload: unknown): TaxonomyBundle {
  const root = readObject(unbox(payload));
  const specsRaw = root.specs;
  const featuresRaw = root.features;
  const specs = Array.isArray(specsRaw) ? specsRaw.map(normalizeSpec) : [];
  const features = Array.isArray(featuresRaw) ? featuresRaw.map(normalizeFeature) : [];
  return { specs, features };
}

/** GET /v1/taxonomy?category=car — canonical labels for specs/features. */
export async function getTaxonomy(params?: { category?: string }): Promise<TaxonomyBundle> {
  const res = await ApiService.get<Envelope<unknown>>(endpoints.taxonomy.root(params?.category), {
    withAuth: false,
  });
  return parseBundle(res.data);
}
