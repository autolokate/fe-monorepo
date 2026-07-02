import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export interface GettingStartedStep {
  id: string;
  step: string;
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
}

export interface GettingStartedFeature {
  id: string;
  label: string;
  Icon: ComponentType<LucideProps>;
}

export interface GettingStartedCopy {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2Prefix: string;
  headlineEmphasis: string;
  headlineLine2Suffix: string;
  subheadline: string;
}

export interface ProtectionImageCard {
  id: string;
  kind: "image";
  step: string;
  title: string;
  body: string;
  image: { dark: string; light: string };
  /** Optional CSS background-position override (defaults to center). */
  imagePosition?: string;
}

export interface ProtectionCountdownCard {
  id: string;
  kind: "countdown";
  step: string;
  title: string;
  body: string;
  seconds: string;
  ringLabel: string;
  ringUnit: string;
}

export interface ProtectionNotifyCard {
  id: string;
  kind: "notify";
  step: string;
  title: string;
  body: string;
  alert: { title: string; detail: string; mapLine: string };
}

export type ProtectionCard =
  | ProtectionImageCard
  | ProtectionCountdownCard
  | ProtectionNotifyCard;

export interface ProtectionCopy {
  eyebrow: string;
  headlinePrefix: string;
  headlineEmphasis: string;
  headlineSuffix: string;
  footnote: {
    source: string;
    center: string;
  };
}
