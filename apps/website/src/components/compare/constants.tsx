import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  ListChecks,
  Shield,
  Star,
} from "lucide-react";

import type { CompareTabId } from "@/lib/catalogue/compare-matrix";

export type { CompareTabId };

export const COMPARE_MAX_SLOTS = 3;

/** Full-page backdrop for `/cars/compare` & `/bikes/compare` (`public/images/`). */
export const COMPARE_PAGE_BACKGROUND = {
  light: "/images/explore_banner_bg_light.png",
  dark: "/images/explore_banner_bg_dark.png",
} as const;

export const COMPARE_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "specs", label: "Specs", icon: ListChecks },
  { id: "features", label: "Features", icon: Star },
  { id: "safety", label: "Safety", icon: Shield },
] satisfies ReadonlyArray<{ id: CompareTabId; label: string; icon: LucideIcon }>;
