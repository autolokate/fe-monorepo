import { BarChart3, Car, UserRound } from "lucide-react";
import type { ExploreAutolokateSectionCopy, ExploreServiceCard } from "./types";

export const EXPLORE_CARD_EXPLORE_BG = "/images/home/home_card_explore_bg.png";
export const EXPLORE_CARD_COMPARE_BG = "/images/home/home_card_compare_bg.png";
export const EXPLORE_CARD_EXPERT_BG = "/images/home/home_card_expert_bg.png";

export const EXPLORE_AUTOLOKATE_COPY: ExploreAutolokateSectionCopy = {
  eyebrow: "Explore Autolokate",
  headlineLine1: "Everything your vehicle needs.",
  headlineLine2: "All in one place.",
};

export const EXPLORE_SERVICE_CARDS: ExploreServiceCard[] = [
  {
    id: "explore-cars",
    title: "Explore Cars",
    body: "Discover new cars and compare top models.",
    ctaLabel: "Explore Cars",
    href: "/cars/explore",
    backgroundImage: EXPLORE_CARD_EXPLORE_BG,
    Icon: Car,
  },
  {
    id: "compare-cars",
    title: "Compare Cars",
    body: "Compare specs, features, prices and more.",
    ctaLabel: "Compare Now",
    href: "/cars/compare",
    backgroundImage: EXPLORE_CARD_COMPARE_BG,
    Icon: BarChart3,
  },
  {
    id: "expert-advice",
    title: "Get Expert Advice",
    body: "Book a session with verified experts and get answers.",
    ctaLabel: "Talk to an Expert",
    href: "/book-session",
    backgroundImage: EXPLORE_CARD_EXPERT_BG,
    Icon: UserRound,
  },
];
