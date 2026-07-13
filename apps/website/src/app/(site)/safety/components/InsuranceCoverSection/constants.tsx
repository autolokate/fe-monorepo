import { Building2, ShieldCheck, type LucideIcon } from "lucide-react";

export const INSURANCE_COPY = {
  eyebrow: "Insurance Benefits",
  title: "More than response. Real financial protection.",
  accent: {
    line1: "One plan.",
    line2: "Complete peace of mind.",
  },
} as const;

export interface InsuranceFeature {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  items: string[];
}

export const INSURANCE_FEATURES: InsuranceFeature[] = [
  {
    id: "accidental",
    title: "Accidental Cover",
    description: "Financial security in the unexpected moments.",
    Icon: ShieldCheck,
    items: [
      "Accidental Death Cover",
      "Permanent Total Disability",
      "Partial Disability Cover",
    ],
  },
  {
    id: "hospitalization",
    title: "Daily Hospitalization Benefits",
    description: "Cash benefit for every day you're hospitalized.",
    Icon: Building2,
    items: ["Daily Cash Benefit", "Up to 30 Days", "All Hospitalizations Covered*"],
  },
];
