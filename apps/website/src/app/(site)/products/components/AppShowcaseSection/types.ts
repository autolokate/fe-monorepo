import type { LucideIcon } from 'lucide-react';

export interface SectionHeaderCopy {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  subheading: string;
}

export interface AppCapability {
  id: string;
  /** Emphasised lead-in of the capability line. */
  label: string;
  /** Trailing detail, rendered in a muted tone. */
  detail: string;
  Icon: LucideIcon;
}

export interface AppCta {
  label: string;
  href: string;
}

export interface AppTile {
  id: string;
  name: string;
  audience: string;
  /** Brand app icon, exported from Figma. */
  iconSrc: string;
  capabilities: AppCapability[];
  cta: AppCta;
}
