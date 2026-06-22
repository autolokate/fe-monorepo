import { CircleCheck, QrCode, ScanLine, UserRound } from "lucide-react";
import type { HowItWorksSectionCopy, HowItWorksStep } from "./types";

export const HOW_IT_WORKS_COPY: HowItWorksSectionCopy = {
  eyebrow: "How it works",
  headlineLine1: "Simple steps.",
  headlineLine2: "Stronger protection.",
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: "safety-pack",
    step: 1,
    title: "Get Your Safety Pack",
    body: "Choose the plan that fits your vehicle and activate your smart QR.",
    Icon: QrCode,
  },
  {
    id: "scan-share",
    step: 2,
    title: "Scan or Share",
    body: "Display your QR or share it when help is needed.",
    Icon: ScanLine,
  },
  {
    id: "notify-locate",
    step: 3,
    title: "We Notify & Locate",
    body: "Your contacts are alerted and we locate you instantly.",
    Icon: UserRound,
  },
  {
    id: "protected",
    step: 4,
    title: "You're Protected",
    body: "Help arrives faster and you stay protected 24x7.",
    Icon: CircleCheck,
  },
];
