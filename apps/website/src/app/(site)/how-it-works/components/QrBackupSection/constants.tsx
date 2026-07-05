import {
  Ambulance,
  CalendarClock,
  Car,
  FileText,
  Headset,
  PhoneCall,
  ScanLine,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export const QR_BACKUP_IMAGE = "/images/new-design/howItWorkQR.png";

export const QR_BACKUP_COPY = {
  eyebrow: "Secondary Approach",
  headline: "QR backup with Smart QR sticker.",
  subheadline:
    "When your phone is unreachable, your vehicle still talks for you. One scan. Instant help.",
  flowLabel: "How it works",
  bannerNote:
    "Crash happens and your phone is unreachable? Anyone can scan the QR and we'll still get help to you.",
} as const;

export interface QrFlowStep {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export const QR_FLOW_STEPS: QrFlowStep[] = [
  { id: "scan", title: "Scan", body: "Anyone scans the QR sticker.", Icon: Smartphone },
  {
    id: "control-center",
    title: "Control Center",
    body: "Details go to our Control Center.",
    Icon: Headset,
  },
  {
    id: "help",
    title: "Help Dispatched",
    body: "Family & ambulance are alerted.",
    Icon: Ambulance,
  },
];

export interface QrFeature {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export const QR_FEATURES: QrFeature[] = [
  {
    id: "identity",
    title: "One sticker = Digital identity",
    body: "Your vehicle's verified identity in one secure QR.",
    Icon: ShieldCheck,
  },
  {
    id: "emergency",
    title: "One-tap emergency",
    body: "Instant help to Control Center, then alerts to family & ambulance.",
    Icon: PhoneCall,
  },
  {
    id: "park-me",
    title: "Park Me (privacy first)",
    body: "Masked call to owner. Optional photo. Your number is never shared.",
    Icon: Car,
  },
  {
    id: "no-app",
    title: "Works without app",
    body: "Scan using any phone's camera. No app needed.",
    Icon: ScanLine,
  },
  {
    id: "service",
    title: "Service history",
    body: "Access service records and maintenance logs.",
    Icon: FileText,
  },
  {
    id: "insurance",
    title: "Insurance reminders",
    body: "Timely expiry alerts so you never miss a renewal.",
    Icon: CalendarClock,
  },
];
