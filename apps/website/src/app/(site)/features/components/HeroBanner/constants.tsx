export const HERO_BG = "/images/new-design/newDesignHeroBg.png";
export const HERO_BG_MOBILE = "/images/new-design/newDesignHeroBgMobile.png";

export const HERO_COPY = {
  headline: "Everything your vehicle needs.",
  headlineAccent: "In one connected app.",
  description:
    "From real-time tracking and smart safety alerts to service history and driving insights — stay in control, anytime, anywhere.",
} as const;

export interface HeroPhone {
  id: string;
  src: string;
  alt: string;
}

/* Order matters: left · center (front) · right. */
export const HERO_PHONES: {
  left: HeroPhone;
  center: HeroPhone;
  right: HeroPhone;
} = {
  left: {
    id: "marketplace",
    src: "/images/new-design/featureBannerimage3.png",
    alt: "Autolokate Marketplace with service categories, popular services, and nearby garages",
  },
  center: {
    id: "dashboard",
    src: "/images/new-design/featureBannerimage2.png",
    alt: "Autolokate vehicle dashboard showing safety, daily utility, driver score, and quick actions",
  },
  right: {
    id: "service-history",
    src: "/images/new-design/featureBannerimage1.png",
    alt: "Autolokate service history listing past services with dates and costs",
  },
};
