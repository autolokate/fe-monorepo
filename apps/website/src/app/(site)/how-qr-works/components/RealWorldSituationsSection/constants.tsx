import {
  CircleParking,
  ShieldCheck,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";

export const REAL_WORLD_COPY = {
  eyebrow: "Built for real-world situations",
  headline: "Built for real-world situations.",
} as const;

export interface RealWorldSituation {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export const REAL_WORLD_SITUATIONS: RealWorldSituation[] = [
  {
    id: "parking",
    title: "Parking issues",
    body: "If your vehicle is blocking someone, they can reach you through Park Me without seeing your number.",
    Icon: CircleParking,
  },
  {
    id: "emergency",
    title: "Accidents & emergencies",
    body: "A scanner can alert emergency contacts with location and incident details when help is needed.",
    Icon: TriangleAlert,
  },
  {
    id: "vehicle-info",
    title: "Vehicle information",
    body: "Share consented vehicle details, documents, insurance, and service information when required.",
    Icon: ShieldCheck,
  },
  {
    id: "community",
    title: "Community support",
    body: "Connect with a growing vehicle safety community built around real road situations.",
    Icon: Users,
  },
];
