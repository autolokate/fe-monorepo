import {
  Network,
  Settings2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export const HERO_BG_WEB = "/images/new-design/productPageHeroWeb.png";
export const HERO_BG_MOBILE = "/images/new-design/productPageHeroMobile.png";

export const HERO_COPY = {
  headline: "Grow with the",
  headlineAccent: "Autolokate network.",
  description:
    "Help garages, workshops, modification shops, parking agencies, and petrol pumps run smarter operations and deliver better customer experiences.",
} as const;

export interface HeroHighlight {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export const HERO_HIGHLIGHTS: HeroHighlight[] = [
  {
    id: "trusted-network",
    title: "Trusted Network",
    description: "Join thousands of partners across India",
    Icon: Network,
  },
  {
    id: "smarter-operations",
    title: "Smarter Operations",
    description: "Digital tools that simplify your daily work",
    Icon: Settings2,
  },
  {
    id: "grow-business",
    title: "Grow Your Business",
    description: "More customers, better ratings, higher revenue",
    Icon: TrendingUp,
  },
];
