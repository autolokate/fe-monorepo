import type { WhyItMattersCopy } from "./types";

/**
 * Theme + viewport aware background plates. The actual swapping happens in
 * `index.module.css` (media query + `[data-theme]` selectors) — these paths are
 * kept here so the asset wiring is documented in one place.
 */
export const WHY_IT_MATTERS_BACKGROUND = {
  mobileDark: "/images/new-design/whiyItMatterBgMobileDark.png",
  mobileLight: "/images/new-design/whiyItMatterBgMobileLight.png",
  webDark: "/images/new-design/whiyItMatterBgWebDark.png",
  webLight: "/images/new-design/whiyItMatterBgWebLight.png",
};

export const WHY_IT_MATTERS_COPY: WhyItMattersCopy = {
  eyebrow: "Why It Matters",
  stat: {
    value: "173,000+",
    label: "lives lost on Indian roads every year.",
  },
  half: {
    lead: "Nearly",
    emphasis: "half",
    body: "could be saved with timely help in the first hour.",
  },
  crash: {
    headline: "In a serious crash, you may not be able to reach your phone.",
    brand: "Autolokate",
    body: " detects, alerts, and helps coordinate support automatically.",
  },
  footer: "Every second counts. We make sure help gets there first.",
};
