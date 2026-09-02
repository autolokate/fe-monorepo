import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Banknote,
  Bell,
  Camera,
  Car,
  Gauge,
  History,
  Layers,
  LifeBuoy,
  Lightbulb,
  MapPin,
  MessageCircle,
  CirclePlay,
  Radio,
  Receipt,
  Repeat,
  ScanLine,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Users,
  Video,
  Wrench,
  Zap,
} from 'lucide-react';

export interface FeatureItem {
  id: string;
  label: string;
  detail: string;
  Icon: LucideIcon;
}

export interface FeatureCategory {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  items: FeatureItem[];
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: 'daily',
    title: 'Daily utility',
    subtitle: 'The small jobs your vehicle keeps giving you.',
    Icon: Zap,
    items: [
      {
        id: 'challans',
        label: 'Challans',
        detail: 'Check and clear dues in a few taps',
        Icon: Receipt,
      },
      { id: 'fastag', label: 'FASTag', detail: 'Recharge and track balance', Icon: Zap },
      {
        id: 'renewals',
        label: 'Renewal alerts',
        detail: 'Insurance, FASTag and PUC reminders',
        Icon: Bell,
      },
      {
        id: 'parking',
        label: 'Parking memory',
        detail: 'Photo and GPS pin to find your car',
        Icon: MapPin,
      },
      {
        id: 'dashcam',
        label: 'Phone dashcam',
        detail: 'Record drives, save clips automatically',
        Icon: Camera,
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & emergencies',
    subtitle: 'Detection, response, and cover on every drive.',
    Icon: ShieldCheck,
    items: [
      {
        id: 'crash',
        label: 'Crash detection',
        detail: 'Automatic impact sensing on your phone',
        Icon: Activity,
      },
      {
        id: 'control',
        label: 'Control Center',
        detail: '24/7 coordination when it matters',
        Icon: Radio,
      },
      {
        id: 'family',
        label: 'Family alerts',
        detail: 'Call, WhatsApp and SMS with live location',
        Icon: Bell,
      },
      {
        id: 'ambulance',
        label: 'Ambulance dispatch',
        detail: 'Sent to your live location',
        Icon: ShieldCheck,
      },
      {
        id: 'hospital',
        label: 'Hospital cover',
        detail: 'Accident cover and cashless network care',
        Icon: ShieldCheck,
      },
      {
        id: 'qr',
        label: 'Smart QR',
        detail: 'Vehicle sticker—scan works without the app',
        Icon: ScanLine,
      },
      {
        id: 'roadside',
        label: 'Roadside help',
        detail: 'Tow, fuel, flat tyre and battery jump',
        Icon: LifeBuoy,
      },
    ],
  },
  {
    id: 'garages',
    title: 'Garages & services',
    subtitle: 'Book trusted work. Keep proof forever.',
    Icon: Wrench,
    items: [
      {
        id: 'garages',
        label: 'Verified garages',
        detail: 'Find and book rated partners',
        Icon: ShieldCheck,
      },
      {
        id: 'mods',
        label: 'Mod shops',
        detail: 'Modification work, same booking flow',
        Icon: SlidersHorizontal,
      },
      { id: 'bookings', label: 'Booking history', detail: 'Every job in one place', Icon: History },
      {
        id: 'service',
        label: 'Service history',
        detail: 'On the QR, transfers when you sell',
        Icon: ScanLine,
      },
    ],
  },
  {
    id: 'garage',
    title: 'Multi-vehicle',
    subtitle: 'The whole garage, one login.',
    Icon: Car,
    items: [
      { id: 'add', label: 'Add vehicles', detail: 'Every car and bike you own', Icon: Car },
      { id: 'switch', label: 'Instant switch', detail: 'Move between them in a tap', Icon: Repeat },
      {
        id: 'per-vehicle',
        label: 'Per-vehicle setup',
        detail: 'Contacts, plan and history for each',
        Icon: Layers,
      },
    ],
  },
  {
    id: 'score',
    title: 'Driver score',
    subtitle: 'Built from how you actually drive.',
    Icon: Gauge,
    items: [
      { id: 'trips', label: 'Trip scores', detail: 'A score after every drive', Icon: Gauge },
      { id: 'boards', label: 'Leaderboards', detail: 'Your city and across India', Icon: Trophy },
      {
        id: 'tips',
        label: 'Driving tips',
        detail: 'Pointers from your own trips',
        Icon: Lightbulb,
      },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    subtitle: 'Drivers who look out for each other.',
    Icon: Users,
    items: [
      {
        id: 'qa',
        label: 'Expert Q&A',
        detail: 'Ask and answer owner questions',
        Icon: MessageCircle,
      },
      { id: 'reels', label: 'Reels & feed', detail: 'Tips and partner content', Icon: CirclePlay },
      {
        id: 'angel',
        label: 'Angel Program',
        detail: 'Rewards for helping on the road',
        Icon: Users,
      },
    ],
  },
  {
    id: 'more',
    title: 'AI, wallet & more',
    subtitle: 'Advice and rewards when you need them.',
    Icon: Sparkles,
    items: [
      {
        id: 'video',
        label: 'Video consultancy',
        detail: 'Book a call with a vehicle expert',
        Icon: Video,
      },
      { id: 'ai', label: 'AI advice', detail: 'Help choosing your next vehicle', Icon: Sparkles },
      {
        id: 'referrals',
        label: 'Referrals',
        detail: 'Share your code, track rewards',
        Icon: Share2,
      },
      { id: 'wallet', label: 'Wallet', detail: 'Points, balance and history', Icon: Banknote },
    ],
  },
];

export function getFeatureCategory(id: string) {
  return FEATURE_CATEGORIES.find((category) => category.id === id);
}

/** Categories shown in the light catalog (safety lives in the dark section). */
export const LIGHT_FEATURE_CATEGORIES = FEATURE_CATEGORIES.filter(
  (category) => category.id !== 'safety',
);
