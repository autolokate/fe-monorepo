import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface HowItWorksStep {
  id: string;
  step: number;
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
}

export interface HowItWorksSectionCopy {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
}
