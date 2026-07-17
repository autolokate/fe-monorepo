import type { LucideIcon } from 'lucide-react';

export interface BlogCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  readLabel: string;
  indexLabel: string;
  indexHref: string;
}

export interface BlogArticle {
  id: string;
  Icon: LucideIcon;
  category: string;
  title: string;
  excerpt: string;
  href: string;
}
