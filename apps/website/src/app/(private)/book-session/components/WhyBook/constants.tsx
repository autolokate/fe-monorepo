import { Car, IndianRupee, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ValuePillar {
  Icon: LucideIcon;
  title: string;
  body: string;
}

export const VALUE_PILLARS: ReadonlyArray<ValuePillar> = [
  {
    Icon: Car,
    title: "Built for Indian buyers",
    body: "Traffic, fuel prices, service networks, and resale — not generic global reviews.",
  },
  {
    Icon: ShieldCheck,
    title: "No dealer playbook",
    body: "We don't earn from showrooms. The session is aligned to your shortlist and budget only.",
  },
  {
    Icon: IndianRupee,
    title: "One transparent fee",
    body: "Pay once via Razorpay. Amount is confirmed at checkout; GST included.",
  },
  {
    Icon: Sparkles,
    title: "Clarity that pays for itself",
    body: "One short call can save weeks of forum rabbit holes and costly variant or timing mistakes.",
  },
] as const;
