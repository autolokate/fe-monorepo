/**
 * Customer-facing plan names — internal slugs/tiers/API IDs stay unchanged.
 *
 * | Internal tier / slug | Display name    |
 * |----------------------|-----------------|
 * | SECURE / secure      | Protect         |
 * | SHIELD / shield      | Guardian        |
 * | SHIELD_PLUS          | Guardian Plus   |
 * | safe (retail QR)     | Safe Start      |
 */

export type PlanTierCode = 'SECURE' | 'SHIELD' | 'SHIELD_PLUS';
export type PlanSlug = 'secure' | 'shield' | 'shield-plus';

export const PLAN_DISPLAY_BY_TIER: Record<PlanTierCode, string> = {
  SECURE: 'Protect',
  SHIELD: 'Guardian',
  SHIELD_PLUS: 'Guardian Plus',
};

export const PLAN_DISPLAY_BY_SLUG: Record<PlanSlug, string> = {
  secure: 'Protect',
  shield: 'Guardian',
  'shield-plus': 'Guardian Plus',
};

export const SAFE_START_DISPLAY = 'Safe Start';

/** Legacy API/backend names — never shown to customers when display mapping exists. */
export const PLAN_LEGACY_NAMES: Record<PlanTierCode, string> = {
  SECURE: 'Secure',
  SHIELD: 'Shield',
  SHIELD_PLUS: 'Shield+',
};

const TIER_BY_COMPACT_KEY: Record<string, PlanTierCode> = {
  SECURE: 'SECURE',
  SHIELD: 'SHIELD',
  SHIELDPLUS: 'SHIELD_PLUS',
};

/**
 * Customer-facing name for a tier code, slug or legacy API name — the API spells
 * the top tier `SHIELD_PLUS`, `shield-plus`, `Shield+` and `SHIELD +`. Anything
 * unrecognised is returned unchanged.
 */
export function getPlanDisplayName(input: string): string {
  const key = input
    .toUpperCase()
    .replace(/\+/g, 'PLUS')
    .replace(/[^A-Z]/g, '');
  const tier = TIER_BY_COMPACT_KEY[key] as PlanTierCode | undefined;
  return tier ? PLAN_DISPLAY_BY_TIER[tier] : input;
}

export function planCtaLabel(slug: PlanSlug): string {
  return `Choose ${PLAN_DISPLAY_BY_SLUG[slug]}`;
}

export function planDetailsLabel(slug: PlanSlug): string {
  return `See what's included in ${PLAN_DISPLAY_BY_SLUG[slug]}`;
}
