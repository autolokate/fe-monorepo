import type { LucideIcon } from 'lucide-react';

export interface VideosCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  moreLabel: string;
  youtubeLabel: string;
  youtubeHref: string;
}

export interface FeaturedVideo {
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  duration: string;
  href: string;
}

export interface VideoItem {
  id: string;
  Icon: LucideIcon;
  title: string;
  duration: string;
  href: string;
}
