import { Activity, Layers, ScanLine } from 'lucide-react';
import type { BlogArticle, BlogCopy } from './types';

export const BLOG_COPY: BlogCopy = {
  eyebrow: 'From the desk',
  headline: 'Articles and',
  headlineAccent: 'notes.',
  subheading: 'Plain-language guides on safety, plans and the product',
  readLabel: 'Read the article',
  indexLabel: 'Read more on the blog',
  indexHref: '/blog',
};

/**
 * Articles link to the closest existing page until a dedicated blog is wired.
 * Titles, categories and topics match the redesign media lineup.
 */
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'choosing-plan',
    Icon: Layers,
    category: 'Guide',
    title: 'Choosing the right plan for your vehicle',
    excerpt: 'A plain-language walk through the plans',
    href: '/pricing',
  },
  {
    id: 'first-hour',
    Icon: Activity,
    category: 'Safety',
    title: 'The first hour after a crash, minute by minute',
    excerpt: 'Why response speed changes outcomes on Indian roads',
    href: '/emergency-safety',
  },
  {
    id: 'smart-qr-privacy',
    Icon: ScanLine,
    category: 'Product',
    title: 'Smart QR: what a stranger can and can’t see',
    excerpt: 'How privacy-first scanning actually works',
    href: '/how-it-works',
  },
];
