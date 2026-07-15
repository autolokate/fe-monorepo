import {
  Bell,
  Car,
  Headset,
  MapPin,
  ShieldCheck,
  Timer,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const CRASH_DETECTION_IMAGE = '/images/new-design/howItWorkCrashDetection.png';

export const CRASH_DETECTION_COPY = {
  eyebrow: 'Primary Approach',
  headlinePrefix: 'Automatic crash detection ',
  headlineEmphasis: 'system',
  headlineSuffix: '.',
  subheadline:
    'Our AI + sensor system watches the road for you. When a serious incident is detected, help is triggered in seconds.',
  bannerNote: 'Secure, reliable and built to act when every second counts.',
} as const;

export interface CrashStep {
  id: string;
  step: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}

export const CRASH_STEPS: CrashStep[] = [
  {
    id: 'detect',
    step: '1',
    title: 'Detect',
    body: 'Background GPS and motion sensors detect a serious event.',
    Icon: Car,
  },
  {
    id: 'countdown',
    step: '2',
    title: 'Countdown',
    body: "Emergency countdown starts. You can cancel if it's a false alarm.",
    Icon: Timer,
  },
  {
    id: 'control-center',
    step: '3',
    title: 'Control Center',
    body: 'If no response, our Control Center is automatically triggered.',
    Icon: Headset,
  },
  {
    id: 'alert-sent',
    step: '4',
    title: 'Alert Sent',
    body: 'Family, support contacts and ambulance are alerted instantly.',
    Icon: Users,
  },
  {
    id: 'live-location',
    step: '5',
    title: 'Live Location',
    body: 'Live location and incident details are shared.',
    Icon: MapPin,
  },
];

export interface CrashFeature {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
}

export const CRASH_FEATURES: CrashFeature[] = [
  {
    id: 'background',
    title: 'Works in the background',
    subtitle: 'Always watching',
    Icon: ShieldCheck,
  },
  { id: 'no-action', title: 'No action needed', subtitle: 'Fully automatic', Icon: Zap },
  { id: 'fast-alerts', title: 'Fast alerts', subtitle: 'Seconds matter', Icon: Bell },
  { id: 'human-support', title: 'Real human support', subtitle: '24/7 care', Icon: Headset },
];
