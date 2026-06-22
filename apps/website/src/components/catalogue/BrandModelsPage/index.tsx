"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { PageFade } from "@/components/shared/PageFade";
import { Button } from "@/components/ui/button";
import {
  useBrandDetails,
  useBrandModels,
  useCatalogueBrandsForCategory,
} from "@/hooks/catalogue";
import type { CatalogueModel } from "@/lib/catalogue/types";

import {
  BrandCatalogueHero,
  BrandCatalogueHeroSkeleton,
} from "./BrandHero";
import { BrandCatalogueListing } from "./BrandCatalogueListing";
import { BrandPageBrandSwitcher } from "./BrandPageBrandSwitcher";
import { BRAND_MODELS_COPY } from "./constants";

/** Autolokate `CarsPageApi` banner gutter — reused for skeleton / errors. */
const BRAND_PAGE_HERO_SHELL =
  "relative overflow-hidden border-b border-border bg-gradient-to-br from-zinc-50 via-zinc-100/60 to-zinc-50";

export interface BrandModelsPageProps {
  vehicleType: import("@/lib/preferences").VehicleCategory;
  brandSlug: string;
}

function slugToLabel(slug: string): string {
  const s = slug.trim();
  if (!s) return "Brand";
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Manufacturer catalogue hub driven by `/v1/catalogue/brands/{slug}` and
 * `/v1/catalogue/brands/{slug}/models`. Filters + grid parity with Autolokate `CarsPageApi`.
 */
export function BrandModelsPage({ vehicleType, brandSlug }: BrandModelsPageProps) {
  const copy = BRAND_MODELS_COPY[vehicleType];

  const slug = decodeURIComponent(String(brandSlug ?? "").trim());

  const {
    data: brand,
    isLoading: brandLoading,
    isError: brandError,
    refetch: refetchBrand,
  } = useBrandDetails(slug, { enabled: Boolean(slug) });

  const {
    data: models,
    isLoading: modelsLoading,
    isError: modelsError,
    refetch: refetchModels,
  } = useBrandModels(slug, { enabled: Boolean(slug) });

  const { brandOptions, isFetching: brandIndexFetching } = useCatalogueBrandsForCategory(
    vehicleType,
    { enabled: Boolean(slug) },
  );

  const displayName =
    brand?.brand_name?.trim() ||
    models?.find((m) => (m as CatalogueModel).brand_name)?.brand_name?.trim() ||
    slugToLabel(slug);

  const hasModelsPayload = models !== undefined;
  const resolvedModels = useMemo(() => models ?? [], [models]);

  const bannerImages = useMemo(() => {
    const withImg = resolvedModels.filter(
      (m) =>
        typeof m.hero_image_url === "string" &&
        m.hero_image_url.trim().length > 0,
    );
    return withImg.slice(0, 3).map((m) => ({
      url: m.hero_image_url!.trim(),
      label: `${displayName} ${m.model_name || m.name || "Model"}`,
    }));
  }, [resolvedModels, displayName]);

  const showHeroSkeleton =
    Boolean(slug) &&
    brandLoading &&
    brand === undefined &&
    resolvedModels.length === 0;

  const showEmptyBrand =
    hasModelsPayload &&
    !brandLoading &&
    brand === null &&
    resolvedModels.length === 0 &&
    !modelsError &&
    !brandError;

  const bothQueriesFailed = brandError && modelsError;

  if (!slug) {
    return (
      <PageFade>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm font-medium text-foreground">Invalid brand URL</p>
          <Button type="button" className="mt-4 px-8" variant="cta" size="lg" asChild>
            <Link href={`/${vehicleType}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Link>
          </Button>
        </div>
      </PageFade>
    );
  }

  return (
    <PageFade>
      {bothQueriesFailed ? (
        <section className={BRAND_PAGE_HERO_SHELL}>
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute right-0 top-0 h-[500px] w-[60%] rounded-full bg-foreground/[0.03] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <ErrorState onRetry={() => void Promise.all([refetchBrand(), refetchModels()])} />
          </div>
        </section>
      ) : showEmptyBrand ? (
        <section className={BRAND_PAGE_HERO_SHELL}>
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute right-0 top-0 h-[500px] w-[60%] rounded-full bg-foreground/[0.03] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
              <p className="font-medium text-foreground">We couldn’t find this brand.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The slug might be outdated or not yet synced to catalogue.
              </p>
              <Button type="button" className="mt-6 px-8" variant="cta" size="lg" asChild>
                <Link href={`/${vehicleType}`}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {copy.backToBrands}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : showHeroSkeleton ? (
        <BrandCatalogueHeroSkeleton />
      ) : (
        <BrandCatalogueHero
          vehicleType={vehicleType}
          brandDisplayName={displayName}
          pageSubtitle={copy.pageSubtitle}
          bannerImages={bannerImages}
          brandSwitcher={
            <BrandPageBrandSwitcher
              vehicleType={vehicleType}
              currentSlug={slug}
              currentDisplayName={displayName}
              brands={brandOptions}
              brandIndexFetching={brandIndexFetching}
              switchBrandLabel={copy.switchBrandLabel}
              allBrandsLabel={copy.backToBrands}
            />
          }
        />
      )}

      {!bothQueriesFailed && !showEmptyBrand && !showHeroSkeleton ? (
        <BrandCatalogueListing
          listings={resolvedModels}
          vehicleType={vehicleType}
          pageBrandSlug={slug}
          displayName={displayName}
          lockedBrandBadge={displayName}
          modelsHeading={copy.modelsHeading}
          emptyCatalogueCopy={copy.emptyModels}
          isInitialLoading={Boolean(modelsLoading && models === undefined)}
          modelsError={modelsError}
          onRetryModels={() => void refetchModels()}
        />
      ) : null}
    </PageFade>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
      <p className="font-medium text-foreground">We couldn’t load this brand hub.</p>
      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Retry
      </Button>
    </div>
  );
}
