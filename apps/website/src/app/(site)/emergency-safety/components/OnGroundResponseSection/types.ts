import type { LucideIcon } from 'lucide-react';

export interface ResponseCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  footnote: string;
}

export interface ResponseSource {
  title: string;
  body: string;
  Icon: LucideIcon;
}

export interface ResponseBranch {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}
