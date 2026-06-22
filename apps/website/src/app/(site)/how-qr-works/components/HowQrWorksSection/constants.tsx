import { Globe, QrCode, Split, UsersRound, Zap, type LucideIcon } from "lucide-react";

export const HOW_QR_WORKS_SECTION_ID = "how-qr-works-flow";

export const HOW_QR_WORKS_COPY = {
  eyebrow: "How Autolokate QR works",
  headline: "One scan. Two ways to help.",
  subheading:
    "A bystander scans your vehicle QR and chooses the right action — parking help or emergency support. No app download needed.",
  privacyTitle: "Built for privacy and safety.",
  privacyBody:
    "Your phone number stays hidden. People can contact you through Autolokate without seeing your personal number.",
} as const;

export interface QrWorksStep {
  id: string;
  step: number;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export const HOW_QR_WORKS_STEPS: QrWorksStep[] = [
  {
    id: "scan",
    step: 1,
    title: "Scan the QR",
    body: "Anyone can scan the Autolokate QR sticker on your vehicle.",
    Icon: QrCode,
  },
  {
    id: "web-page",
    step: 2,
    title: "Web page opens",
    body: "A secure scanner page opens instantly. No app download required.",
    Icon: Globe,
  },
  {
    id: "choose",
    step: 3,
    title: "Choose the situation",
    body: "The scanner chooses Parking or Emergency based on what is happening.",
    Icon: Split,
  },
  {
    id: "action",
    step: 4,
    title: "Action starts",
    body: "Parking starts a private contact flow. Emergency can share location and incident details.",
    Icon: Zap,
  },
  {
    id: "help",
    step: 5,
    title: "Help is coordinated",
    body: "Your contacts and support flow are notified based on your plan and settings.",
    Icon: UsersRound,
  },
];
