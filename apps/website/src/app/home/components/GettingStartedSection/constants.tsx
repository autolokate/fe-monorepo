import { Bell, MapPin, QrCode, ShieldCheck, Smartphone, Wifi } from 'lucide-react';
import type {
  GettingStartedCopy,
  GettingStartedFeature,
  GettingStartedStep,
  ProtectionCard,
  ProtectionCopy,
} from './types';

export const GETTING_STARTED_COPY: GettingStartedCopy = {
  eyebrow: 'How it works',
  headlineLine1: 'Set it once.',
  headlineLine2Prefix: 'It ',
  headlineEmphasis: 'protects',
  headlineLine2Suffix: ' every drive.',
  subheadline: 'Simple setup. 24/7 monitoring. Help when you need it most.',
};

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    id: 'set-up',
    step: '01',
    title: 'Set up',
    body: 'Add your vehicle, emergency contacts, and safety preferences in minutes.',
    Icon: Smartphone,
  },
  {
    id: 'connect',
    step: '02',
    title: 'Connect',
    body: 'Autolokate stays active in the background and monitors every drive.',
    Icon: Wifi,
  },
  {
    id: 'stay-protected',
    step: '03',
    title: 'Stay protected',
    body: 'If something goes wrong, alerts, location, and help coordination begin automatically.',
    Icon: ShieldCheck,
  },
];

export const GETTING_STARTED_FEATURES: GettingStartedFeature[] = [
  { id: 'crash-detection', label: 'Automatic crash detection', Icon: ShieldCheck },
  { id: 'emergency-alerts', label: 'Instant emergency alerts', Icon: Bell },
  { id: 'location-sharing', label: 'Live location sharing', Icon: MapPin },
  { id: 'qr-backup', label: 'QR backup & more', Icon: QrCode },
];

export const PROTECTION_COPY: ProtectionCopy = {
  eyebrow: 'The Emergency Moment',
  headlinePrefix: 'Protection that acts ',
  headlineEmphasis: 'before',
  headlineSuffix: ' you can.',
  footnote: {
    source: 'GPS + sensors',
    center: 'Control Center',
  },
};

export const PROTECTION_CARDS: ProtectionCard[] = [
  {
    id: 'crash-detected',
    kind: 'image',
    step: '01',
    title: 'Crash Detected',
    body: 'Our system senses a severe impact instantly.',
    image: {
      dark: '/images/new-design/howItWorkscardBgDark2.png',
      light: '/images/new-design/howItWorkscardBgLight2.png',
    },
  },
  {
    id: 'emergency-countdown',
    kind: 'countdown',
    step: '02',
    title: 'Emergency Countdown',
    body: 'Calls for help within seconds.',
    seconds: '08',
    ringLabel: 'Calling for help',
    ringUnit: 'seconds',
  },
  {
    id: 'family-notified',
    kind: 'notify',
    step: '03',
    title: 'Family Notified',
    body: 'Your loved ones get an alert with live details.',
    alert: {
      title: 'Automatic Alert',
      detail: 'Crash details with live car location',
      mapLine: 'Live location on shared map',
    },
  },
  {
    id: 'live-location',
    kind: 'image',
    step: '04',
    title: 'Live Location Shared',
    body: 'Real-time location sent to family and responders.',
    image: {
      dark: '/images/new-design/howItWorkscardBgDark1.png',
      light: '/images/new-design/howItWorkscardBgLight1.png',
    },
    imagePosition: '68% center',
  },
];
