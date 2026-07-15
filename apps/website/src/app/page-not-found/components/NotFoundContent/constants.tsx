import { BarChart3, Car, Home, Play, QrCode, type LucideIcon } from 'lucide-react';

export const NOT_FOUND_BACKGROUND = '/images/shop/not_found_page.png';

export const NOT_FOUND_COPY = {
  code: '404',
  headline: 'Road not found.',
  description:
    "Looks like this route took a wrong turn. The page you're looking for may have moved, been removed, or doesn't exist.",
  statusTitle: 'Your vehicle is safe.',
  statusBody: "This page just isn't here.",
  primaryCta: { label: 'Back to Home', href: '/' },
  secondaryCta: { label: 'Explore Autolokate', href: '/explore' },
  quickLinksTitle: 'Quick Links',
  supportText: "Need help? Contact our team and we'll get you back on track.",
  contactCta: { label: 'Contact Us', href: '/contact-us' },
} as const;

export interface NotFoundQuickLink {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
}

export const NOT_FOUND_QUICK_LINKS: NotFoundQuickLink[] = [
  { id: 'about-us', label: 'About Us', href: '/about-us', Icon: Home },
  { id: 'how-it-works', label: 'How It Works', href: '/how-it-works', Icon: QrCode },
  { id: 'explore-cars', label: 'Explore Cars', href: '/cars/explore', Icon: Car },
  { id: 'compare-cars', label: 'Compare Cars', href: '/cars/compare', Icon: BarChart3 },
  { id: 'media', label: 'Media', href: '/media', Icon: Play },
];
