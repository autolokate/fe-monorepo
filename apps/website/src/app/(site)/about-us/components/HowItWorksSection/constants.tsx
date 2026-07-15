import { BellRing, CarFront, MapPinned, Route, ShieldCheck, Siren, Users } from 'lucide-react';
import type { CrashToCareSectionCopy, CrashToCareStep } from './types';

export const HOW_IT_WORKS_SECTION_ID = 'how-it-works';

export const CRASH_TO_CARE_COPY: CrashToCareSectionCopy = {
  eyebrow: 'How it works',
  headline: 'From Crash to Care in Minutes',
  subheading:
    'Autolokate moves from detection to alerts, support coordination, and family updates — step by step.',
};

export const CRASH_TO_CARE_STEPS: CrashToCareStep[] = [
  {
    id: 'crash-detected',
    step: 1,
    title: 'Crash Detected',
    body: 'Possible crash or severe impact is detected.',
    Icon: CarFront,
  },
  {
    id: 'safety-check',
    step: 2,
    title: 'Safety Check',
    body: 'You get 15 seconds to confirm you are safe.',
    Icon: ShieldCheck,
  },
  {
    id: 'sos-activated',
    step: 3,
    title: 'SOS Activated',
    body: 'No response starts the emergency flow.',
    Icon: Siren,
    highlighted: true,
  },
  {
    id: 'emergency-alert',
    step: 4,
    title: 'Emergency Alert',
    body: 'Location and emergency details are shared.',
    Icon: BellRing,
  },
  {
    id: 'help-routed',
    step: 5,
    title: 'Help Routed',
    body: 'Support options are coordinated by location.',
    Icon: Route,
  },
  {
    id: 'family-notified',
    step: 6,
    title: 'Family Notified',
    body: 'Saved contacts receive alerts and updates.',
    Icon: Users,
  },
  {
    id: 'live-tracking',
    step: 7,
    title: 'Live Tracking',
    body: 'Family can follow updates until resolved.',
    Icon: MapPinned,
  },
];

export const CRASH_TO_CARE_ROW_ONE = CRASH_TO_CARE_STEPS.slice(0, 4);
export const CRASH_TO_CARE_ROW_TWO = CRASH_TO_CARE_STEPS.slice(4);
