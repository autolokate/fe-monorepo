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
  headlinePrefix: string;
  headlineEmphasis: string;
  headlineSuffix: string;
  description: string;
}
