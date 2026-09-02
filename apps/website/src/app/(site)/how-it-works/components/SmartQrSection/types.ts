import type { LucideIcon } from 'lucide-react';

export interface QrJourneyStep {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export interface SmartQrCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  callout: string;
}
