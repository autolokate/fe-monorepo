"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import type { VehicleCategory } from "@/lib/preferences";
import { cn } from "@/lib/utils";

/** Banner image fallback — matches Autolokate `CarsPageApi`. */
export const BRAND_HERO_FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&auto=format&fit=crop&q=80";

export type BrandHeroBannerImage = { url: string; label: string };

type Props = {
  vehicleType: VehicleCategory;
  brandDisplayName: string;
  pageSubtitle: string;
  bannerImages: BrandHeroBannerImage[];
  brandSwitcher?: ReactNode;
};

export function BrandCatalogueHero({
  vehicleType,
  brandDisplayName,
  pageSubtitle,
  bannerImages,
  brandSwitcher,
}: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-zinc-50 via-zinc-100/60 to-zinc-50">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-0 h-[500px] w-[60%] rounded-full bg-foreground/[0.03] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/[0.03] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Catalogue
            </p>

            <h1 className="font-display mt-3 text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
              {brandDisplayName ? (
                <>
                  Discover {brandDisplayName}
                  <br />
                  <span className="text-primary">in the live catalogue.</span>
                </>
              ) : (
                <>
                  Explore this brand
                  <br />
                  <span className="text-primary">in the live catalogue.</span>
                </>
              )}
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {pageSubtitle}
            </p>
            {brandSwitcher ? <div className="mt-6">{brandSwitcher}</div> : null}
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative h-52 sm:h-64 lg:h-72">
              {bannerImages.length > 0 ? (
                <div className="flex h-full items-end justify-center gap-3 lg:justify-end">
                  {bannerImages.map((img, i) => (
                    <div
                      key={`${img.url}-${i}`}
                      className={cn(
                        "relative shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg ring-1 ring-black/[0.06]",
                        "transition-transform duration-300 dark:ring-white/10",
                        i === 0
                          ? "h-40 w-36 translate-y-4 sm:h-52 sm:w-44 lg:h-60 lg:w-52"
                          : i === 1
                            ? "h-44 w-40 sm:h-56 sm:w-48 lg:h-64 lg:w-56"
                            : "h-36 w-32 translate-y-6 sm:h-48 sm:w-44 lg:h-56 lg:w-48",
                      )}
                      style={{ opacity: 1 - i * 0.06 }}
                    >
                      <Image
                        src={img.url}
                        alt={img.label}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 640px) 144px, (max-width: 1024px) 192px, 224px"
                        priority={i === 1}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 shadow-lg">
                  <Image
                    src={BRAND_HERO_FALLBACK_IMG}
                    alt={vehicleType === "cars" ? "Car catalogue" : "Bike catalogue"}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Two-column shimmer matching `BrandCatalogueHero` layout weights. */
export function BrandCatalogueHeroSkeleton() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-zinc-50 via-zinc-100/60 to-zinc-50">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-0 h-[500px] w-[60%] rounded-full bg-foreground/[0.03] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 space-y-4 lg:order-1">
            <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
            <div className="h-14 max-w-xl animate-pulse rounded-lg bg-muted/60" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted/40" />
            <div className="h-4 w-5/6 max-w-md animate-pulse rounded bg-muted/40" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-28 animate-pulse rounded bg-muted/45" />
              <div className="h-10 w-full max-w-xs animate-pulse rounded-xl bg-muted/55" />
            </div>
          </div>
          <div className="order-1 flex h-52 items-end justify-center gap-2 sm:h-64 lg:order-2 lg:h-72 lg:justify-end">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "animate-pulse rounded-2xl bg-muted/55",
                  i === 0
                    ? "h-36 w-[7.25rem] translate-y-4 sm:h-[13rem] sm:w-[11rem]"
                    : i === 1
                      ? "h-40 w-40 sm:h-56 sm:w-48 lg:h-64 lg:w-56"
                      : "h-32 w-[7.75rem] translate-y-6 sm:h-48 sm:w-44 lg:h-56 lg:w-48",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
