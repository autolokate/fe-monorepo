'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import {
  Car,
  Check,
  ChevronDown,
  Droplets,
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CatalogueModel } from '@/lib/catalogue/types';
import type { VehicleCategory } from '@/lib/preferences';
import { cn } from '@/lib/utils';

import { BrandModelCatalogueCard } from './BrandModelCatalogueCard';
import { BrandModelCatalogueListRow } from './BrandModelCatalogueListRow';
import {
  humanizeSegment,
  modelSearchBlob,
  priceHigh,
  priceLow,
  primaryModelKey,
  sortModelLabelKey,
} from './model-utils';

export type BrandCatalogueListingProps = {
  listings: CatalogueModel[];
  vehicleType: VehicleCategory;
  pageBrandSlug: string;
  displayName: string;
  /** Shown inside the funnel badge (normally the resolved brand title). */
  lockedBrandBadge: string;
  modelsHeading: string;
  emptyCatalogueCopy: string;
  isInitialLoading: boolean;
  modelsError: boolean;
  onRetryModels: () => void;
  /** When false, hide the brand chip in the results row (e.g. cross-brand explore). */
  showBrandLockBadge?: boolean;
  /** Optional pagination / footer below the grid. */
  afterListings?: ReactNode | null;
};

type SortMode = 'popular' | 'price-asc' | 'price-desc';

export function BrandCatalogueListing({
  listings,
  vehicleType,
  pageBrandSlug,
  displayName,
  lockedBrandBadge,
  modelsHeading,
  emptyCatalogueCopy,
  isInitialLoading,
  modelsError,
  onRetryModels,
  showBrandLockBadge = true,
  afterListings = null,
}: BrandCatalogueListingProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('popular');
  const [bodyType, setBodyType] = useState('all');
  const [fuelType, setFuelType] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Popover open states for each chip trigger
  const [bodyOpen, setBodyOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const bodyOptions = useMemo(
    () =>
      Array.from(
        new Set(listings.map((r) => String(r.body_type || '').trim()).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [listings],
  );

  const fuelOptions = useMemo(
    () =>
      Array.from(
        new Set(
          listings
            .flatMap((r) =>
              Array.isArray(r.fuel_types) && r.fuel_types.length
                ? r.fuel_types.map((fuel) => String(fuel || '').trim())
                : [String(r.fuel_type || '').trim()],
            )
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [listings],
  );

  const filtered = useMemo(() => {
    let rows = [...listings];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => modelSearchBlob(r, displayName, pageBrandSlug).includes(q));
    }
    if (bodyType !== 'all') {
      rows = rows.filter((r) => String(r.body_type ?? '') === bodyType);
    }
    if (fuelType !== 'all') {
      rows = rows.filter((r) => {
        const options =
          Array.isArray(r.fuel_types) && r.fuel_types.length
            ? r.fuel_types.map((fuel) => String(fuel))
            : [String(r.fuel_type ?? '')];
        return options.includes(fuelType);
      });
    }

    if (sort === 'price-asc') {
      rows.sort(
        (a, b) =>
          priceLow(a) - priceLow(b) ||
          sortModelLabelKey(a, displayName).localeCompare(sortModelLabelKey(b, displayName)),
      );
    } else if (sort === 'price-desc') {
      rows.sort(
        (a, b) =>
          priceHigh(b) - priceHigh(a) ||
          sortModelLabelKey(a, displayName).localeCompare(sortModelLabelKey(b, displayName)),
      );
    } else {
      rows.sort((a, b) =>
        sortModelLabelKey(a, displayName).localeCompare(sortModelLabelKey(b, displayName)),
      );
    }
    return rows;
  }, [listings, query, bodyType, fuelType, sort, displayName, pageBrandSlug]);

  const priceSortLabel =
    sort === 'price-asc'
      ? 'Price: Low to High'
      : sort === 'price-desc'
        ? 'Price: High to Low'
        : null;

  const hasActiveFilters =
    query.trim().length > 0 || bodyType !== 'all' || fuelType !== 'all' || priceSortLabel != null;

  const clearFilters = () => {
    setQuery('');
    setBodyType('all');
    setFuelType('all');
    setSort('popular');
  };

  // Active filter pills (rendered below the filter bar)
  type ActivePill = { id: string; label: string; onClear: () => void };
  const activePills: ActivePill[] = useMemo(() => {
    const out: ActivePill[] = [];
    const q = query.trim();
    if (q) out.push({ id: 'q', label: `“${q}”`, onClear: () => setQuery('') });
    if (bodyType !== 'all')
      out.push({
        id: 'body',
        label: humanizeSegment(bodyType),
        onClear: () => setBodyType('all'),
      });
    if (fuelType !== 'all')
      out.push({
        id: 'fuel',
        label: humanizeSegment(fuelType),
        onClear: () => setFuelType('all'),
      });
    if (priceSortLabel != null)
      out.push({
        id: 'price-sort',
        label: priceSortLabel,
        onClear: () => setSort('popular'),
      });
    return out;
  }, [query, bodyType, fuelType, priceSortLabel]);

  if (modelsError) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="font-medium text-foreground">Models could not be loaded.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void onRetryModels()}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Retry models
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <h2 className="mb-6 text-xl font-semibold text-foreground">{modelsHeading}</h2>

      <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Filters &amp; sort
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              Clear all
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Brand or model name"
              className="h-10 w-full rounded-full border-border/70 bg-background pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
              aria-label="Search by brand or model name"
              disabled={isInitialLoading}
            />
          </div>

          {/* Body Type chip */}
          <Popover open={bodyOpen} onOpenChange={setBodyOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={isInitialLoading}
                aria-label="Filter by body type"
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
                  bodyType !== 'all'
                    ? 'border-foreground/40 bg-foreground/[0.06] text-foreground'
                    : 'border-border/70 text-foreground hover:border-foreground/30 hover:bg-foreground/5',
                  bodyOpen && 'border-foreground/50 ring-2 ring-foreground/10',
                )}
              >
                <Car className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span>{bodyType === 'all' ? 'Body Type' : humanizeSegment(bodyType)}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-muted-foreground transition',
                    bodyOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-64 p-2">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Body type
              </div>
              <ul className="max-h-72 overflow-y-auto py-1">
                <FilterOption
                  label="All body types"
                  selected={bodyType === 'all'}
                  onSelect={() => {
                    setBodyType('all');
                    setBodyOpen(false);
                  }}
                />
                {bodyOptions.map((o) => (
                  <FilterOption
                    key={o}
                    label={humanizeSegment(o)}
                    selected={bodyType === o}
                    onSelect={() => {
                      setBodyType(o);
                      setBodyOpen(false);
                    }}
                  />
                ))}
                {bodyOptions.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-muted-foreground">
                    No body types available
                  </li>
                ) : null}
              </ul>
            </PopoverContent>
          </Popover>

          {/* Fuel Type chip */}
          <Popover open={fuelOpen} onOpenChange={setFuelOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={isInitialLoading}
                aria-label="Filter by fuel type"
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
                  fuelType !== 'all'
                    ? 'border-foreground/40 bg-foreground/[0.06] text-foreground'
                    : 'border-border/70 text-foreground hover:border-foreground/30 hover:bg-foreground/5',
                  fuelOpen && 'border-foreground/50 ring-2 ring-foreground/10',
                )}
              >
                <Droplets className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span>{fuelType === 'all' ? 'Fuel Type' : humanizeSegment(fuelType)}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-muted-foreground transition',
                    fuelOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-64 p-2">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Fuel type
              </div>
              <ul className="max-h-72 overflow-y-auto py-1">
                <FilterOption
                  label="All fuel types"
                  selected={fuelType === 'all'}
                  onSelect={() => {
                    setFuelType('all');
                    setFuelOpen(false);
                  }}
                />
                {fuelOptions.map((o) => (
                  <FilterOption
                    key={o}
                    label={humanizeSegment(o)}
                    selected={fuelType === o}
                    onSelect={() => {
                      setFuelType(o);
                      setFuelOpen(false);
                    }}
                  />
                ))}
                {fuelOptions.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-muted-foreground">
                    No fuel types available
                  </li>
                ) : null}
              </ul>
            </PopoverContent>
          </Popover>

          {/* Price Range chip — sorts by price low→high or high→low */}
          <Popover open={priceOpen} onOpenChange={setPriceOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={isInitialLoading}
                aria-label="Sort by price range"
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
                  priceSortLabel
                    ? 'border-foreground/40 bg-foreground/[0.06] text-foreground'
                    : 'border-border/70 text-foreground hover:border-foreground/30 hover:bg-foreground/5',
                  priceOpen && 'border-foreground/50 ring-2 ring-foreground/10',
                )}
              >
                <Tag className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span>{priceSortLabel ?? 'Price Range'}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-muted-foreground transition',
                    priceOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-60 p-2">
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Price range
              </div>
              <ul className="py-1">
                <FilterOption
                  label="Low to High"
                  selected={sort === 'price-asc'}
                  onSelect={() => {
                    setSort('price-asc');
                    setPriceOpen(false);
                  }}
                />
                <FilterOption
                  label="High to Low"
                  selected={sort === 'price-desc'}
                  onSelect={() => {
                    setSort('price-desc');
                    setPriceOpen(false);
                  }}
                />
              </ul>
              {priceSortLabel != null ? (
                <div className="border-border/60 mt-1 flex justify-end border-t pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSort('popular');
                      setPriceOpen(false);
                    }}
                    className="text-[11px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
              ) : null}
            </PopoverContent>
          </Popover>
        </div>

        {activePills.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activePills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={pill.onClear}
                className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-foreground/15 bg-foreground/[0.04] pl-3 pr-2 text-xs font-medium text-foreground transition hover:border-foreground/30 hover:bg-foreground/[0.08]"
              >
                <span>{pill.label}</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-muted-foreground transition group-hover:bg-foreground group-hover:text-background">
                  <X className="h-2.5 w-2.5" aria-hidden />
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mb-5 mt-5 flex flex-wrap items-center gap-2 text-sm">
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-muted-foreground">
          Showing{' '}
          <span className="font-semibold tabular-nums text-foreground">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'model' : 'models'}
        </span>
        {showBrandLockBadge && lockedBrandBadge ? (
          <Badge
            variant="secondary"
            className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[11px] font-medium text-primary"
          >
            {lockedBrandBadge} ×
          </Badge>
        ) : null}

        <div className="ml-auto flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => setView('grid')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition',
              view === 'grid'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => setView('list')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition',
              view === 'list'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div id="catalogue-grid" className="scroll-mt-24">
        {isInitialLoading ? (
          <BrandCatalogueGridSkeleton />
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
            {emptyCatalogueCopy}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <Car className="h-10 w-10 text-muted-foreground/50" aria-hidden />
            <p className="mt-4 text-lg font-semibold text-foreground">No models match</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try a different search term, or reset filters to see the full catalogue.
            </p>
            {hasActiveFilters ? (
              <Button type="button" className="mt-6" variant="secondary" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : view === 'grid' ? (
          <ul className="grid list-none gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filtered.map((model, idx) => (
              <BrandModelCatalogueCard
                key={primaryModelKey(model)}
                model={model}
                idx={idx}
                vehicleType={vehicleType}
                pageBrandSlug={pageBrandSlug}
                displayFallback={displayName}
              />
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((model, idx) => (
              <BrandModelCatalogueListRow
                key={primaryModelKey(model)}
                model={model}
                idx={idx}
                vehicleType={vehicleType}
                pageBrandSlug={pageBrandSlug}
                displayFallback={displayName}
              />
            ))}
          </ul>
        )}
      </div>
      {afterListings}
    </section>
  );
}

function FilterOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
          selected
            ? 'bg-foreground/[0.08] font-medium text-foreground'
            : 'text-foreground hover:bg-foreground/[0.04]',
        )}
      >
        <span className="truncate">{label}</span>
        {selected ? <Check className="h-3.5 w-3.5 text-foreground" aria-hidden /> : null}
      </button>
    </li>
  );
}

export function BrandCatalogueGridSkeleton() {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.03]"
        >
          <div className="aspect-[16/10] animate-pulse bg-muted/50" />
          <div className="space-y-2 border-border/60 border-t px-3.5 py-3 sm:px-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-muted/55" />
              <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
                <div className="h-2.5 w-20 animate-pulse rounded bg-muted/45" />
                <div className="h-4 w-[70%] animate-pulse rounded bg-muted/55" />
                <div className="h-2.5 w-full animate-pulse rounded bg-muted/40" />
              </div>
            </div>
            <div className="border-border/60 border-t pt-3">
              <div className="h-2 w-24 animate-pulse rounded bg-muted/40" />
              <div className="mt-1 h-6 w-32 animate-pulse rounded bg-muted/55" />
            </div>
          </div>
          <div className="flex gap-2 border-border/60 border-t px-3.5 py-2.5 sm:px-4 sm:py-3">
            <div className="h-8 min-h-8 flex-1 animate-pulse rounded-full bg-muted/50" />
            <div className="h-8 min-h-8 flex-1 animate-pulse rounded-full bg-muted/35" />
          </div>
        </li>
      ))}
    </ul>
  );
}
