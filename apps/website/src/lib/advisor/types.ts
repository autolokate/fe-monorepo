export interface AdvisorOption {
  id: string;
  label: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface AdvisorStep {
  step_id: string;
  order: number;
  question: string;
  multi_select: boolean;
  options: AdvisorOption[];
}

export interface AdvisorConversation {
  id: string;
  user_id: string;
  vehicle_category: string;
  title: string;
  summary: string | null;
  status: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  current_step: number;
}

export interface AdvisorAnswerEntry {
  step_id: string;
  selected_option_ids: string[];
  /** Filled when the user selects in-app — same order as ids. */
  display_labels?: string[];
}

/** Matches `CreateConversationDto.vehicle_category` on the backend. */
export type AdvisorVehicleCategory = "car" | "bike" | "scooter";

/** Card shape rendered by the home matched-cars grid. */
export interface AdvisorMatchCard {
  id: string;
  title: string;
  subtitle: string;
  variantLine: string | null;
  imageUrl: string | null;
  imageAlt: string;
  priceLabel: string;
  score: number | null;
  mileageKmpl: number | null;
  href: string | null;
  reasons: string[];
  sortPriceMin: number;
  sortPriceMax: number;
  /** Catalogue variant UUID — useful when wiring `/v1/catalogue/compare`. */
  catalogueVariantId: string | null;
}

/** Captured during the wizard so other sections can summarise quick state. */
export interface PromptSnapshot {
  city: string;
  body: string;
  fuel: string;
  budget: string;
}
