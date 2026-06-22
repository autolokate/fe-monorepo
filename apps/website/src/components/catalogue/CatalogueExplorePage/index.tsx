"use client";

import { ChevronRight, LayoutGrid, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageFade } from "@/components/shared/PageFade";
import { Button } from "@/components/ui/button";
import { useCatalogueExploreModels } from "@/hooks/catalogue";
import type { VehicleCategory } from "@/lib/preferences";

import { BrandCatalogueListing } from "../BrandModelsPage/BrandCatalogueListing";
import { EXPLORE_BANNER_BACKGROUND, EXPLORE_CATALOGUE_COPY } from "./constants";

export interface CatalogueExplorePageProps {
  vehicleType: VehicleCategory;
}

/**
 * `/cars/explore` and `/bikes/explore` — driven by paginated `GET /v1/catalogue/models`.
 *
 * Layout (matches Autolokate explore mockup):
 *  - Compact hero with a slash-separated breadcrumb eyebrow (Marketplace /
 *    Cars), single-line headline, two-line subtitle, and a primary
 *    "Browse by brand" CTA with a chevron on the right.
 *  - Reuses `EXPLORE_BANNER_BACKGROUND.light` as the right-side car artwork;
 *    a left-to-right wash keeps the headline readable.
 *  - Listing card (`BrandCatalogueListing`) carries the search/sort/price-range
 *    filters, active-filter pills, results header, grid, and Load-more footer.
 */
export function CatalogueExplorePage({ vehicleType }: CatalogueExplorePageProps) {
  const copy = EXPLORE_CATALOGUE_COPY[vehicleType];
  const hub = `/${vehicleType}`;
  const vehicleLabel = vehicleType === "cars" ? "Cars" : "Bikes";
  const subtitle =
    vehicleType === "cars"
      ? "At Autolokate, find the perfect car for every need — filter by brand, body type, fuel, and sort by price."
      : "At Autolokate, find the perfect bike for every need — filter by brand, body type, fuel, and sort by price.";
  const {
    models,
    hasMore,
    isLoading,
    isFetchingMore,
    isError,
    loadMore,
    refetch,
  } = useCatalogueExploreModels(vehicleType);

  return (
    <PageFade>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[20rem] items-center overflow-hidden border-b border-border/70 bg-background sm:min-h-[24rem] lg:min-h-[26rem]">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={EXPLORE_BANNER_BACKGROUND.light}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          {/* Headline-side wash only — solid on the far left, fully transparent
              past ~55% so the SUV artwork shows through cleanly on the right. */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          {/* Slash-separated breadcrumb eyebrow. */}
          <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em]">
            <span className="text-muted-foreground/80">Marketplace</span>
            <span aria-hidden className="text-muted-foreground/50">
              /
            </span>
            <span className="font-bold text-foreground">{vehicleLabel}</span>
          </p>

          <h1 className="font-display mt-3 max-w-2xl text-balance text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-[2rem] lg:text-[2.25rem]">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
            {subtitle}
          </p>

          <Button
            type="button"
            size="sm"
            className="mt-4 h-10 px-5 text-sm font-semibold"
            asChild
          >
            <Link href={hub}>
              <LayoutGrid className="h-4 w-4" aria-hidden />
              {copy.directoryLinkLabel}
              <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Listings ────────────────────────────────────────────────────── */}
      <BrandCatalogueListing
        listings={models}
        vehicleType={vehicleType}
        pageBrandSlug=""
        displayName=""
        lockedBrandBadge=""
        showBrandLockBadge={false}
        modelsHeading={copy.modelsHeading}
        emptyCatalogueCopy={copy.emptyCopy}
        isInitialLoading={isLoading && models.length === 0}
        modelsError={isError && models.length === 0}
        onRetryModels={refetch}
        afterListings={
          hasMore ? (
            <div className="mt-10 flex justify-center pb-6">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="px-8"
                disabled={isFetchingMore || isLoading}
                onClick={() => void loadMore()}
              >
                {isFetchingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden />
                )}
                {isFetchingMore ? "Loading…" : copy.loadMore}
              </Button>
            </div>
          ) : null
        }
      />
    </PageFade>
  );
}
