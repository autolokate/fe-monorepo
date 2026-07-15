import { Briefcase, LayoutGrid, UserRound, type LucideIcon } from 'lucide-react';

export const ECOSYSTEM_COPY = {
  heading: 'Stronger together. Better outcomes.',
  footnote: 'One ecosystem that creates value for every stakeholder.',
} as const;

export interface EcosystemNode {
  id: string;
  title: string;
  description: string;
  /** Brand accent colour for the node's icon badge. */
  accent: string;
  Icon: LucideIcon;
}

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: 'drivers',
    title: 'Drivers',
    description: 'Safer journeys, smarter choices, everything at your fingertips.',
    accent: '#22c55e',
    Icon: UserRound,
  },
  {
    id: 'service-partners',
    title: 'Service Partners',
    description: 'More efficiency, happier customers, greater growth.',
    accent: '#3b82f6',
    Icon: Briefcase,
  },
  {
    id: 'on-ground-partners',
    title: 'On-ground Partners',
    description: 'Digitized operations, real-time data, higher transparency.',
    accent: '#f59e0b',
    Icon: LayoutGrid,
  },
];
