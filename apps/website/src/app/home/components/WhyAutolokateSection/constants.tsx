import { Bell, History, Lock, ShieldCheck, UserRound } from "lucide-react";
import type { WhyAutolokateSectionCopy, WhyHighlight } from "./types";

export const WHY_AUTOLOKATE_BACKGROUND = "/images/home/home_footer_light.png";

export const WHY_AUTOLOKATE_COPY: WhyAutolokateSectionCopy = {
  eyebrow: "Why Autolokate",
  headlineLine1: "Smarter protection for every vehicle.",
  headlineLine2: "Complete peace of mind for every owner.",
  description:
    "Smart QR protection, trusted support, and vehicle records working together to keep every drive safer.",
};

export const WHY_HIGHLIGHTS: WhyHighlight[] = [
  {
    id: "identification",
    title: "Instant Identification",
    body: "Your QR helps others identify your vehicle and reach the right contact when needed.",
    Icon: ShieldCheck,
  },
  {
    id: "response",
    title: "Faster Response",
    body: "Share location and emergency details faster when every second matters.",
    Icon: Bell,
  },
  {
    id: "history",
    title: "Complete History",
    body: "Keep service, ownership, insurance, and important records linked to your vehicle.",
    Icon: History,
  },
  {
    id: "expert",
    title: "Expert Support",
    body: "Get access to verified partners for repairs, roadside help, and vehicle support.",
    Icon: UserRound,
  },
  {
    id: "privacy",
    title: "Privacy First",
    body: "Your number and personal details stay private unless you choose to share them.",
    Icon: Lock,
  },
];
