"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Loader2,
  Map as MapIcon,
  Receipt,
  Star,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  humanizeSegment,
  modelLabelFor,
} from "@/components/catalogue/BrandModelsPage/model-utils";
import { PageFade } from "@/components/shared/PageFade";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCatalogueModelDetail } from "@/hooks/catalogue/useCatalogueModelDetail";
import { useCatalogueTaxonomy } from "@/hooks/catalogue/useCatalogueTaxonomy";
import { useEmiFromPrincipal } from "@/hooks/prices/useEmiFromPrincipal";
import { useVariantTco } from "@/hooks/prices/useVariantTco";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { SpecGroupRow } from "@/lib/catalogue/types";
import type { CatalogueVariant } from "@/lib/catalogue/types";
import { cn, formatINR, formatIntIn } from "@/lib/utils";
import { getFuelPrices } from "@/services/prices/prices-api";

import { DEFAULT_CITY, PRICING_CITIES } from "./constants";

/** Radix Select value when no city is chosen (`null` in state). */
const ON_ROAD_CITY_UNSET = "__on_road_city_unset__";

type ModelDetailPageProps = {
  brandSlug: string;
  modelSlug: string;
};

function imageUrlFrom(row: Record<string, unknown>): string | null {
  const u =
    row.url ??
    row.src ??
    row.image_url ??
    row.hero_image_url ??
    row.thumbnail_url;
  return typeof u === "string" && u.trim() ? u.trim() : null;
}

function findSpec(specGroups: SpecGroupRow[], needles: string[]): string | null {
  const lower = needles.map((n) => n.toLowerCase());
  for (const g of specGroups) {
    for (const s of g.specs) {
      const k = `${s.display_name} ${s.key}`.toLowerCase();
      if (lower.some((n) => k.includes(n))) return s.value;
    }
  }
  return null;
}

function variantFuelKey(v: CatalogueVariant): string {
  const raw = String(v.fuel_type ?? "").toLowerCase();
  if (/electric|ev\b|battery/.test(raw)) return "electric";
  if (raw.includes("cng")) return "cng";
  if (raw.includes("diesel")) return "diesel";
  if (raw.includes("petrol") || raw.includes("gasoline")) return "petrol";
  return "other";
}

function groupVariantsByFuel(variants: CatalogueVariant[]) {
  const map = new Map<string, CatalogueVariant[]>();
  for (const v of variants) {
    const k = variantFuelKey(v);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(v);
  }
  const order = ["diesel", "petrol", "cng", "electric", "other"];
  return order.filter((k) => map.has(k)).map((k) => ({ fuel: k, items: map.get(k)! }));
}

/** Fixed site header (~64–88px) — used so anchor scroll lands below it. */
const HEADER_SCROLL_OFFSET_PX = 96;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function FloatingDock() {
  return (
    <nav
      aria-label="Quick links"
      className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex lg:right-6"
    >
      <Button
        size="icon"
        variant="secondary"
        className="h-11 w-11 border border-primary/35 bg-card/95 text-primary shadow-lg backdrop-blur-md hover:border-primary/50 hover:bg-primary/5 [&_svg]:text-primary"
        type="button"
        title="Price, EMI & compare"
        aria-label="Scroll to price, EMI and compare section"
        onClick={() => scrollToSection("finance-strip")}
      >
        <Wallet className="h-4 w-4 shrink-0" aria-hidden />
      </Button>
    </nav>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function ModelDetailPage({ brandSlug, modelSlug }: ModelDetailPageProps) {
  const slugBrand = decodeURIComponent(brandSlug);
  const slugModel = decodeURIComponent(modelSlug);

  const detailQuery = useCatalogueModelDetail(slugBrand, slugModel);
  const taxonomyQuery = useCatalogueTaxonomy("car", {
    enabled: detailQuery.isSuccess,
  });

  const data = detailQuery.data;
  /** City picked in the hero “on-road” flow; TCO API runs only when this is set. */
  const [tcoCity, setTcoCity] = useState<string | null>(null);
  const [onRoadPanelOpen, setOnRoadPanelOpen] = useState(false);
  const [thumbIndex, setThumbIndex] = useState(0);

  const listing = data?.listing;
  const variants = useMemo(() => data?.variants ?? [], [data?.variants]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!variants.length) {
      setSelectedKey(null);
      return;
    }
    setSelectedKey((prev) => {
      if (prev && variants.some((v) => String(v.slug ?? v.id) === prev)) return prev;
      return String(variants[0]?.slug ?? variants[0]?.id ?? "");
    });
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    const k = selectedKey;
    return (
      variants.find((v) => String(v.slug ?? v.id) === k) ?? variants[0] ?? null
    );
  }, [variants, selectedKey]);

  const variantId = String(selectedVariant?.id ?? "").trim();

  const fuelGroups = useMemo(() => groupVariantsByFuel(variants), [variants]);
  const [fuelTab, setFuelTab] = useState<string>("diesel");
  useEffect(() => {
    if (fuelGroups.length && !fuelGroups.some((g) => g.fuel === fuelTab)) {
      setFuelTab(fuelGroups[0]!.fuel);
    }
  }, [fuelGroups, fuelTab]);

  const tcoQuery = useVariantTco(variantId || undefined, tcoCity ?? undefined, {
    enabled: Boolean(variantId && tcoCity && detailQuery.isSuccess),
  });

  const fuelCity = tcoCity ?? DEFAULT_CITY;
  const emiQuery = useEmiFromPrincipal(tcoQuery.data?.purchase_price, {
    enabled: tcoQuery.isSuccess,
  });

  const fuelRowsQuery = useApiQuery<unknown[]>(
    () => getFuelPrices(fuelCity),
    [fuelCity],
    { enabled: Boolean(fuelCity && detailQuery.isSuccess) },
  );

  const specKeyLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of taxonomyQuery.data?.specs ?? []) {
      const k = s.canonical_key?.toLowerCase();
      if (k) m.set(k, s.display_name);
    }
    return m;
  }, [taxonomyQuery.data]);

  const heroTitle = listing
    ? `${humanizeSegment(String(listing.brand_name ?? slugBrand))} ${modelLabelFor(listing)}`
    : humanizeSegment(slugModel);

  const heroImages = useMemo(() => {
    const urls: string[] = [];
    const imgs = data?.modelImages ?? [];
    for (const row of imgs) {
      const u = imageUrlFrom(row as Record<string, unknown>);
      if (u) urls.push(u);
    }
    const hero = listing?.hero_image_url;
    if (typeof hero === "string" && hero && !urls.includes(hero)) urls.unshift(hero);
    if (!urls.length) urls.push("/icons/icon-192.png");
    return urls;
  }, [data?.modelImages, listing]);

  const activeHero = heroImages[Math.min(thumbIndex, heroImages.length - 1)] ?? "";

  const reviewCount = data?.reviews?.length ?? 0;
  const ratingFromApi =
    typeof data?.details?.rating === "number" ? (data.details.rating as number) : 4.2;

  const exPrice =
    selectedVariant?.ex_showroom_price ??
    selectedVariant?.min_price ??
    listing?.starting_price ??
    listing?.min_price;

  if (detailQuery.isLoading || !data) {
    return (
      <PageFade>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-64" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Skeleton className="aspect-[16/10] rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </PageFade>
    );
  }

  if (detailQuery.isError) {
    return (
      <PageFade>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Could not load this model</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Check the URL or browse brands from the cars hub.
          </p>
          <Button asChild className="mt-8">
            <Link href="/cars">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to cars
            </Link>
          </Button>
        </div>
      </PageFade>
    );
  }

  return (
    <PageFade>
      <FloatingDock />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        {/* Top: gallery + details (left) · variants + specs (right) */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div
              className={cn(
                "relative overflow-hidden rounded-3xl border border-border/80 bg-muted/30",
                "ring-1 ring-foreground/[0.04] dark:bg-card/40 dark:ring-white/[0.06]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeHero}
                alt={heroTitle}
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 rounded-lg border border-border/60 bg-background/90 px-2 py-1 text-[10px] font-medium backdrop-blur-sm sm:text-xs">
                Gallery
              </div>
            </div>
            {heroImages.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {heroImages.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setThumbIndex(i)}
                    className={cn(
                      "h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-16 sm:w-24",
                      i === thumbIndex
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent opacity-80 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-8 space-y-6">
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {heroTitle}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {selectedVariant
                  ? String(
                      selectedVariant.variant_name ??
                        selectedVariant.name ??
                        "Variant",
                    )
                  : `${modelLabelFor(listing!)} — India`}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{ratingFromApi.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({reviewCount.toLocaleString("en-IN")} reviews)
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                >
                  In stock — most cities
                </Badge>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm dark:bg-card/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ex-showroom
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground">
                  {typeof exPrice === "number" && exPrice > 0
                    ? formatINR(exPrice)
                    : "Price on request"}
                </p>

                {tcoQuery.isSuccess && tcoQuery.data && !onRoadPanelOpen ? (
                  <div className="mt-4 rounded-xl border border-border/60 bg-muted/25 p-4 dark:bg-background/40">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      On-road · {tcoQuery.data.city}
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">
                      {formatINR(tcoQuery.data.purchase_price)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Indicative drive-away for this variant. Open details for the full{" "}
                      {tcoQuery.data.years}-year breakdown.
                    </p>
                    <Button
                      variant="ghost"
                      type="button"
                      className="mt-2 h-auto px-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/90"
                      onClick={() => setOnRoadPanelOpen(true)}
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      Show full breakdown
                    </Button>
                  </div>
                ) : null}

                {!onRoadPanelOpen && !(tcoQuery.isSuccess && tcoQuery.data) ? (
                  <div className="mt-5">
                    <Button
                      variant="primary"
                      type="button"
                      className="h-12 w-full sm:max-w-sm"
                      onClick={() => setOnRoadPanelOpen(true)}
                    >
                      <MapIcon className="h-4 w-4" aria-hidden />
                      Check on-road price
                    </Button>
                  </div>
                ) : null}

                {onRoadPanelOpen ? (
                  <div className="mt-5 space-y-4 border-t border-border/50 pt-5">
                    <div>
                      <label
                        htmlFor="on-road-city"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        City for on-road estimate
                      </label>
                      <Select
                        value={tcoCity ?? ON_ROAD_CITY_UNSET}
                        onValueChange={(v) =>
                          setTcoCity(v === ON_ROAD_CITY_UNSET ? null : v)
                        }
                      >
                        <SelectTrigger
                          id="on-road-city"
                          className={cn(
                            "mt-2 h-11 w-full rounded-xl border-border/70 bg-background text-sm font-medium text-foreground",
                            "focus:ring-primary/30",
                          )}
                        >
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ON_ROAD_CITY_UNSET}>
                            Select city
                          </SelectItem>
                          {PRICING_CITIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!tcoCity ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Choose a city to load an on-road estimate and 5-year cost breakdown for
                          the selected variant.
                        </p>
                      ) : null}
                    </div>

                    {tcoCity ? (
                      <>
                        {tcoQuery.isFetching ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                            Loading estimate for {tcoCity}…
                          </div>
                        ) : null}
                        {tcoQuery.isError ? (
                          <p className="text-sm text-destructive">
                            Could not load on-road pricing. Try another city or check back later.
                          </p>
                        ) : null}
                        {tcoQuery.isSuccess && tcoQuery.data ? (
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                On-road (est.) · {tcoQuery.data.city}
                              </p>
                              <p className="mt-1 font-display text-2xl font-bold text-foreground">
                                {formatINR(tcoQuery.data.purchase_price)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Modelled drive-away in {tcoQuery.data.city}. Totals below are over{" "}
                                {tcoQuery.data.years} years at{" "}
                                {formatIntIn(tcoQuery.data.km_per_year)} km/year.
                              </p>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:bg-background/35">
                              <p className="text-xs font-semibold text-foreground">
                                Ownership cost breakdown
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Fuel, insurance, maintenance, and depreciation — indicative only.
                              </p>
                              <dl className="mt-3 space-y-2.5 text-sm">
                                {(
                                  [
                                    ["Fuel", tcoQuery.data.fuel_cost],
                                    ["Insurance", tcoQuery.data.insurance_cost],
                                    ["Maintenance", tcoQuery.data.maintenance_cost],
                                    ["Depreciation", tcoQuery.data.depreciation],
                                  ] as const
                                ).map(([label, value]) => (
                                  <div
                                    key={label}
                                    className="flex justify-between gap-4 border-b border-border/40 py-1 last:border-0"
                                  >
                                    <dt className="text-muted-foreground">{label}</dt>
                                    <dd className="font-medium tabular-nums text-foreground">
                                      {formatINR(value)}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                              <div className="mt-3 flex justify-between gap-4 border-t border-border/60 pt-3 text-sm font-semibold">
                                <span>Total ({tcoQuery.data.years} yrs)</span>
                                <span className="tabular-nums">
                                  {formatINR(tcoQuery.data.total_cost)}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Cost per km (approx.): ₹{formatIntIn(tcoQuery.data.cost_per_km)}/km
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : null}

                    <Button
                      variant="ghost"
                      type="button"
                      className="h-auto w-full justify-center py-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setOnRoadPanelOpen(false)}
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                      Hide on-road details
                    </Button>
                  </div>
                ) : null}

                <div className="mt-6 border-t border-border/60 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    At a glance
                  </p>
                  <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    Dimensions, performance & safety
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expand a section for headline figures. Full technical data is in{" "}
                    <span className="font-medium text-foreground">Specifications</span> on the
                    right.
                  </p>
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="insight-dimensions"
                    className="mt-3 overflow-hidden rounded-xl border border-border/50 bg-muted/15 dark:bg-background/20"
                  >
                    <AccordionItem
                      value="insight-dimensions"
                      className="border-border/50 px-3 last:border-b-0"
                    >
                      <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline hover:text-primary [&[data-state=open]]:text-primary">
                        Dimensions
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground">
                        <dl className="space-y-2.5 pb-3 pl-0.5 text-sm">
                          {[
                            ["Length", findSpec(data.specGroups, ["length", "overall"])],
                            ["Width", findSpec(data.specGroups, ["width"])],
                            ["Wheelbase", findSpec(data.specGroups, ["wheelbase"])],
                            ["Height", findSpec(data.specGroups, ["height"])],
                          ].map(([label, val]) => (
                            <div
                              key={String(label)}
                              className="flex justify-between gap-4 border-b border-border/30 py-1.5 last:border-0"
                            >
                              <dt className="text-muted-foreground">{label}</dt>
                              <dd className="text-right font-medium tabular-nums">
                                {val && String(val).trim() && val !== "—" ? val : "—"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem
                      value="insight-performance"
                      className="border-border/50 px-3 last:border-b-0"
                    >
                      <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline hover:text-primary [&[data-state=open]]:text-primary">
                        Performance
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground">
                        <ul className="space-y-2.5 pb-3 pl-0.5 text-sm">
                          {(
                            [
                              ["Power", findSpec(data.specGroups, ["power", "bhp", "ps"])],
                              ["Torque", findSpec(data.specGroups, ["torque", "nm"])],
                              ["Fuel tank", findSpec(data.specGroups, ["tank", "fuel tank"])],
                              [
                                "Mileage",
                                findSpec(data.specGroups, ["mileage", "kmpl", "fuel economy"]),
                              ],
                            ] as const
                          ).map(([label, val]) => (
                            <li
                              key={label}
                              className="flex justify-between gap-4 border-b border-border/30 py-1.5 last:border-0"
                            >
                              <span className="text-muted-foreground">{label}</span>
                              <span className="text-right font-medium">{val ?? "—"}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem
                      value="insight-safety"
                      className="border-border/50 px-3 last:border-b-0"
                    >
                      <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline hover:text-primary [&[data-state=open]]:text-primary">
                        Safety
                      </AccordionTrigger>
                      <AccordionContent className="text-foreground">
                        <p className="pb-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {findSpec(data.specGroups, ["ncap", "star", "rating"]) ??
                            "Refer to Global NCAP / Bharat NCAP results for the latest trim."}
                        </p>
                        <div className="space-y-3 pb-2">
                          <div>
                            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                              <span>Adult protection (illustrative)</span>
                              <span className="font-medium text-foreground">82%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className="h-full w-[82%] rounded-full bg-primary" />
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                              <span>Child protection (illustrative)</span>
                              <span className="font-medium text-foreground">74%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div className="h-full w-[74%] rounded-full bg-primary/80" />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-12 lg:gap-14">
            <section id="variants" className="scroll-mt-24">
              <SectionTitle eyebrow="Variants" title="Choose your trim" />
              {fuelGroups.length ? (
                <Tabs value={fuelTab} onValueChange={setFuelTab} className="w-full">
                  <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1">
                    {fuelGroups.map((g) => (
                      <TabsTrigger
                        key={g.fuel}
                        value={g.fuel}
                        className="capitalize data-[state=active]:shadow-md"
                      >
                        {g.fuel}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {fuelGroups.map((g) => (
                    <TabsContent key={g.fuel} value={g.fuel} className="mt-0">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {g.items.map((v, idx) => {
                          const key = String(v.slug ?? v.id ?? idx);
                          const name = String(v.variant_name ?? v.name ?? key);
                          const price = v.ex_showroom_price ?? v.min_price;
                          const selected = selectedKey === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedKey(key)}
                              className={cn(
                                "min-w-[148px] max-w-[200px] shrink-0 rounded-xl border px-3 py-2.5 text-left transition-all sm:min-w-[156px] sm:max-w-[210px]",
                                selected
                                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/35"
                                  : "border-border/80 bg-card/80 hover:border-primary/40 dark:bg-card/60",
                              )}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <p className="text-xs font-semibold leading-snug sm:text-[13px]">{name}</p>
                                {idx === g.items.length - 1 ? (
                                  <Badge className="h-5 shrink-0 rounded px-1.5 py-0 text-[9px] leading-none sm:text-[10px]">
                                    Top pick
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-1.5 text-sm font-bold tabular-nums text-primary sm:text-base">
                                {typeof price === "number" && price > 0
                                  ? formatINR(price)
                                  : "—"}
                              </p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground capitalize leading-tight sm:text-xs">
                                {String(v.fuel_type ?? g.fuel)} · variant
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No variants returned for this model.
                </p>
              )}
            </section>

            <section className="min-w-0">
              <SectionTitle eyebrow="Details" title="Specifications & features" />
              <Tabs defaultValue="specs" className="w-full">
                <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1">
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="colors">Colours</TabsTrigger>
                </TabsList>
                <TabsContent value="specs" className="mt-0">
                  {data.specGroups.length ? (
                    <Card className="overflow-hidden border-border/80 bg-card/90 dark:bg-card/70">
                      <CardContent className="p-0">
                        <Accordion
                          type="single"
                          collapsible
                          defaultValue="spec-group-0"
                          className="w-full"
                        >
                          {data.specGroups.map((g, i) => (
                            <AccordionItem
                              key={`${g.group}-${i}`}
                              value={`spec-group-${i}`}
                              className="border-border/60 px-4 last:border-b-0"
                            >
                              <AccordionTrigger className="py-3.5 text-base font-semibold capitalize text-foreground hover:no-underline hover:text-primary [&[data-state=open]]:text-primary">
                                {humanizeSegment(g.group.replace(/_/g, " "))}
                              </AccordionTrigger>
                              <AccordionContent className="text-foreground">
                                <div className="space-y-0 border-t border-border/50 pt-1">
                                  {g.specs.map((row) => (
                                    <div
                                      key={`${g.group}-${row.key}`}
                                      className="flex justify-between gap-4 border-b border-border/40 py-2.5 text-sm last:border-0"
                                    >
                                      <span className="text-muted-foreground">
                                        {specKeyLabel.get(row.key.toLowerCase()) ??
                                          row.display_name}
                                      </span>
                                      <span className="text-right font-medium text-foreground">
                                        {row.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Detailed spec groups will appear when the API includes `spec_groups`.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="features" className="mt-0">
                  {data.featureGroups[0]?.features?.length ? (
                    <div className="space-y-4">
                      {data.featureGroups[0]!.features.map((f) => (
                        <Card
                          key={f.key}
                          className="border-border/80 bg-card/90 dark:bg-card/60"
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base capitalize">
                              {f.display_name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="grid gap-1 text-sm sm:grid-cols-2">
                              {Object.entries(f.value).map(([k, v]) => (
                                <li key={k} className="flex gap-2">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                  <span>
                                    <span className="font-medium">{k}</span>: {v}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Feature matrices populate from variant payloads when available.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="colors" className="mt-0">
                  <div className="flex flex-wrap gap-3">
                    {data.modelColors.length ? (
                      data.modelColors.map((c, i) => {
                        const rec = c as Record<string, unknown>;
                        const name = String(rec.name ?? rec.label ?? `Colour ${i + 1}`);
                        const hex = String(rec.hex ?? rec.color_code ?? "#999");
                        return (
                          <div
                            key={`${name}-${i}`}
                            className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2"
                          >
                            <span
                              className="h-8 w-8 rounded-full border border-border shadow-inner"
                              style={{ backgroundColor: hex }}
                              title={name}
                            />
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Colours not listed for this model.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>

        {/* Finance + compare (one visual group) */}
        <section id="finance-strip" className="mt-12 scroll-mt-24">
          <SectionTitle
            eyebrow="Finance & compare"
            title="Price, compare & EMI"
            subtitle="Indicative numbers for your city and a path to variants — not a substitute for a test drive."
          />
          <div className="grid gap-4 md:grid-cols-2 md:items-stretch md:gap-5">
            <Card
              id="emi-calculator"
              className="flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border-primary/25 bg-card/90 shadow-[0_8px_32px_-14px_rgba(15,23,42,0.1)] ring-1 ring-primary/10"
            >
              <CardHeader className="border-b border-primary/10 bg-primary/[0.04] pb-3 dark:bg-primary/[0.07]">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Estimate
                </p>
                <CardTitle className="pt-1 text-base text-foreground">Price & EMI</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">
                  Ex-showroom, on-road (when available), and indicative EMI for the selected
                  variant.
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Ex-showroom</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {typeof exPrice === "number" && exPrice > 0 ? formatINR(exPrice) : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">On-road (est.)</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {tcoQuery.isLoading ? (
                      <Loader2 className="inline h-4 w-4 animate-spin text-primary" />
                    ) : typeof tcoQuery.data?.purchase_price === "number" ? (
                      formatINR(tcoQuery.data.purchase_price)
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">EMI from</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {emiQuery.data?.monthly_emi != null
                      ? `${formatINR(emiQuery.data.monthly_emi)}/mo`
                      : "—"}
                  </span>
                </div>
                <Button variant="primary" className="mt-auto h-11 w-full" type="button">
                  <Receipt className="h-4 w-4" aria-hidden />
                  Calculate EMI
                </Button>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-primary/25 bg-card/90 shadow-[0_8px_32px_-14px_rgba(15,23,42,0.1)] ring-1 ring-primary/10">
              <CardHeader className="border-b border-primary/10 bg-primary/[0.04] pb-3 dark:bg-primary/[0.07]">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Shortlist
                </p>
                <CardTitle className="pt-1 text-base text-foreground">Compare & shortlist</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">
                  Start from the variant you care about, then widen the comparison.
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 pt-4">
                <Button
                  variant="outline"
                  className="h-11 w-full shrink-0 justify-center border-primary/70 font-semibold text-primary shadow-[0_2px_12px_-4px_rgba(15,23,42,0.18)] hover:border-primary hover:bg-primary/10 hover:text-primary"
                  type="button"
                  onClick={() => scrollToSection("variants")}
                >
                  <GitCompare className="h-4 w-4" aria-hidden />
                  Compare variants
                </Button>
                <ol className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                  {[
                    "Select a trim in the column beside the gallery to anchor pricing.",
                    "Side-by-side matrices and saved shortlists will appear here as they ship.",
                  ].map((line, i) => (
                    <li key={line} className="flex gap-2.5">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-primary/35",
                          "bg-primary/10 text-[11px] font-semibold tabular-nums text-primary dark:bg-primary/15",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-auto border-t border-primary/10 pt-3 text-[11px] leading-relaxed text-muted-foreground">
                  Verify equipment in{" "}
                  <span className="font-semibold text-primary">Specifications</span> before you decide
                  on a variant.
                </p>
              </CardContent>
            </Card>
          </div>

          {fuelRowsQuery.data?.length ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Live fuel prices for {fuelCity} loaded from the pricing API.
            </p>
          ) : null}
        </section>
      </div>
    </PageFade>
  );
}
