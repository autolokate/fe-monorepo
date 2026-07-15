import {
  Ambulance,
  ClipboardList,
  Headset,
  RadioTower,
  Split,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const RESPONSE_COPY = {
  eyebrow: 'How Autolokate Responds',
  title: 'Smarter detection. Faster response. More saves.',
} as const;

export interface ResponseStep {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export const RESPONSE_STEPS: ResponseStep[] = [
  {
    id: 'detect-scan',
    title: 'Detect / Scan',
    body: 'AI detects impact or you scan QR after an incident.',
    Icon: RadioTower,
  },
  {
    id: 'control-center',
    title: 'Control Center',
    body: 'Alert received by Autolokate control center in seconds.',
    Icon: Headset,
  },
  {
    id: 'parallel-dispatch',
    title: 'Parallel Dispatch',
    body: 'We notify the right people — at the same time.',
    Icon: Split,
  },
];

export interface ResponseOutcome {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
}

export const RESPONSE_OUTCOMES: ResponseOutcome[] = [
  { id: 'ambulance', title: 'Ambulance', subtitle: 'Nearest dispatched', Icon: Ambulance },
  { id: 'rsa', title: 'RSA', subtitle: 'On-road assistance', Icon: Wrench },
  { id: 'family', title: 'Family', subtitle: 'Loved ones alerted', Icon: Users },
  {
    id: 'incident',
    title: 'Live Incident',
    subtitle: 'Real-time logging',
    Icon: ClipboardList,
  },
];
