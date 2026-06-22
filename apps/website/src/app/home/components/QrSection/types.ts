import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface QrFeature {
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
}

export interface QrSectionCopy {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  subheading: string;
  primaryCta: { label: string; href: string };
}
