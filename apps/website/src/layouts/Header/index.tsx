'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type CSSProperties, useEffect, useState } from 'react';
import { ArrowRight, Menu } from 'lucide-react';
import { AlIconButton } from '@autolokate/ui/icon-button';
import { cn } from '@/lib/utils';
import { useIsAuthenticated, useLogout } from '@/hooks/auth';
import { isPurchaseAuthenticated } from '@/app/(purchase-journey)/shared/services/auth-api';
import { AvatarMenu } from './AvatarMenu';
import { avatarMenuItems } from './AvatarMenu/constants';
import { PurchaseAccountMenu } from './PurchaseAccountMenu';
import {
  CloseIcon,
  NavBrand,
  getProtectedCta,
  headerLoginCta,
  isNavItemActive,
  primaryNavItems,
  secondaryNavItems,
} from './constants';
import styles from './header.module.css';

interface HeaderProps {
  className?: string;
}

function ProtectedCta({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <Link href={getProtectedCta.href} onClick={onNavigate} className={cn(styles.cta, className)}>
      {getProtectedCta.label}
      <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const authed = useIsAuthenticated();
  const logout = useLogout({
    onSuccess: () => {
      router.push('/');
    },
  });

  const [purchaseAuthed, setPurchaseAuthed] = useState(false);
  useEffect(() => {
    setPurchaseAuthed(isPurchaseAuthenticated());
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const accountSlot = authed ? (
    <AvatarMenu />
  ) : purchaseAuthed ? (
    <PurchaseAccountMenu
      onSignOut={() => {
        setPurchaseAuthed(false);
      }}
    />
  ) : (
    <Link href={headerLoginCta.href} className={styles.loginLink}>
      {headerLoginCta.label}
    </Link>
  );

  return (
    <header
      className={cn(
        styles.root,
        styles.shellLight,
        scrolled && styles.shellLightScrolled,
        open && styles.menuOpen,
        'flex flex-col',
        className,
      )}
    >
      <div className={styles.bar}>
        <Link href="/" aria-label="Autolokate home" className={styles.logo}>
          <NavBrand tone="dark" />
        </Link>

        <nav aria-label="Primary" className={styles.desktopNav}>
          {primaryNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer noopener' : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(styles.navLink, active && styles.navLinkActive)}
              >
                {item.label}
                {active ? <span aria-hidden className={styles.navIndicator} /> : null}
              </Link>
            );
          })}
        </nav>

        <div className={styles.desktopActions}>
          {accountSlot}
          <ProtectedCta />
        </div>

        <div className={styles.mobileToggle}>
          {authed || purchaseAuthed ? accountSlot : null}
          <AlIconButton
            icon={open ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            label={open ? 'Close menu' : 'Open menu'}
            style={
              {
                color: '#0a0a0a',
                '--al-color-on-surface': '#0a0a0a',
                '--al-color-surface-variant': 'rgba(10,10,10,0.06)',
              } as CSSProperties
            }
            aria-expanded={open}
            aria-controls="site-header-mobile-menu"
            onClick={() => {
              setOpen((v) => !v);
            }}
          />
        </div>
      </div>

      {open ? (
        <div id="site-header-mobile-menu" className={styles.mobileMenu}>
          <ProtectedCta
            className={styles.ctaBlock}
            onNavigate={() => {
              setOpen(false);
            }}
          />

          {!authed && !purchaseAuthed ? (
            <Link
              href={headerLoginCta.href}
              onClick={() => {
                setOpen(false);
              }}
              className={styles.mobileLogin}
            >
              {headerLoginCta.label}
            </Link>
          ) : null}

          <p className={styles.mobileSectionLabel}>Menu</p>
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
                className={cn(styles.mobileNavItem, active && styles.mobileNavItemActive)}
              >
                {item.label}
              </Link>
            );
          })}

          <p className={styles.mobileSectionLabel}>More</p>
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
                className={cn(styles.mobileNavItem, active && styles.mobileNavItemActive)}
              >
                {item.label}
              </Link>
            );
          })}

          {authed ? (
            <>
              <div className={styles.mobileDivider} role="separator" />
              <p className={styles.mobileSectionLabel}>Account</p>
              {avatarMenuItems.map((item) => {
                const Icon = item.icon;
                const rowClass = cn(
                  styles.mobileNavItem,
                  item.tone === 'danger'
                    ? 'text-[var(--website-red-bright)] hover:bg-[var(--website-red)]/10'
                    : '',
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

export function PremiumHeader(props: HeaderProps) {
  return <Header {...props} />;
}
