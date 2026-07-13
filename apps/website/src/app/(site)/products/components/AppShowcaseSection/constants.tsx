import { Briefcase, QrCode, UserRound, type LucideIcon } from "lucide-react";

export const APP_SHOWCASE_COPY = {
  eyebrow: "The apps",
  heading: "One platform. Three purpose-built apps.",
  description:
    "Whether you drive, run a workshop, or manage a forecourt — there's an Autolokate app built for the way you work.",
} as const;

const ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.mycompany.indiandriveguide";
const IOS_STORE_URL = "https://apps.apple.com/in/app/idg-autolokate/id6733244175";

export interface AppStoreLinks {
  ios: string;
  android: string;
}

export interface AppShowcaseItem {
  id: string;
  name: string;
  tagline: string;
  /** Brand accent colour for the icon badge, checkmarks and highlights. */
  accent: string;
  Icon: LucideIcon;
  features: string[];
  /** Demo video shown in place of screenshots. Drop files in `public/videos/`. */
  videoSrc: string;
  /** Poster frame shown before the demo video plays. */
  poster: string;
  stores: AppStoreLinks;
}

export const APP_SHOWCASE_ITEMS: AppShowcaseItem[] = [
  {
    id: "consumer-app",
    name: "Consumer App",
    tagline: "All-in-one app for every driver.",
    accent: "#22c55e",
    Icon: UserRound,
    features: [
      "Safety & emergency tools with live location sharing",
      "Daily utilities — fuel, FASTag, insurance, challans & more",
      "AI-powered driver score & vehicle insights",
      "Multi-vehicle management & service history",
      "Community, reviews & trusted recommendations",
      "Track bookings, expenses and service reminders",
    ],
    videoSrc: "/videos/consumer-app-demo.mp4",
    poster: "/images/new-design/newDesignHeroBg.png",
    stores: { ios: IOS_STORE_URL, android: ANDROID_STORE_URL },
  },
  {
    id: "partner-app",
    name: "Partner App",
    tagline: "Built for garages, service centers & workshops.",
    accent: "#3b82f6",
    Icon: Briefcase,
    features: [
      "Manage jobs, customers and bookings in one place",
      "Digital service history and customer communication",
      "Parts, modifications & inventory management",
      "Payments, invoices and settlement tracking",
      "Business reports and analytics",
      "Track, grow, retain and delight your customers",
    ],
    videoSrc: "/videos/partner-app-demo.mp4",
    poster: "/images/new-design/productPageHeroWeb.png",
    stores: { ios: IOS_STORE_URL, android: ANDROID_STORE_URL },
  },
  {
    id: "qr-partner-app",
    name: "QR Partner App",
    tagline: "For parking agencies & petrol pumps.",
    accent: "#f59e0b",
    Icon: QrCode,
    features: [
      "Quick QR onboarding for locations & operators",
      "Scan, verify and collect payments seamlessly",
      "Parking agency workflows — entry, exit & billing",
      "Petrol pump operations with secure transactions",
      "Real-time reports, settlements & reconciliation",
      "Built for speed, accuracy and on-ground reliability",
    ],
    videoSrc: "/videos/qr-partner-app-demo.mp4",
    poster: "/images/new-design/pricingQRRedirection.png",
    stores: { ios: IOS_STORE_URL, android: ANDROID_STORE_URL },
  },
];
