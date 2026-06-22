export interface FeaturedVideosSectionCopy {
  eyebrow: string;
  headline: string;
  description: string;
  channelName: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface FeaturedVideo {
  id: string;
  videoId: string;
  title: string;
  summary: string;
  category: string;
  thumbnailLabel: string;
  duration?: string;
  href: string;
}
