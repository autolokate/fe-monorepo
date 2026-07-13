import { Car, ShieldCheck, Star, type LucideIcon } from "lucide-react";

export const STORIES_COPY = {
  eyebrow: "Real Save Stories",
  title: "Real people. Real stories. Real saves.",
} as const;

export interface SaveStat {
  id: string;
  value: string;
  label: string;
  Icon: LucideIcon;
}

export const SAVE_STATS: SaveStat[] = [
  { id: "lives", value: "12,500+", label: "Lives Protected", Icon: ShieldCheck },
  { id: "accidents", value: "9,200+", label: "Accidents Detected", Icon: Car },
  { id: "rating", value: "4.8★", label: "Average Rating", Icon: Star },
];

export interface SaveStory {
  id: string;
  quote: string;
  name: string;
  role: string;
}

export const SAVE_STORIES: SaveStory[] = [
  {
    id: "rohit",
    quote:
      "Autolokate detected my accident within a minute. The ambulance reached in 12 minutes. I'm alive because of them.",
    name: "Rohit S.",
    role: "Verified User",
  },
  {
    id: "priya",
    quote:
      "They informed my family before I could. RSA arrived fast and got me to safety.",
    name: "Priya M.",
    role: "Verified User",
  },
  {
    id: "arjun",
    quote:
      "Cashless hospitalization benefit helped my family a lot during recovery.",
    name: "Arjun P.",
    role: "Verified User",
  },
];
