import type { LucideIcon } from 'lucide-react';

export interface InsuranceCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  compareLink: {
    label: string;
    href: string;
  };
}

export interface InsuranceBenefit {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}
