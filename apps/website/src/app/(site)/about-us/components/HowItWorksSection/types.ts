import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export interface CrashToCareStep {
  id: string;
  step: number;
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
  /** Subtle emphasis for the key moment in the flow (e.g. SOS activation). */
  highlighted?: boolean;
}

export interface CrashToCareSectionCopy {
  eyebrow: string;
  headline: string;
  subheading: string;
}
