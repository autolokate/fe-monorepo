import { ShieldCheck, ShoppingCart, Smartphone, type LucideIcon } from "lucide-react";

export const SETUP_STEPS_COPY = {
  eyebrow: "3-Step Setup",
  headline: "Get protected in 3 simple steps.",
  subheadline: "From purchase to protection in minutes — no complicated setup.",
} as const;

export interface SetupStep {
  id: string;
  step: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export const SETUP_STEPS: SetupStep[] = [
  {
    id: "buy",
    step: "1",
    title: "Buy",
    body: "Choose your plan and complete purchase.",
    Icon: ShoppingCart,
  },
  {
    id: "activate",
    step: "2",
    title: "Activate",
    body: "Verify with Vahan + WhatsApp OTP.",
    Icon: Smartphone,
  },
  {
    id: "protected",
    step: "3",
    title: "Protected",
    body: "You're all set. We've got your back.",
    Icon: ShieldCheck,
  },
];
