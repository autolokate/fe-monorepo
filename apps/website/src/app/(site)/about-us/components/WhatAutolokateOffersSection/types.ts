import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface OfferFeature {
  id: string;
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
}

export interface PartnerCategory {
  id: string;
  label: string;
  Icon: ComponentType<LucideProps>;
}

export interface OffersSectionCopy {
  eyebrow: string;
  headline: string;
}

export interface PartnerBannerCopy {
  eyebrow: string;
  headline: string;
  body: string;
}
