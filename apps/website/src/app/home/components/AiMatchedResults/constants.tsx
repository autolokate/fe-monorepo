import type { AdvisorMatchCard } from "@/lib/advisor/types";

export type SortKey = "match" | "price_asc" | "price_desc" | "mileage_desc";

/** Pure compare function so sort logic stays out of the React component. */
export function sortMatches(rows: AdvisorMatchCard[], by: SortKey): AdvisorMatchCard[] {
  const sorted = [...rows];
  switch (by) {
    case "price_asc":
      return sorted.sort((a, b) => (a.sortPriceMin || Infinity) - (b.sortPriceMin || Infinity));
    case "price_desc":
      return sorted.sort((a, b) => (b.sortPriceMax || 0) - (a.sortPriceMax || 0));
    case "mileage_desc":
      return sorted.sort(
        (a, b) => (b.mileageKmpl ?? -Infinity) - (a.mileageKmpl ?? -Infinity),
      );
    case "match":
    default:
      return sorted.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
  }
}

export const PAGE_SIZE = 6;
