import type { LucideIcon } from 'lucide-react';

export type TimelineTone = 'brand' | 'warn';

export interface TimelineStep {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  tone: TimelineTone;
  /** Short status chip shown on the active step card */
  badge?: string;
}

export interface CrashTimelineCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheadingLines: string[];
  callout: string;
}
