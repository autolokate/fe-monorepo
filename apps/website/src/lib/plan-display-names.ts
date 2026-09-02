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

export function getPlanDisplayName(input: string): string {
  if (input in PLAN_DISPLAY_BY_TIER) {
    return PLAN_DISPLAY_BY_TIER[input as PlanTierCode];
  }
  if (input in PLAN_DISPLAY_BY_SLUG) {
    return PLAN_DISPLAY_BY_SLUG[input as PlanSlug];
  }
  return input;
}

export function planCtaLabel(slug: PlanSlug): string {
  return `Choose ${PLAN_DISPLAY_BY_SLUG[slug]}`;
}

export function planDetailsLabel(slug: PlanSlug): string {
  return `See what's included in ${PLAN_DISPLAY_BY_SLUG[slug]}`;
}
