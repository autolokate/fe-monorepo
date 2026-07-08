import { Bell, CircleParking, FileText, History } from "lucide-react";
import type { QrFeature, QrSectionCopy } from "./types";

export const QR_SECTION_IMAGE = "/images/home/autolokate_qr_sticker_transparent.png";

export const QR_SECTION_BACKGROUND = "/images/home/home_qr_banner.png";

export const QR_SECTION_COPY: QrSectionCopy = {
  eyebrow: "Smart Vehicle QR",
  headlineLine1: "One QR.",
  headlineLine2Prefix: "Your vehicle stays ",
  headlineEmphasis: "connected.",
  subheading:
    "Your Autolokate QR helps others reach you when parked, alert your emergency contacts, and access important vehicle records when needed.",
  primaryCta: { label: "How QR Works", href: "/how-it-works" },
};

export const QR_FEATURES: QrFeature[] = [
  {
    title: "Park Me",
    body: "Let someone contact you when your vehicle is parked or blocking the way.",
    Icon: CircleParking,
  },
  {
    title: "Emergency Help",
    body: "A bystander can scan and alert your emergency contacts with location details.",
    Icon: Bell,
  },
  {
    title: "Service History",
    body: "Keep service records and important vehicle updates linked to your QR.",
    Icon: History,
  },
  {
    title: "Vehicle Identity",
    body: "Connect your vehicle details, ownership records, and documents in one place.",
    Icon: FileText,
  },
];
