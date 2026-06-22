import type { ComponentType, SVGProps } from "react";
import type { LucideProps } from "lucide-react";

export type SectionIcon = ComponentType<LucideProps> | ComponentType<SVGProps<SVGSVGElement>>;

export interface EmergencyBackupSectionCopy {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  actionsEyebrow: string;
  disclaimer: string;
}

export interface EmergencyAction {
  id: string;
  step: string;
  title: string;
  body: string;
  Icon: SectionIcon;
}

export interface ProtectionLayerCard {
  id: string;
  layerLabel: string;
  title: string;
  body: string;
  Icon: SectionIcon;
  imageSrc?: string;
  imageAlt?: string;
}
