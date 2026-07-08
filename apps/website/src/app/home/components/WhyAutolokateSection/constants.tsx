import { CalendarClock, Car, Gauge, ReceiptText, Sparkles, Video } from "lucide-react";
import type { WhyAutolokateSectionCopy, WhyHighlight } from "./types";

export const WHY_AUTOLOKATE_BACKGROUND = "/images/home/home_footer_light.png";

export const WHY_AUTOLOKATE_COPY: WhyAutolokateSectionCopy = {
  eyebrow: "Every other day",
  headlinePrefix: "One app for your ",
  headlineEmphasis: "whole car",
  headlineSuffix: ".",
  description: "Safety is why you start. These are why you open it every week.",
};

export const WHY_HIGHLIGHTS: WhyHighlight[] = [
  {
    id: "dashcam",
    title: "Dashcam",
    body: "Footage saved to your vehicle profile.",
    Icon: Video,
  },
  {
    id: "challan-fastag",
    title: "Challan & FASTag",
    body: "Track dues and recharge in one tap.",
    Icon: ReceiptText,
  },
  {
    id: "renewal-alerts",
    title: "Renewal Alerts",
    body: "Insurance, PUC and licence reminders.",
    Icon: CalendarClock,
  },
  {
    id: "driver-score",
    title: "Driver Score",
    body: "See your driving score and improve it.",
    Icon: Gauge,
  },
  {
    id: "ai-car-advisor",
    title: "AI Car Advisor",
    body: "Buying help + zero-commission consults.",
    Icon: Sparkles,
  },
  {
    id: "multi-vehicle",
    title: "Multi-vehicle",
    body: "Every car you own, one profile.",
    Icon: Car,
  },
];
