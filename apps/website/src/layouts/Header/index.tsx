'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type CSSProperties, useEffect, useState } from 'react';
import { ArrowRight, Menu } from 'lucide-react';
import { AlIconButton } from '@autolokate/ui/icon-button';
import { cn } from '@/lib/utils';
import { useIsAuthenticated, useLogout } from '@/hooks/auth';
import { AvatarMenu } from './AvatarMenu';
import { avatarMenuItems } from './AvatarMenu/constants';
import {
  CloseIcon,
  NavBrand,
  getProtectedCta,
  headerLoginCta,
  isNavItemActive,
  primaryNavItems,
  secondaryNavItems,
} from './constants';

interface HeaderProps {
  className?: string;
}

/** Get-protected pill CTA — white plate on the dark bar (matches Figma). */
function GetProtectedCta({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={getProtectedCta.href}
      onClick={onNavigate}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[18px] font-bold leading-[26px] text-[#0a0a0c] outline-none transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]',
        className,
      )}
    >
      {getProtectedCta.label}
      <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}

/**
 * Site top nav — dark bar with brand lockup, primary links and the "Get protected"
 * CTA. Rebuilt to the redesign Figma reference (solid `#0a0a0c`, hairline bottom
 * border, green active underline).
 */
export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const authed = useIsAuthenticated();
  const logout = useLogout({
    onSuccess: () => {
      router.push('/');
    },
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex flex-col bg-[#0a0a0c] text-white',
        open ? 'bottom-0 lg:bottom-auto' : 'border-b border-white/[0.06]',
        className,
      )}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Desktop bar — brand left, links center, Get protected right       */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto hidden w-full max-w-[75rem] shrink-0 items-center justify-between gap-8 px-5 py-5 sm:px-8 lg:flex lg:px-10">
        <Link
          href="/"
          aria-label="Autolokate home"
          className="flex shrink-0 items-center rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
        >
          <NavBrand />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-[30px]">
          {primaryNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer noopener' : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative py-1 text-[15px] leading-[21px] transition-colors',
                  active
                    ? 'font-semibold text-white'
                    : 'font-medium text-[#9aa0a8] hover:text-white',
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 left-1/2 h-[2.5px] w-[18px] -translate-x-1/2 rounded-full bg-[#39c46b]"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-5">
          {authed ? (
            <AvatarMenu />
          ) : (
            <Link
              href={headerLoginCta.href}
              className="text-[15.5px] leading-6 text-[#c9cdd3] outline-none transition-colors hover:text-white focus-visible:text-white"
            >
              {headerLoginCta.label}
            </Link>
          )}
          <GetProtectedCta />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile bar — brand left, account + menu right                     */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto flex min-h-14 w-full max-w-[75rem] shrink-0 items-center justify-between gap-2 px-5 py-3 sm:min-h-16 sm:px-8 lg:hidden">
        <Link
          href="/"
          aria-label="Autolokate home"
          className="flex items-center rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <NavBrand compact />
        </Link>

        <div className="flex items-center gap-1.5">
          {authed ? <AvatarMenu /> : null}
          <AlIconButton
            icon={open ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            label={open ? 'Close menu' : 'Open menu'}
            style={
              {
                color: '#fff',
                '--al-color-on-surface': '#fff',
                '--al-color-surface-variant': 'rgba(255,255,255,0.12)',
              } as CSSProperties
            }
            aria-expanded={open}
            aria-controls="header-mobile-menu"
            onClick={() => {
              setOpen((v) => !v);
            }}
          />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile drawer — primary + secondary links, CTA and account        */}
      {/* ---------------------------------------------------------------- */}
      {open ? (
        <div
          id="header-mobile-menu"
          className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-white/[0.06] bg-[#0a0a0c] px-5 py-4 sm:px-8"
        >
          <GetProtectedCta
            className="w-full"
            onNavigate={() => {
              setOpen(false);
            }}
          />

          {!authed ? (
            <Link
              href={headerLoginCta.href}
              onClick={() => {
                setOpen(false);
              }}
              className="touch-target mt-2 flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-[15.5px] font-medium text-[#c9cdd3] transition hover:border-white/30 hover:text-white"
            >
              {headerLoginCta.label}
            </Link>
          ) : null}

          <div className="mt-5 flex flex-col gap-0.5">
            {primaryNavItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer noopener' : undefined}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    setOpen(false);
                  }}
                  className={cn(
                    'touch-target rounded-xl px-4 py-3 text-sm font-medium transition',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-white/45">
            More
          </p>
          <div className="flex flex-col gap-0.5">
            {secondaryNavItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer noopener' : undefined}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    setOpen(false);
                  }}
                  className={cn(
                    'touch-target rounded-xl px-4 py-3 text-sm font-medium transition',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {authed ? (
            <>
              <div className="my-2 h-px bg-white/10" role="separator" />
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/45">
                Account
              </p>
              {avatarMenuItems.map((item) => {
                const Icon = item.icon;
                const rowClass = cn(
                  'touch-target flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition',
                  item.tone === 'danger'
                    ? 'text-rose-400 hover:bg-rose-500/10'
                    : 'text-white/80 hover:bg-white/5 hover:text-white',
                  logout.isLoading && item.action === 'logout' && 'pointer-events-none opacity-60',
                );

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setOpen(false);
                      }}
                      className={rowClass}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={rowClass}
                    onClick={() => void logout.mutate()}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {logout.isLoading ? 'Signing out…' : item.label}
                  </button>
                );
              })}
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

/** Back-compat alias — the header now renders a single dark treatment everywhere. */
export function PremiumHeader(props: HeaderProps) {
  return <Header {...props} />;
}
