"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogIn, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsAuthenticated, useLogout } from "@/hooks/auth";
import { useVehiclePreference } from "@/hooks/preferences";
import { DEFAULT_VEHICLE_CATEGORY } from "@/lib/preferences";
import { getHeaderNavigationItems } from "@/navigation";
import { AvatarMenu } from "./AvatarMenu";
import { avatarMenuItems } from "./AvatarMenu/constants";
import {
  CloseIcon,
  Logo,
  defaultHeaderNavItems,
  headerLoginCta,
  type HeaderNavItem,
} from "./constants";

export type HeaderVariant = "default" | "premium";

interface HeaderProps {
  /**
   * `default` — glass background with bottom border (recommended for most pages).
   * `premium` — transparent at the top of the page, fades into glass on scroll.
   *             Use over hero imagery (e.g. landing page).
   */
  variant?: HeaderVariant;
  /** Light logo + white nav for a dark hero (home landing). */
  overDarkHero?: boolean;
  className?: string;
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function resolveNavItems(): HeaderNavItem[] {
  const fromConfig = getHeaderNavigationItems();
  if (fromConfig.length > 0) {
    return fromConfig.map((item) => ({
      label: item.label,
      href: item.href,
      external: item.external,
    }));
  }
  return defaultHeaderNavItems;
}

function navLinkClass(active: boolean, onDarkHero: boolean) {
  return cn(
    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
    onDarkHero
      ? "text-white hover:bg-white/10 hover:text-white"
      : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
    active &&
      (onDarkHero
        ? "bg-white/15 text-white"
        : "bg-primary/15 text-primary shadow-sm"),
  );
}

export function Header({
  variant = "default",
  overDarkHero = false,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const vehiclePreference = useVehiclePreference();
  const navItems = useMemo(() => {
    const raw = resolveNavItems();
    const pref = vehiclePreference.value ?? DEFAULT_VEHICLE_CATEGORY;
    return raw.map((item) => {
      if (item.useVehicleCompareHref) return { ...item, href: `/${pref}/compare` };
      if (item.useVehicleExploreHref) return { ...item, href: `/${pref}/explore` };
      return item;
    });
  }, [vehiclePreference.value]);
  const isPremium = variant === "premium";
  const onDarkHero = overDarkHero && isPremium && !scrolled;
  const showDarkHeroStyle = onDarkHero && !open;
  const authed = useIsAuthenticated();
  const logout = useLogout({
    onSuccess: () => router.push("/"),
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex flex-col transition-colors",
        open
          ? "bottom-0 bg-background lg:bottom-auto"
          : isPremium && !scrolled
            ? "bg-transparent"
            : "border-b border-border/70 bg-background/80 shadow-[0_8px_32px_-12px_rgba(24,24,27,0.08)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/72",
        className,
      )}
    >
      <div className="mx-auto flex w-full min-h-14 max-w-7xl shrink-0 items-center justify-between gap-3 px-5 py-3.5 sm:min-h-16 sm:gap-6 sm:px-8 sm:py-4 lg:justify-start lg:px-10">
        <Link
          href="/"
          aria-label="Autolokate home"
          className="flex shrink-0 items-center rounded-lg text-foreground outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo tone={showDarkHeroStyle ? "on-dark" : "auto"} className="h-8 w-auto sm:h-9" priority />
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const compareNav = item.useVehicleCompareHref === true;
            const exploreNav = item.useVehicleExploreHref === true;
            const active =
              pathname === item.href ||
              (!compareNav &&
                !exploreNav &&
                item.href !== "/" &&
                pathname?.startsWith(`${item.href}/`)) ||
              (compareNav &&
                (pathname === "/cars/compare" || pathname === "/bikes/compare")) ||
              (exploreNav &&
                (pathname === "/cars/explore" || pathname === "/bikes/explore"));
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer noopener" : undefined}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active, showDarkHeroStyle)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-2">
          <div className="hidden min-h-10 items-center gap-1.5 sm:gap-2 lg:flex">
            {authed === null ? (
              <div
                aria-hidden
                className="h-9 w-9 shrink-0 rounded-full bg-muted/40 sm:h-10 sm:w-10"
              />
            ) : authed ? (
              <AvatarMenu />
            ) : (
              <Button
                asChild
                size="sm"
                variant={showDarkHeroStyle ? "outline" : "default"}
                className={cn(
                  "h-8 shrink-0 px-3.5 text-xs font-semibold sm:h-9 sm:px-4 sm:text-sm",
                  showDarkHeroStyle &&
                    "border-white text-white hover:border-white hover:bg-white/10 hover:text-white",
                )}
              >
                <Link href={headerLoginCta.href}>
                  <LogIn className="h-4 w-4" aria-hidden />
                  {headerLoginCta.label}
                </Link>
              </Button>
            )}
          </div>
          <button
            type="button"
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-10 sm:w-10 lg:hidden",
              showDarkHeroStyle
                ? "border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/15"
                : "border-border/90 bg-card text-muted-foreground hover:border-foreground/15 hover:bg-secondary hover:text-foreground",
            )}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="header-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="relative flex min-h-0 flex-1 flex-col lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div
            id="header-mobile-menu"
            className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-border/70 bg-background px-5 py-4 sm:px-8"
          >
            <div className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const compareNav = item.useVehicleCompareHref === true;
                const exploreNav = item.useVehicleExploreHref === true;
                const active =
                  pathname === item.href ||
                  (!compareNav &&
                    !exploreNav &&
                    item.href !== "/" &&
                    pathname?.startsWith(`${item.href}/`)) ||
                  (compareNav &&
                    (pathname === "/cars/compare" || pathname === "/bikes/compare")) ||
                  (exploreNav &&
                    (pathname === "/cars/explore" || pathname === "/bikes/explore"));
                return (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer noopener" : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "touch-target rounded-xl px-4 py-3 text-sm font-medium transition",
                      "text-foreground/85 hover:bg-foreground/5 hover:text-foreground",
                      active && "bg-primary/15 text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {authed ? (
                <>
                  <div className="my-2 h-px bg-border/70" role="separator" />
                  <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Account
                  </p>
                  {avatarMenuItems.map((item) => {
                    const Icon = item.icon;
                    const rowClass = cn(
                      "touch-target flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                      item.tone === "danger"
                        ? "text-rose-600 hover:bg-rose-500/10"
                        : "text-foreground/85 hover:bg-foreground/5 hover:text-foreground",
                      logout.isLoading && item.action === "logout" && "pointer-events-none opacity-60",
                    );

                    if (item.href) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setOpen(false)}
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
                        {logout.isLoading ? "Signing out…" : item.label}
                      </button>
                    );
                  })}
                </>
              ) : authed === false ? (
                <>
                  <div className="my-2 h-px bg-border/70" role="separator" />
                  <Link
                    href={headerLoginCta.href}
                    onClick={() => setOpen(false)}
                    className="touch-target flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-foreground/85 transition hover:bg-foreground/5 hover:text-foreground"
                  >
                    <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                    {headerLoginCta.label}
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Glassy/transparent variant used over hero imagery. */
export function PremiumHeader(props: Omit<HeaderProps, "variant">) {
  return <Header variant="premium" {...props} />;
}
