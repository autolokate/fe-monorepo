import type { LucideIcon } from 'lucide-react';

export interface EcosystemCopy {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  subheading: string;
  footnote: string;
  link: {
    label: string;
    href: string;
  };
}

export interface EcosystemAudience {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}
