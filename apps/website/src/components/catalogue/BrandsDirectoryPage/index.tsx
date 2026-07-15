'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Building2, Eye, Info, LayoutGrid, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { PageFade } from '@/components/shared/PageFade';
import { useCatalogueBrandsForCategory } from '@/hooks/catalogue';
import type { VehicleCategory } from '@/lib/preferences';
import { cn } from '@/lib/utils';
import { BRAND_BACKGROUND, BRANDS_DIRECTORY_COPY } from './constants';

export interface BrandsDirectoryPageProps {
  /** UI vehicle category — drives copy, filter, and brand-link routing. */
  vehicleType: VehicleCategory;
}

/**
 * "/{vehicleType}" landing page. Powered by `GET /v1/catalogue/brands` via
 * {@link useCatalogueBrandsForCategory} (dedupe, sort, and optional
 * `vehicle_category` filter). Renders a searchable grid of brand cards.
 */
export function BrandsDirectoryPage({ vehicleType }: BrandsDirectoryPageProps) {
  const copy = BRANDS_DIRECTORY_COPY[vehicleType];
  const {
    brandOptions: categoryFilteredBrands,
    isLoading,
    isError,
    refetch,
  } = useCatalogueBrandsForCategory(vehicleType);

  const [brandQuery, setBrandQuery] = useState('');

  const filteredBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return categoryFilteredBrands;
    return categoryFilteredBrands.filter((b) => b.name.toLowerCase().includes(q));
  }, [categoryFilteredBrands, brandQuery]);

  return (
    <PageFade>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <Image
          src={BRAND_BACKGROUND.light}
          alt=""
          fill
          priority
          className="theme-light-only object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
        <Image
          src={BRAND_BACKGROUND.dark}
          alt=""
          fill
          priority
          className="theme-dark-only object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-background/55 dark:bg-background/70"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              {copy.eyebrow}
            </p>
            <h1 className="font-display mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-tight">
              {copy.headlinePrefix}{' '}
              <span className="text-primary underline decoration-primary/40 decoration-2 underline-offset-4">
                {copy.headlineAccent}
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-base">
              {copy.description}
            </p>

            <div className="mt-6 flex items-center justify-center">
              <Button size="lg" className="gap-2 px-7" asChild>
                <Link href={copy.primaryCta.href}>
                  <LayoutGrid className="h-4 w-4" />
                  {copy.primaryCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Finder ──────────────────────────────────────────────── */}
      <div className="bg-background">
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mx-auto mb-10 max-w-lg">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.searchLabel}
            </p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="text"
                value={brandQuery}
                onChange={(e) => {
                  setBrandQuery(e.target.value);
                }}
                placeholder={copy.searchPlaceholder}
                aria-label="Filter brands by name"
                className={cn(
                  'h-12 w-full rounded-2xl border border-border/60 bg-card pl-11 pr-4 text-sm text-foreground shadow-sm ring-1 ring-border/40',
                  'placeholder:text-muted-foreground/60',
                  'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30',
                )}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                Showing{' '}
                <span className="font-semibold tabular-nums text-foreground">
                  {filteredBrands.length}
                </span>{' '}
                {filteredBrands.length === categoryFilteredBrands.length
                  ? `brand${filteredBrands.length === 1 ? '' : 's'}`
                  : `of ${categoryFilteredBrands.length.toString()} brand${
                      categoryFilteredBrands.length === 1 ? '' : 's'
                    }`}
              </span>
            </div>
          </div>

          {/* States */}
          {isLoading ? (
            <BrandsGridSkeleton />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : filteredBrands.length === 0 ? (
            <EmptyState
              title={copy.emptyTitle}
              query={brandQuery.trim()}
              onClear={() => {
                setBrandQuery('');
              }}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {filteredBrands.map((brand) => (
                <li key={brand.slug} className="min-h-0">
                  <Link
                    href={`/${vehicleType}/${encodeURIComponent(brand.slug)}`}
                    className={cn(
                      'group relative flex h-full flex-col items-center gap-5 overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 text-center shadow-app-soft ring-1 ring-foreground/[0.04] backdrop-blur-md transition duration-300',
                      'hover:-translate-y-0.5 hover:border-primary/35 motion-reduce:hover:translate-y-0',
                    )}
                  >
                    {/* Soft primary halo in the corner — same idiom as the
                        home-page marketplace cards. Reads as ambient depth in
                        light mode and as a faint glow in dark mode. */}
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/[0.08] blur-3xl"
                      aria-hidden
                    />

                    {/* App-icon style logo tile — the BrandLogo fills the
                        entire white plate so wordmarks read at full width. */}
                    <BrandLogo
                      brand={brand.name}
                      size={80}
                      className="relative rounded-2xl border-0 shadow-sm ring-1 ring-border/40"
                    />

                    <div className="relative flex flex-col gap-1.5">
                      <h3 className="text-lg font-bold text-foreground">{brand.name}</h3>
                      <p className="text-xs font-medium text-muted-foreground">
                        View available models
                      </p>
                    </div>

                    {/* Pinned to the bottom so cards line up regardless of name length. */}
                    <Button
                      asChild
                      variant="default"
                      size="default"
                      className="relative mt-auto w-full"
                    >
                      <span>
                        <Eye className="h-4 w-4" aria-hidden />
                        View inventory
                      </span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageFade>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Subcomponents — co-located because they are not used anywhere else.
 * ──────────────────────────────────────────────────────────────────── */

function BrandsGridSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex h-[260px] flex-col items-center gap-5 overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 shadow-app-soft ring-1 ring-foreground/[0.04] backdrop-blur-md"
        >
          <div className="h-20 w-20 animate-pulse rounded-2xl bg-muted/60" />
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted/60" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
          </div>
          <div className="h-9 w-full animate-pulse rounded-md bg-muted/40" />
        </li>
      ))}
    </ul>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <p className="font-medium text-foreground">We could not load the brand directory.</p>
      <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Retry
      </Button>
    </div>
  );
}

function EmptyState({
  title,
  query,
  onClear,
}: {
  title: string;
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <p className="font-medium text-foreground">
        {query ? `${title} \u201C${query}\u201D` : title}
      </p>
      {query ? (
        <Button
          type="button"
          variant="link"
          className="mt-2 h-auto p-0 text-primary"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear search
        </Button>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          The catalogue is being populated. Please check back soon.
        </p>
      )}
    </div>
  );
}
