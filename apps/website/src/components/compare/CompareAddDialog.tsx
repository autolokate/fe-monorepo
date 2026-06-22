"use client";

import { useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import type { CompareModelSegment } from "@/lib/catalogue/compare-url";
import {
  compareSegmentFromModel,
  compareSegmentFromVariant,
  resolveCatalogueModelToVariantId,
} from "@/lib/catalogue/resolve-default-variant";
import type { CatalogueSearchHit } from "@/services/catalogue/catalogue-api";
import { useCatalogueSearchForCompare } from "@/hooks/catalogue/useCatalogueSearchForCompare";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COMPARE_MAX_SLOTS } from "@/components/compare/constants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: string[];
  onPickVariant: (variantId: string, meta?: CompareModelSegment) => void;
};

function hitLabel(hit: CatalogueSearchHit): string {
  if (hit.kind === "variant") {
    return String(hit.row.variant_name ?? hit.row.name ?? "Variant").trim();
  }
  if (hit.kind === "model") {
    return [hit.row.brand_name, hit.row.model_name].filter(Boolean).join(" ").trim() || "Model";
  }
  return hit.row.brand_name || hit.row.name || "Brand";
}

function hitSubtitle(hit: CatalogueSearchHit): string {
  if (hit.kind === "variant") {
    return [hit.row.brand_name, hit.row.model_name].filter(Boolean).join(" · ");
  }
  if (hit.kind === "model") {
    return "Model · picks a default variant";
  }
  return "Brand · narrow your search to a model";
}

export function CompareAddDialog({ open, onOpenChange, excludeIds, onPickVariant }: Props) {
  const [q, setQ] = useState("");
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);

  const search = useCatalogueSearchForCompare(q);

  const exclude = new Set(excludeIds.map((id) => id.trim()).filter(Boolean));

  const attemptAddVariant = async (variantId: string, meta?: CompareModelSegment) => {
    const trimmed = variantId.trim();
    if (!trimmed || exclude.has(trimmed)) return;
    if (excludeIds.length >= COMPARE_MAX_SLOTS) {
      toast.message(`You can compare up to ${COMPARE_MAX_SLOTS} cars. Remove one to add another.`);
      return;
    }
    onPickVariant(trimmed, meta);
    setQ("");
    onOpenChange(false);
    toast.success("Added to compare");
  };

  const onHitClick = async (hit: CatalogueSearchHit, dedupeKey: string) => {
    if (excludeIds.length >= COMPARE_MAX_SLOTS) {
      toast.message(`Compare is full (${COMPARE_MAX_SLOTS} max).`);
      return;
    }
    if (hit.kind === "variant") {
      const id = hit.row.id;
      if (typeof id !== "string" || id.length < 8) {
        toast.message("This variant could not be added.");
        return;
      }
      await attemptAddVariant(id, compareSegmentFromVariant(hit.row) ?? undefined);
      return;
    }
    if (hit.kind === "brand") {
      toast.message("Try searching for a model or variant name.");
      return;
    }

    setResolvingKey(dedupeKey);
    try {
      const variantId = await resolveCatalogueModelToVariantId(hit.row);
      if (!variantId) {
        toast.message("Could not resolve a default variant for this model.");
        return;
      }
      await attemptAddVariant(
        variantId,
        compareSegmentFromModel(hit.row) ?? undefined,
      );
    } finally {
      setResolvingKey(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,560px)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/80 px-6 pb-4 pt-6 text-left">
          <DialogTitle className="font-display text-xl">Add a car</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Search the live catalogue by brand, model, or variant name.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-6 pb-4 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cars, brands, variants…"
              className="h-11 rounded-xl pl-10"
              aria-label="Search catalogue"
            />
          </div>
          <p className="text-xs text-muted-foreground">Results update as you type (after two characters).</p>
        </div>
        <div className="max-h-[320px] overflow-y-auto border-t border-border/70 px-3 py-2">
          {q.trim().length < 2 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              Type at least two characters to search.
            </p>
          ) : search.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          ) : !search.data?.length ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">No matches yet.</p>
          ) : (
            <ul className="space-y-1.5 pb-2">
              {search.data.map((hit, idx) => {
                const dedupeKey = `${hit.kind}-${idx}-${hitLabel(hit)}`;
                const disabled =
                  hit.kind === "variant" &&
                  typeof hit.row.id === "string" &&
                  exclude.has(hit.row.id);
                const busy = resolvingKey === dedupeKey;

                return (
                  <li key={dedupeKey}>
                    <button
                      type="button"
                      disabled={disabled || busy}
                      onClick={() => void onHitClick(hit, dedupeKey)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition",
                        "hover:border-border hover:bg-muted/50",
                        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{hitLabel(hit)}</p>
                        <p className="truncate text-xs text-muted-foreground">{hitSubtitle(hit)}</p>
                      </div>
                      {busy ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex justify-end border-t border-border/70 px-6 py-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" aria-hidden />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
