import type { LucideIcon } from 'lucide-react';

export interface GettingStartedStep {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  /** The final step is emphasised with a filled green marker. */
  highlight?: boolean;
}

export interface GettingStartedCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  headlineSuffix: string;
  subheadline: string;
  cta: {
    label: string;
    href: string;
  };
}
