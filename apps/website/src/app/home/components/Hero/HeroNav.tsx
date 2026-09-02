'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type CSSProperties, useEffect, useState } from 'react';
import { ArrowRight, Menu, Play } from 'lucide-react';
import { AlIconButton } from '@autolokate/ui/icon-button';
import { cn } from '@/lib/utils';
import { useIsAuthenticated, useLogout } from '@/hooks/auth';
import { isPurchaseAuthenticated } from '@/app/(purchase-journey)/shared/services/auth-api';
import { AvatarMenu } from '@/layouts/Header/AvatarMenu';
import { avatarMenuItems } from '@/layouts/Header/AvatarMenu/constants';
import { PurchaseAccountMenu } from '@/layouts/Header/PurchaseAccountMenu';
import headerStyles from '@/layouts/Header/header.module.css';
import {
  CloseIcon,
  NavBrand,
  getProtectedCta,
  headerLoginCta,
  isNavItemActive,
  primaryNavItems,
  secondaryNavItems,
} from '@/layouts/Header/constants';
import { HERO_COPY } from './constants';
import styles from './HeroNav.module.css';

export function HeroNav() {
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
    <Link href={headerLoginCta.href} className={headerStyles.loginLink}>
      {headerLoginCta.label}
    </Link>
  );

  return (
    <header
      className={cn(
        headerStyles.root,
        scrolled ? headerStyles.shellScrolled : headerStyles.shellOverlay,
        open && headerStyles.menuOpen,
        'flex flex-col',
      )}
    >
      <div className={headerStyles.bar}>
        <Link href="/" aria-label="Autolokate home" className={headerStyles.logo}>
          <NavBrand tone="light" />
        </Link>

        <nav aria-label="Primary" className={headerStyles.desktopNav}>
          {primaryNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(headerStyles.navLink, active && headerStyles.navLinkActive)}
              >
                {item.label}
                {active ? <span aria-hidden className={headerStyles.navIndicator} /> : null}
              </Link>
            );
          })}
        </nav>

        <div className={headerStyles.desktopActions}>
          {accountSlot}
          <Link href={getProtectedCta.href} className={headerStyles.cta}>
            {getProtectedCta.label}
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>

        <div className={headerStyles.mobileToggle}>
          {authed || purchaseAuthed ? accountSlot : null}
          <AlIconButton
            icon={open ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            label={open ? 'Close menu' : 'Open menu'}
            style={
              {
                color: '#ffffff',
                '--al-color-on-surface': '#ffffff',
                '--al-color-surface-variant': 'rgba(255,255,255,0.1)',
              } as CSSProperties
            }
            aria-expanded={open}
            aria-controls="hero-header-mobile-menu"
            onClick={() => {
              setOpen((v) => !v);
            }}
          />
        </div>
      </div>

      {open ? (
        <div id="hero-header-mobile-menu" className={headerStyles.mobileMenu}>
          <Link
            href={getProtectedCta.href}
            className={cn(headerStyles.cta, headerStyles.ctaBlock)}
            onClick={() => {
              setOpen(false);
            }}
          >
            {getProtectedCta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>

          {!authed && !purchaseAuthed ? (
            <Link
              href={headerLoginCta.href}
              className={headerStyles.mobileLogin}
              onClick={() => {
                setOpen(false);
              }}
            >
              {headerLoginCta.label}
            </Link>
          ) : null}

          <p className={headerStyles.mobileSectionLabel}>Menu</p>
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                headerStyles.mobileNavItem,
                isNavItemActive(pathname, item.href) && headerStyles.mobileNavItemActive,
              )}
              onClick={() => {
                setOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}

          <p className={headerStyles.mobileSectionLabel}>More</p>
          {secondaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                headerStyles.mobileNavItem,
                isNavItemActive(pathname, item.href) && headerStyles.mobileNavItemActive,
              )}
              onClick={() => {
                setOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}

          {authed
            ? avatarMenuItems.map((item) => {
                const Icon = item.icon;
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={headerStyles.mobileNavItem}
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={headerStyles.mobileNavItem}
                    onClick={() => void logout.mutate()}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {logout.isLoading ? 'Signing out…' : item.label}
                  </button>
                );
              })
            : null}
        </div>
      ) : null}
    </header>
  );
}

export function HeroCopyBlock() {
  const router = useRouter();

  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}>
        <span className={styles.eyebrowDot} aria-hidden="true" />
        {HERO_COPY.eyebrow}
      </p>

      <h1 id="home-hero-heading" className={styles.headline}>
        {HERO_COPY.headline}{' '}
        <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
      </h1>

      <p className={styles.subheading}>{HERO_COPY.subheading}</p>

      <div className={styles.ctaRow}>
        <Link href={HERO_COPY.primaryCta.href} className={styles.primaryBtn}>
          {HERO_COPY.primaryCta.label}
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => {
            router.push(HERO_COPY.secondaryCta.href);
          }}
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          {HERO_COPY.secondaryCta.label}
        </button>
      </div>
    </div>
  );
}
