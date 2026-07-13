import {
  Layers,
  Lock,
  Zap,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export const WHY_COPY = {
  heading: "One platform. Every advantage.",
  description:
    "Buy any product and it plugs straight into your Autolokate account — one app, one dashboard, one login.",
} as const;

export interface WhyPoint {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export const WHY_POINTS: WhyPoint[] = [
  {
    id: "connected",
    title: "Works together",
    description: "Every product shares one account, dashboard, and history.",
    Icon: Layers,
  },
  {
    id: "private",
    title: "Privacy-first",
    description: "Reach owners without ever exposing personal numbers.",
    Icon: Lock,
  },
  {
    id: "instant",
    title: "Instant setup",
    description: "Scan, activate, and go — no complicated onboarding.",
    Icon: Zap,
  },
  {
    id: "support",
    title: "24x7 support",
    description: "Real help whenever the road throws a surprise.",
    Icon: Headphones,
  },
];
