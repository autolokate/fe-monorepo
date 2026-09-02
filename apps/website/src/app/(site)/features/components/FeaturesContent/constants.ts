import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

export const FEATURES_HERO = {
  eyebrow: 'The Autolokate app',
  headline: 'Safety when it matters.',
  headlineLine2: 'Tools for every day.',
  body: 'Crash detection on every drive. Smart QR on every vehicle. Plus the jobs your car keeps giving you—handled from one place.',
  image: MARKETING_STORY_IMAGES.featuresHero,
  imageAlt: 'Autolokate app — live tracking, QR scan, driver score, and everyday services',
  primaryCta: { label: 'Get protected', href: '/buy' },
  secondaryCta: { label: 'How it works', href: '/how-it-works' },
} as const;

export interface FeatureChapter {
  id: string;
  eyebrow: string;
  headline: string;
  body: string;
  detail?: string;
  image?: string;
  imageAlt?: string;
  /** light | dark | stone */
  surface: 'light' | 'dark' | 'stone';
  /** image beside copy, or full-bleed background */
  layout: 'split-right' | 'split-left' | 'full-bleed' | 'text-only';
}

export const SAFETY_CHAPTERS: FeatureChapter[] = [
  {
    id: 'detection',
    eyebrow: 'Crash detection',
    headline: 'Your phone senses impact. Help starts automatically.',
    body: 'Severe impacts trigger the response sequence from your phone—no hardware, no manual SOS. You get a short window to cancel a false alarm before anything is sent.',
    detail: 'Phone-based · 30-second cancel window · Works on everyday Android devices',
    image: MARKETING_STORY_IMAGES.detectionRadar,
    imageAlt: 'Autolokate app detecting severe impact and connecting emergency responders',
    surface: 'stone',
    layout: 'split-right',
  },
  {
    id: 'response',
    eyebrow: 'Automatic response',
    headline: 'One confirmed crash. Every channel activated.',
    body: 'Ambulance dispatch, family alerts on call and WhatsApp, police coordination when needed, and roadside help for your vehicle—sent together from one incident.',
    image: MARKETING_STORY_IMAGES.responseNetworkCrash,
    imageAlt:
      'Autolokate accident detected — ambulance, police, and roadside help dispatched to a crash scene',
    surface: 'dark',
    layout: 'split-left',
  },
  {
    id: 'family',
    eyebrow: 'Family network',
    headline: 'Your people know—before you can tell them.',
    body: 'Emergency contacts receive your live location on call, WhatsApp, and SMS the moment a crash is confirmed. They see help is already moving.',
    surface: 'light',
    layout: 'text-only',
  },
  {
    id: 'control',
    eyebrow: 'Control Center',
    headline: 'Humans on standby. Machines that never sleep.',
    body: 'Our 24/7 operations team calls you, verifies the incident, and coordinates dispatch—so you are not navigating hotlines when every second counts.',
    image: MARKETING_STORY_IMAGES.controlCenterCoordinates,
    imageAlt:
      'Autolokate Control Center — crash detected, call initiated, location tracked, and help dispatched from one place',
    surface: 'stone',
    layout: 'split-right',
  },
  {
    id: 'rsa',
    eyebrow: 'Roadside assistance',
    headline: 'Help reaches the vehicle—not just the person.',
    body: 'Towing, fuel delivery, flat tyres, and battery jump-starts are dispatched to your vehicle location on Guardian and Guardian Plus plans.',
    surface: 'light',
    layout: 'text-only',
  },
  {
    id: 'smart-qr',
    eyebrow: 'Smart QR',
    headline: 'When your phone cannot respond, your vehicle still can.',
    body: 'One sticker per vehicle. Anyone scans it—no app, no login—and our Control Center responds or places a verified Park Me call without sharing your number.',
    image: MARKETING_STORY_IMAGES.smartQrEcosystem,
    imageAlt:
      'Someone scans an Autolokate QR on a vehicle — help verified and emergency assistance dispatched',
    surface: 'dark',
    layout: 'split-left',
  },
];

export interface UtilityBand {
  id: string;
  title: string;
  subtitle: string;
  items: string[];
}

export const UTILITY_BANDS: UtilityBand[] = [
  {
    id: 'daily',
    title: 'Daily utility',
    subtitle: 'The small jobs your vehicle keeps giving you.',
    items: [
      'Challans & dues',
      'FASTag recharge',
      'Renewal alerts',
      'Parking memory',
      'Phone dashcam',
    ],
  },
  {
    id: 'garage',
    title: 'Garages & services',
    subtitle: 'Book trusted work. Keep proof forever.',
    items: ['Verified garages', 'Mod shops', 'Booking history', 'Digital service history on QR'],
  },
  {
    id: 'drive',
    title: 'Driver score',
    subtitle: 'Built from how you actually drive.',
    items: ['Trip scores', 'City leaderboards', 'Personalised tips'],
  },
  {
    id: 'garage-account',
    title: 'Multi-vehicle',
    subtitle: 'The whole garage, one login.',
    items: ['Every car and bike', 'Instant switch', 'Per-vehicle contacts & history'],
  },
];

export const FEATURES_CLOSING = {
  headline: 'Everything here comes with',
  headlineAccent: 'every protection plan.',
  subheading: 'Download free. Upgrade to Protect, Guardian, or Guardian Plus when you are ready.',
  cta: { label: 'View plans', href: '/pricing' },
} as const;
