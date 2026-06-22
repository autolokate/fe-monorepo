import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface WhyHighlight {
  id: string;
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
}

export interface WhyAutolokateSectionCopy {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
}
