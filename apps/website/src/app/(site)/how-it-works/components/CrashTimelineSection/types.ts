import type { LucideIcon } from 'lucide-react';

export type TimelineTone = 'brand' | 'warn';

export interface TimelineStep {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  tone: TimelineTone;
}

export interface CrashTimelineCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheadingLines: string[];
  callout: string;
}
