"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type CSSProperties, useEffect, useState } from "react";
import { LogIn, Menu } from "lucide-react";
import { AlButton } from "@autolokate/ui/button";
import { AlIconButton } from "@autolokate/ui/icon-button";
import { cn } from "@/lib/utils";
import { useIsAuthenticated, useLogout } from "@/hooks/auth";
import { AvatarMenu } from "./AvatarMenu";
import { avatarMenuItems } from "./AvatarMenu/constants";
import {
  CloseIcon,
  Logo,
  downloadAppCta,
  headerLoginCta,
  isNavItemActive,
  primaryNavItems,
  secondaryNavItems,
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

/** Desktop top-nav links — Home is reachable via the logo, so it's omitted. */
const desktopNavItems = primaryNavItems.filter((item) => item.href !== "/");

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
  const isPremium = variant === "premium";
  // The home hero plate is always dark, so over it (premium + not scrolled) the
  // header uses the white-on-dark nav treatment.
  const onDarkHero = overDarkHero && isPremium && !scrolled;
  const showDarkHeroStyle = onDarkHero && !open;
  // The logo ink must match the surface behind it: white over the dark hero,
  // otherwise the default dark wordmark.
  const logoTone: "auto" | "on-dark" = showDarkHeroStyle ? "on-dark" : "auto";
  const authed = useIsAuthenticated();
  const logout = useLogout({
    onSuccess: () => router.push("/"),
  });

  const DownloadIcon = downloadAppCta.icon;

  // Over a dark hero the DS tokens (dark ink on light surfaces) are invisible,
  // so override the relevant custom properties for ghost/icon affordances.
  const onDarkSurfaceStyle: CSSProperties | undefined = showDarkHeroStyle
    ? ({
        color: "#fff",
        "--al-color-on-surface": "#fff",
        "--al-color-surface-variant": "rgba(255,255,255,0.16)",
      } as CSSProperties)
    : undefined;

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
      {/* ---------------------------------------------------------------- */}
      {/* Desktop bar — logo left, nav, CTA + account right (unchanged IA) */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto hidden w-full min-h-16 max-w-7xl shrink-0 items-center gap-6 px-10 py-4 lg:flex">
        <Link
          href="/"
          aria-label="Autolokate home"
          className="flex shrink-0 items-center rounded-lg text-foreground outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo tone={logoTone} className="h-9 w-auto" priority />
        </Link>

        <nav aria-label="Primary" className="ml-auto flex items-center gap-1">
          {desktopNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
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

        <div className="flex shrink-0 items-center gap-2">
          <AlButton
            size="sm"
            radius="pill"
            variant="primary"
            icon={<DownloadIcon className="h-4 w-4" aria-hidden />}
            onClick={() => router.push(downloadAppCta.href)}
          >
            {downloadAppCta.label}
          </AlButton>

          {authed === null ? (
            <div
              aria-hidden
              className="h-10 w-10 shrink-0 rounded-full bg-muted/40"
            />
          ) : authed ? (
            <AvatarMenu />
          ) : (
            <AlButton
              size="sm"
              radius="pill"
              variant="ghost"
              style={onDarkSurfaceStyle}
              onClick={() => router.push(headerLoginCta.href)}
            >
              {headerLoginCta.label}
            </AlButton>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile bar — centered logo, account left, CTA + menu top right    */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid w-full min-h-14 shrink-0 grid-cols-3 items-center gap-2 px-4 py-3 sm:min-h-16 sm:px-6 lg:hidden">
        <div aria-hidden className="flex items-center justify-start" />

        <div className="flex items-center justify-center">
          <Link
            href="/"
            aria-label="Autolokate home"
            className="flex items-center rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Logo tone={logoTone} className="h-8 w-auto" priority />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-1">
          <AlIconButton
            icon={open ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            label={open ? "Close menu" : "Open menu"}
            style={onDarkSurfaceStyle}
            aria-expanded={open}
            aria-controls="header-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          />
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile "more" drawer — secondary links + account                  */}
      {/* ---------------------------------------------------------------- */}
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
            <AlButton
              variant="primary"
              radius="lg"
              className="w-full"
              icon={<DownloadIcon className="h-4 w-4 shrink-0" aria-hidden />}
              onClick={() => {
                setOpen(false);
                router.push(downloadAppCta.href);
              }}
            >
              {downloadAppCta.label}
            </AlButton>

            <p className="px-4 pt-5 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              More
            </p>
            <div className="flex flex-col gap-0.5">
              {secondaryNavItems.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
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
            </div>

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
      ) : null}
    </header>
  );
}

/** Glassy/transparent variant used over hero imagery. */
export function PremiumHeader(props: Omit<HeaderProps, "variant">) {
  return <Header variant="premium" {...props} />;
}
