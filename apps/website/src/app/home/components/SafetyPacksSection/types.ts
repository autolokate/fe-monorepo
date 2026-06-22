export type PlanFeatureState = "included" | "excluded";

export interface PlanFeature {
  label: string;
  description?: string;
  state: PlanFeatureState;
}

export type SafetyPlanVariant = "starter" | "shield" | "shieldPlus";

export interface SafetyPlan {
  id: string;
  variant: SafetyPlanVariant;
  tierLabel: string;
  popularBadge?: string;
  /** Small caps label above the plan title (e.g. Full Protection on Shield). */
  planCategory?: string;
  title: string;
  price: string;
  priceNote: string;
  features: PlanFeature[];
}

export interface SafetyPacksSectionCopy {
  eyebrow: string;
  headline: string;
  subheading: string;
  headerPill: string;
}
