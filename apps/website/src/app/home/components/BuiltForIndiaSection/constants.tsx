import { Landmark, ShieldCheck } from "lucide-react";
import type { BuiltForIndiaCard, BuiltForIndiaCopy } from "./types";

/**
 * Viewport-aware background plates. The scene (road, car, cityscape) is baked
 * into the artwork; the CSS module swaps portrait/landscape by breakpoint.
 */
export const BUILT_FOR_INDIA_BACKGROUND = {
  mobile: "/images/new-design/buildForIndiaMobile.png",
  web: "/images/new-design/buildForIndiaWeb.png",
};

export const BUILT_FOR_INDIA_COPY: BuiltForIndiaCopy = {
  eyebrow: "Built for India",
  headlineLine1: "A digital identity",
  headlineLine2: "for every Indian vehicle",
  subheadingLine1: "Built on the systems that already run the road,",
  subheadingLine2: "so your protection works everywhere it needs to.",
};

export const BUILT_FOR_INDIA_CARDS: BuiltForIndiaCard[] = [
  {
    title: "VAHAN",
    body: "Verified at activation",
    Icon: ShieldCheck,
  },
  {
    title: "MoRTH",
    body: "Road-safety aligned",
    Icon: Landmark,
  },
];
