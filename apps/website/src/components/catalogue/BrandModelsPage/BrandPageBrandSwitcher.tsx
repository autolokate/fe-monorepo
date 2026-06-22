"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { LayoutGrid } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogueBrandOption } from "@/hooks/catalogue";
import type { VehicleCategory } from "@/lib/preferences";
import { cn } from "@/lib/utils";

type BrandPageBrandSwitcherProps = {
  vehicleType: VehicleCategory;
  currentSlug: string;
  /** Resolved title for synthetic list rows when slug is missing from the index. */
  currentDisplayName: string;
  brands: CatalogueBrandOption[];
  /** True while catalogue brand list is fetching and not yet hydrated. */
  brandIndexFetching: boolean;
  switchBrandLabel: string;
  /** Accessible name for icon shortcut to `/{vehicleType}` (browse all brands). */
  allBrandsLabel: string;
  className?: string;
};

/**
 * Dropdown to jump between manufacturer hubs (`/{vehicleType}/{slug}`), plus an
 * icon shortcut to `/{vehicleType}` (browse all brands).
 */
export function BrandPageBrandSwitcher({
  vehicleType,
  currentSlug,
  currentDisplayName,
  brands,
  brandIndexFetching,
  switchBrandLabel,
  allBrandsLabel,
  className,
}: BrandPageBrandSwitcherProps) {
  const router = useRouter();

  const options = useMemo(() => {
    const merged = [...brands];
    const key = currentSlug.trim().toLowerCase();
    if (key && !merged.some((b) => b.slug.toLowerCase() === key)) {
      merged.push({ name: currentDisplayName, slug: currentSlug });
    }
    merged.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    return merged;
  }, [brands, currentSlug, currentDisplayName]);

  const hubBase = `/${vehicleType}`;

  const waitForOthers = brandIndexFetching && brands.length === 0;

  return (
    <div
      aria-busy={waitForOthers}
      className={cn("flex flex-wrap items-end gap-3 sm:gap-x-4", className)}
    >
      <div className="flex flex-col gap-1.5 sm:min-w-[12rem] sm:max-w-sm sm:flex-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {switchBrandLabel}
        </span>
        <Select
          value={currentSlug}
          onValueChange={(nextSlug) => {
            if (!nextSlug || nextSlug === currentSlug) return;
            router.push(`${hubBase}/${encodeURIComponent(nextSlug)}`);
          }}
        >
          <SelectTrigger
            aria-label={switchBrandLabel}
            className={cn(
              "h-10 w-full bg-background/80",
              waitForOthers && "pointer-events-none opacity-65",
            )}
          >
            <SelectValue placeholder={waitForOthers ? "Loading brands…" : currentDisplayName} />
          </SelectTrigger>
          <SelectContent align="start" className="max-h-[min(22rem,var(--radix-select-content-available-height))]">
            {options.map((b) => (
              <SelectItem key={b.slug} value={b.slug}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Link
        href={hubBase}
        prefetch
        aria-label={allBrandsLabel}
        title={allBrandsLabel}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm ring-offset-background transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        )}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
