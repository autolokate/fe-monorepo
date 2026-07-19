export type PlanVariant = 'default' | 'hero';

interface PlanVisual {
  /** `hero` is the dark, emphasised card (e.g. Shield). */
  variant: PlanVariant;
  /** Tier glyph exported from Figma (served from /public). */
  iconSrc: string;
}

const ICON_BASE = '/purchase-journey/plans';

/** Per-tier presentation. Data (name, price, features, badge) comes from the API. */
const PLAN_VISUALS: Record<string, PlanVisual> = {
  SECURE: { variant: 'default', iconSrc: `${ICON_BASE}/tier-secure.svg` },
  SHIELD: { variant: 'hero', iconSrc: `${ICON_BASE}/tier-shield.svg` },
  SHIELD_PLUS: { variant: 'default', iconSrc: `${ICON_BASE}/tier-shield-plus.svg` },
};

const FALLBACK_VISUAL: PlanVisual = {
  variant: 'default',
  iconSrc: `${ICON_BASE}/tier-secure.svg`,
};

/** Display order of the plan cards, left → right. */
const PLAN_TIER_ORDER = ['SECURE', 'SHIELD', 'SHIELD_PLUS'];

export function getPlanVisual(tier: string): PlanVisual {
  return PLAN_VISUALS[tier.toUpperCase()] ?? FALLBACK_VISUAL;
}

/** Stable left→right ordering by tier, with unknown tiers appended in API order. */
export function planTierRank(tier: string): number {
  const index = PLAN_TIER_ORDER.indexOf(tier.toUpperCase());
  return index === -1 ? PLAN_TIER_ORDER.length : index;
}

/** Paise → "₹1,999" (whole rupees, Indian grouping). */
export function formatRupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;
}
