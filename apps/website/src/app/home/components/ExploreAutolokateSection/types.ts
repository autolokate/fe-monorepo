import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface ExploreServiceCard {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  backgroundImage: string;
  Icon: ComponentType<LucideProps>;
}

export interface ExploreAutolokateSectionCopy {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
}
