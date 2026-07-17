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

/**
 * Autolokate glyph — the swirl "A" that opens the wordmark. Inherits `currentColor`
 * so it can be tinted white on the dark nav or dark on light surfaces. Matches the
 * redesign Figma nav mark (24×23).
 */
export function AlMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <g clipPath="url(#al-mark-clip)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.5447 11.3209C15.361 10.8736 15.1249 10.4835 14.8182 10.1238C14.4864 9.73444 14.1072 9.41414 13.6494 9.20653C12.2943 8.59183 10.9954 8.69037 9.78825 9.58886C9.0472 10.1404 8.55234 10.8697 8.31279 11.7633C8.02479 12.8377 8.24437 13.8315 8.80497 14.7709C9.15367 15.3553 9.48784 15.9484 9.83183 16.5356C10.1697 17.1124 10.5135 17.6857 10.851 18.2627C10.9411 18.4167 11.0177 18.5785 11.1159 18.7662C10.9572 18.8128 10.8104 18.8655 10.6594 18.8986C9.98881 19.0457 9.3902 19.3491 8.83658 19.7436C8.56253 19.9389 8.28869 20.141 8.04696 20.3735C7.72582 20.6823 7.44336 21.031 7.13114 21.3497C6.69946 21.7903 6.31048 22.2862 5.73185 22.553C5.27087 22.7655 4.78785 22.8879 4.27355 22.9078C3.46718 22.9389 2.68931 22.8345 1.97714 22.4444C1.21121 22.0247 0.677596 21.3921 0.337317 20.5818C0.0109854 19.8048 0.055305 18.9929 0.0995009 18.1908C0.118896 17.8389 0.284702 17.4773 0.450963 17.1545C0.990433 16.1074 1.55788 15.0745 2.12017 14.0393C2.66703 13.0324 3.22362 12.0308 3.7706 11.0239C4.27306 10.0989 4.77299 9.17252 5.2653 8.2421C5.60702 7.59629 5.92815 6.93958 6.26876 6.29315C6.78715 5.30929 7.30871 4.32703 7.84001 3.35014C8.17273 2.73833 8.50955 2.12752 8.87541 1.53535C9.13076 1.12211 9.52184 0.833044 9.92691 0.570386C10.6581 0.096281 11.4741 -7.48336e-05 12.3175 0.0444511C12.9774 0.0793209 13.6033 0.263986 14.152 0.62626C14.7199 1.00116 15.1843 1.49062 15.5149 2.09768C16.0457 3.07234 16.5909 4.0392 17.1163 5.01679C17.4395 5.61829 17.7293 6.23765 18.0476 6.84191C18.6278 7.94313 19.2165 9.03977 19.8043 10.137C20.1574 10.7959 20.5148 11.4526 20.8715 12.1097C21.3817 13.0497 21.8944 13.9883 22.4036 14.9289C22.7664 15.5989 23.138 16.2647 23.4817 16.9444C23.7753 17.5249 23.9389 18.1354 23.9447 18.8032C23.9509 19.5212 23.8599 20.2084 23.5507 20.8513C23.3021 21.3684 22.9365 21.803 22.474 22.1546C21.9763 22.533 21.4073 22.7571 20.8045 22.8476C19.7883 23.0001 18.7812 22.9502 17.9107 22.3171C17.577 22.0743 17.3048 21.7455 17.0118 21.4487C16.738 21.1712 16.4809 20.8771 16.204 20.6028C15.4666 19.8724 14.6269 19.2988 13.6319 18.9749C13.4482 18.9151 13.2588 18.8694 13.0689 18.8331C12.9041 18.8016 12.8861 18.7258 12.9618 18.5942C13.2623 18.0714 13.5593 17.5465 13.8619 17.0248C14.3829 16.1265 14.9411 15.2477 15.4205 14.3278C15.921 13.3675 15.9376 12.3515 15.5447 11.3209ZM13.1958 13.5661C12.9661 13.974 12.2521 14.2989 11.7561 14.2128C11.0942 14.0979 10.5204 13.4948 10.49 12.8248C10.4671 12.3182 10.662 11.8688 11.0883 11.5599C11.9511 10.9348 13.1935 11.3665 13.4159 12.4803C13.4957 12.8799 13.4043 13.2218 13.1958 13.5661Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="al-mark-clip">
          <rect width="24" height="23" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * Full brand lockup used in the top nav — swirl mark ("A") + "utolokate" wordmark.
 * Inherits `currentColor`, so wrap in a `text-white` (dark nav) surface. Matches the
 * redesign Figma "AlLogo" (Inter Bold 24, letter-spacing -0.03em).
 */
export function NavBrand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn('flex items-center gap-[2px] text-white', className)}>
      <AlMark className={compact ? 'h-[19px] w-auto' : 'h-[23px] w-auto'} />
      <span
        className={cn(
          'font-bold leading-none tracking-[-0.03em]',
          compact ? 'text-[20px]' : 'text-[24px]',
        )}
      >
        utolokate
      </span>
    </span>
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
 * Ordered + labelled to match the redesign Figma top nav.
 * Rendered as the desktop top nav and the mobile bottom nav.
 */
export const primaryNavItems: HeaderNavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'How it works', href: '/how-it-works', icon: ScanLine, shortLabel: 'How' },
  {
    label: 'Emergency & safety',
    href: '/emergency-safety',
    icon: ShieldCheck,
    shortLabel: 'Safety',
  },
  { label: 'Features', href: '/features', icon: LayoutGrid },
  { label: 'Pricing', href: '/pricing', icon: Tag },
  { label: 'Products', href: '/products', icon: Package },
];

/**
 * Primary conversion CTA in the top nav. Points at the home "Safety packs"
 * section anchor (matches the redesign's other "Get protected" CTAs).
 */
export const getProtectedCta: Required<Pick<HeaderNavItem, 'label' | 'href'>> = {
  label: 'Get protected',
  href: '/#safety-packs',
};

/** Consumer app download hub — surfaced in the mobile drawer / footer. */
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
  label: 'Log in',
  href: '/auth/login',
};

/** Whether a nav item matches the current route (exact for "/", prefix otherwise). */
export function isNavItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
