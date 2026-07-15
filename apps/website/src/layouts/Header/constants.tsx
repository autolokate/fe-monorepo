import type { SVGProps } from 'react';
import {
  Home,
  LayoutGrid,
  type LucideIcon,
  Package,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Tailwind sizing applied to BOTH theme variants — e.g. `h-8 w-auto sm:h-9`. */
  className?: string;
  /** Hint Next/Image to load immediately (use for above-the-fold logos). */
  priority?: boolean;
  /** `on-dark` — white mark for dark backgrounds (e.g. home hero). `auto` — dark mark for light UI. */
  tone?: 'auto' | 'on-dark';
}

/** White mark for dark backgrounds (hero, dark footer). */
const LOGO_ON_DARK_BG = '/brand/al-logo-dark.svg';
/** Dark mark for light backgrounds (default header, cards). */
const LOGO_ON_LIGHT_BG = '/brand/al-logo-light.svg';

/**
 * Brand mark — theme-aware SVGs from `@autolokate/brand` (synced to `/public/brand`).
 */
export function Logo({ className, priority = false, tone = 'auto' }: LogoProps) {
  if (tone === 'on-dark') {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image does not optimize SVG (served as-is), so it yields no LCP/bandwidth benefit
      <img
        src={LOGO_ON_DARK_BG}
        alt="Autolokate"
        width={140}
        height={133}
        draggable={false}
        fetchPriority={priority ? 'high' : undefined}
        className={cn('h-8 w-auto sm:h-9', className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image does not optimize SVG (served as-is), so it yields no LCP/bandwidth benefit
    <img
      src={LOGO_ON_LIGHT_BG}
      alt="Autolokate"
      width={140}
      height={133}
      draggable={false}
      fetchPriority={priority ? 'high' : undefined}
      className={cn('h-8 w-auto sm:h-9', className)}
    />
  );
}

export function HamburgerIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

export function CloseIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

export function SearchIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
  );
}

export interface HeaderNavItem {
  label: string;
  href: string;
  external?: boolean;
  /** Glyph shown in the mobile bottom nav (and optional desktop affordances). */
  icon?: LucideIcon;
  /** Short label used in compact surfaces (mobile bottom nav). Falls back to `label`. */
  shortLabel?: string;
}

/**
 * Primary information architecture (consumer-first site map).
 * Rendered as the desktop top nav and the mobile bottom nav.
 */
export const primaryNavItems: HeaderNavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'How It Works', href: '/how-it-works', icon: ScanLine, shortLabel: 'How' },
  { label: 'Features', href: '/features', icon: LayoutGrid },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Emergency & Safety', href: '/safety', icon: ShieldCheck, shortLabel: 'Safety' },
  { label: 'Pricing', href: '/pricing', icon: Tag },
];

/** Conversion CTA — consumer app download hub. */
export const downloadAppCta: Required<Pick<HeaderNavItem, 'label' | 'href' | 'icon'>> = {
  label: 'Download App',
  href: '/app',
  icon: Smartphone,
};

/** Secondary links surfaced only inside the mobile menu drawer + footer. */
export const secondaryNavItems: HeaderNavItem[] = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Media', href: '/media' },
  { label: 'Contact', href: '/contact-us' },
];

/** Back-compat alias — the header renders `primaryNavItems` directly. */
export const defaultHeaderNavItems = primaryNavItems;

/** Primary auth CTA shown on the right of the header. */
export const headerLoginCta = {
  label: 'Login',
  href: '/auth/login',
};

/** Whether a nav item matches the current route (exact for "/", prefix otherwise). */
export function isNavItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
