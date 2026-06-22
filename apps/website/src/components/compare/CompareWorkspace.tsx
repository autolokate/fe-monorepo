"use client";

import Image from "next/image";
import { Car, CheckCircle2, Plus, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";
import type { CatalogueModel, CatalogueVariant } from "@/lib/catalogue/types";
import {
  compareTrayPrice,
  compareTraySubtitle,
  compareTrayThumb,
  compareTrayTitleLine,
} from "@/lib/catalogue/compare-tray-display";
import type { TaxonomyBundle } from "@/services/taxonomy/taxonomy-api";
import {
  buildCompareRowsForTab,
  type CompareTabId,
} from "@/lib/catalogue/compare-matrix";
import { COMPARE_TABS } from "@/components/compare/constants";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  tab: CompareTabId;
  onTabChange: (t: CompareTabId) => void;
  taxonomy: TaxonomyBundle | undefined;
  orderedVariants: CatalogueVariant[];
  ids: string[];
  /** Hydrated catalogue models (same source as slot cards) for image / list price fallbacks. */
  modelDetailByVariantId: Partial<Record<string, CatalogueModel>>;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAddCar: () => void;
};

export function CompareWorkspace({
  tab,
  onTabChange,
  taxonomy,
  orderedVariants,
  ids,
  modelDetailByVariantId,
  isLoading,
  isError,
  errorMessage,
  onAddCar,
}: Props) {
  const share = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(url);
      toast.success("Comparison link copied");
    } catch {
      toast.message("Could not copy link");
    }
  };

  return (
    <section className="mt-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-start">
        <aside className="space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm ring-1 ring-foreground/[0.03]">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Start your comparison</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Add up to three new-car variants, then switch tabs to focus on specs, features, and safety.
            </p>
          </div>
          <ul className="space-y-2.5 text-sm text-foreground/90">
            {[
              "Detailed specifications",
              "Feature comparison",
              "Safety & ratings",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              type="button"
              variant="default"
              className="w-full"
              onClick={onAddCar}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add a car
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void share()}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share comparison
            </Button>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <Tabs
            value={tab}
            onValueChange={(v) => onTabChange(v as CompareTabId)}
            className="w-full"
          >
            <TabsList className="mb-2 flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-full border border-border/80 bg-card p-1 shadow-sm sm:flex-nowrap [scrollbar-width:thin]">
              {COMPARE_TABS.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className={cn(
                    "gap-2 rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground sm:text-sm",
                    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {COMPARE_TABS.map(({ id }) => (
              <TabsContent key={id} value={id} className="mt-0 outline-none">
                <CompareTableBody
                  tab={id}
                  taxonomy={taxonomy}
                  orderedVariants={orderedVariants}
                  ids={ids}
                  modelDetailByVariantId={modelDetailByVariantId}
                  isLoading={isLoading}
                  isError={isError}
                  errorMessage={errorMessage}
                />
              </TabsContent>
            ))}
          </Tabs>

          <div className="border-t border-border/70 pt-6">
            <p className="max-w-2xl text-[11px] leading-relaxed text-muted-foreground">
              Prices are indicative ex-showroom figures from the catalogue feed; on-road costs vary by city,
              variant, and offers. Always confirm with an authorised dealer before you buy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompareTableBody({
  tab,
  taxonomy,
  orderedVariants,
  ids,
  modelDetailByVariantId,
  isLoading,
  isError,
  errorMessage,
}: {
  tab: CompareTabId;
  taxonomy: TaxonomyBundle | undefined;
  orderedVariants: CatalogueVariant[];
  ids: string[];
  modelDetailByVariantId: Partial<Record<string, CatalogueModel>>;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}) {
  if (ids.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        <div className="flex items-center gap-3 text-muted-foreground/60">
          <Car className="h-10 w-10" aria-hidden />
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-foreground/40 text-foreground">
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </span>
          <Car className="h-10 w-10 scale-x-[-1]" aria-hidden />
        </div>
        <p className="mt-5 font-display text-lg font-semibold text-foreground">
          Add another car to compare
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Once two or three variants are selected, their specs appear here grouped by tab.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-border/80 p-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
        <p className="text-sm font-semibold text-foreground">Could not load comparison</p>
        <p className="mt-2 text-sm text-muted-foreground">{errorMessage ?? "Please try again."}</p>
      </div>
    );
  }

  if (orderedVariants.length < 2) {
    return (
      <div className="rounded-2xl border border-border/80 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
        Loading variant details…
      </div>
    );
  }

  const rows = buildCompareRowsForTab(tab, orderedVariants, taxonomy);

  if (!rows.length) {
    return (
      <p className="rounded-2xl border border-border/80 bg-card/40 px-4 py-10 text-center text-sm text-muted-foreground">
        No rows in this tab for the selected variants.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
      <div
        className={cn(
          "max-h-[min(70vh,36rem)] overflow-auto [scrollbar-width:thin]",
          "overscroll-y-contain",
        )}
      >
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead className="[&_tr]:border-b [&_tr]:border-border">
            <tr className="bg-muted">
              <th className="sticky top-0 left-0 z-30 w-48 min-w-[12rem] bg-muted px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Highlights
              </th>
              {orderedVariants.map((v, vi) => {
                const variantId = String(v.id ?? ids[vi] ?? "").trim();
                const modelRow = variantId ? modelDetailByVariantId[variantId] : undefined;
                const titleLine = compareTrayTitleLine(v, modelRow) || "—";
                const subtitle = compareTraySubtitle(v, modelRow);
                const thumb = compareTrayThumb(v, modelRow);
                const price = compareTrayPrice(v, modelRow);
                const showSubtitle = subtitle && subtitle !== titleLine;
                return (
                  <th
                    key={variantId || `col-${vi}`}
                    className="sticky top-0 z-20 bg-muted px-4 py-4 text-left align-top"
                  >
                    <div className="flex min-h-[8rem] min-w-[10rem] flex-col gap-1.5">
                      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted-foreground/10">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className="object-contain p-1"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Car className="h-6 w-6 text-muted-foreground/35" aria-hidden />
                          </div>
                        )}
                      </div>
                      <span className="font-display text-sm font-semibold leading-snug text-foreground line-clamp-2">
                        {titleLine}
                      </span>
                      {showSubtitle ? (
                        <span className="text-[11px] leading-snug text-muted-foreground line-clamp-2">
                          {subtitle}
                        </span>
                      ) : null}
                      <div className="mt-auto space-y-0.5">
                        {price != null ? (
                          <>
                            <span className="text-xs font-semibold text-primary">{formatINR(price)}</span>
                            <span className="block text-[10px] text-muted-foreground">Ex-showroom</span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">Price on request</span>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.key}
                className={cn(
                  "border-b border-border/80 last:border-b-0",
                  ri % 2 === 0 ? "bg-card" : "bg-background",
                )}
              >
                <td className="sticky left-0 z-10 border-r border-border/60 bg-card px-4 py-3 text-xs font-semibold text-muted-foreground">
                  {row.label}
                </td>
                {row.values.map((cell, ci) => (
                  <td
                    key={`${row.key}-${ci}`}
                    className={cn(
                      "relative z-0 px-4 py-3 text-sm leading-relaxed text-foreground",
                      ri % 2 === 0 ? "bg-card" : "bg-background",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
