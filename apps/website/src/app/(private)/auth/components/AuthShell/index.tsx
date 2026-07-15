import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AUTH_BG, INLINE_FLEX_THEME_VAR } from '../constants';

interface AuthShellProps {
  children: ReactNode;
}

/**
 * Full-bleed dark/light background wrapper for /auth/login + /auth/signup.
 * Renders the back-to-home pill, the theme-aware showroom photo, and three
 * scrims that keep glass cards readable in both themes.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="theme-dark-only pointer-events-none absolute inset-0 z-0 bg-zinc-950"
        aria-hidden
      />
      <div
        className="theme-light-only pointer-events-none absolute inset-0 z-0 bg-zinc-100"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={AUTH_BG.dark}
          alt=""
          fill
          priority
          sizes="100vw"
          className="theme-dark-only object-cover object-[82%_center]"
        />
        <Image
          src={AUTH_BG.light}
          alt=""
          fill
          priority
          sizes="100vw"
          className="theme-light-only object-cover object-[78%_center]"
        />
      </div>

      <div
        className="theme-dark-only pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-black/58 via-zinc-950/38 to-black/50"
        aria-hidden
      />
      <div
        className="theme-dark-only pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_100%_75%_at_28%_18%,rgba(59,130,246,0.14),transparent_52%)]"
        aria-hidden
      />
      <div
        className="theme-light-only pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-white/72 via-sky-50/35 to-white/62"
        aria-hidden
      />
      <div
        className="theme-light-only pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_90%_65%_at_22%_22%,rgba(255,255,255,0.55),transparent_55%)]"
        aria-hidden
      />

      <Link
        href="/"
        aria-label="Back to home"
        style={INLINE_FLEX_THEME_VAR}
        className="theme-dark-only absolute left-4 top-4 z-20 inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-button border border-white/12 bg-black/30 px-3.5 text-sm font-medium text-white/95 shadow-sm backdrop-blur-md transition hover:bg-black/40 hover:text-white sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4 shrink-0 opacity-90" aria-hidden />
        <span className="leading-none">Back to home</span>
      </Link>
      <Link
        href="/"
        aria-label="Back to home"
        style={INLINE_FLEX_THEME_VAR}
        className="theme-light-only absolute left-4 top-4 z-20 inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-button border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-foreground shadow-md transition hover:bg-zinc-50 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4 shrink-0 opacity-90" aria-hidden />
        <span className="leading-none">Back to home</span>
      </Link>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-[440px]">
          <div className="login-auth-card text-card-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
