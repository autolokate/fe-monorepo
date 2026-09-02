import {
  Banknote,
  Bell,
  Camera,
  Car,
  Gauge,
  Gift,
  History,
  Layers,
  Lightbulb,
  MapPin,
  MessageCircle,
  CirclePlay,
  Receipt,
  Repeat,
  ScanLine,
  ShieldCheck,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Users,
  Video,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { ToolkitCopy, ToolkitRow } from './types';

/** Icon accent colours, baked per icon in the Figma "04 · Features" section. */
const ICON_DARK = '#0a0a0c';
const ICON_AMBER = '#b97507';
const ICON_GREEN = '#1fa24a';

/** Each icon component carries one fixed colour across the section. */
export const ICON_COLOR = new Map<LucideIcon, string>([
  [Zap, ICON_DARK],
  [Receipt, ICON_AMBER],
  [Bell, ICON_AMBER],
  [MapPin, ICON_DARK],
  [Camera, ICON_DARK],
  [Car, ICON_DARK],
  [Repeat, ICON_DARK],
  [Layers, ICON_DARK],
  [ScanLine, ICON_GREEN],
  [Wrench, ICON_DARK],
  [ShieldCheck, ICON_GREEN],
  [SlidersHorizontal, ICON_DARK],
  [History, ICON_DARK],
  [Gauge, ICON_GREEN],
  [Trophy, ICON_DARK],
  [Lightbulb, ICON_AMBER],
  [Users, ICON_GREEN],
  [MessageCircle, ICON_DARK],
  [CirclePlay, ICON_DARK],
  [Sparkles, ICON_DARK],
  [Video, ICON_DARK],
  [Gift, ICON_GREEN],
  [Share2, ICON_GREEN],
  [Banknote, ICON_GREEN],
]);

export const TOOLKIT_COPY: ToolkitCopy = {
  eyebrow: 'The full toolkit',
  headlineAccent: 'Everything',
  headline: ' the app does.',
  subheading:
    'Daily errands, garage bookings, driver score, and community—organized by what you actually use.',
};

export const TOOLKIT_ROWS: ToolkitRow[] = [
  {
    id: 'row-1',
    layout: 'wide',
    tiles: [
      {
        id: 'daily-utility',
        title: 'Daily utility',
        subtitle: 'The small jobs your vehicle keeps giving you—done from one place.',
        Icon: Zap,
        width: 'wide',
        capabilityColumns: 2,
        capabilities: [
          {
            id: 'challans',
            label: 'Challans',
            detail: 'check and clear dues in a few taps',
            Icon: Receipt,
          },
          {
            id: 'fastag',
            label: 'FASTag',
            detail: 'recharge and track the balance',
            Icon: Zap,
          },
          {
            id: 'renewals',
            label: 'Renewal alerts',
            detail: 'insurance, FASTag and PUC—on push and WhatsApp',
            Icon: Bell,
          },
          {
            id: 'parking',
            label: 'Parking memory',
            detail: 'a photo and GPS pin to navigate back',
            Icon: MapPin,
          },
          {
            id: 'dashcam',
            label: 'Phone dashcam',
            detail: 'records the drive, saves clips automatically',
            Icon: Camera,
          },
        ],
      },
      {
        id: 'multi-vehicle',
        title: 'Multi-vehicle',
        subtitle: 'The whole garage, one login.',
        Icon: Car,
        width: 'default',
        capabilityColumns: 1,
        capabilities: [
          {
            id: 'add-vehicles',
            label: 'Add vehicles',
            detail: 'every car and bike you own',
            Icon: Car,
          },
          {
            id: 'instant-switch',
            label: 'Instant switch',
            detail: 'move between them in a tap',
            Icon: Repeat,
          },
          {
            id: 'per-vehicle',
            label: 'Per-vehicle',
            detail: 'plan, contacts and history for each',
            Icon: Layers,
          },
          {
            id: 'smart-qr',
            label: 'Vehicle QR',
            detail: 'sticker and scan settings per vehicle',
            Icon: ScanLine,
          },
        ],
      },
    ],
  },
  {
    id: 'row-2',
    layout: 'three',
    tiles: [
      {
        id: 'garages',
        title: 'Garages & services',
        subtitle: 'Book trusted work. Keep proof forever.',
        Icon: Wrench,
        width: 'default',
        capabilityColumns: 1,
        capabilities: [
          {
            id: 'verified-garages',
            label: 'Verified garages',
            detail: 'find and book rated partners',
            Icon: ShieldCheck,
          },
          {
            id: 'mod-shops',
            label: 'Mod shops',
            detail: 'modification work, booked the same way',
            Icon: SlidersHorizontal,
          },
          {
            id: 'booking-history',
            label: 'Booking history',
            detail: 'every job in one place',
            Icon: History,
          },
          {
            id: 'service-history',
            label: 'Service history',
            detail: 'on the QR, transfers when you sell',
            Icon: ScanLine,
          },
        ],
      },
      {
        id: 'driver-score',
        title: 'Driver score',
        subtitle: 'A score built from how you actually drive.',
        Icon: Gauge,
        width: 'default',
        capabilityColumns: 1,
        capabilities: [
          {
            id: 'trip-scores',
            label: 'Trip scores',
            detail: 'a score after every drive',
            Icon: Gauge,
          },
          {
            id: 'leaderboards',
            label: 'Leaderboards',
            detail: 'your city and across India',
            Icon: Trophy,
          },
          {
            id: 'tips',
            label: 'Tips',
            detail: 'pointers built from your own trips',
            Icon: Lightbulb,
          },
        ],
      },
      {
        id: 'community',
        title: 'Community & programs',
        subtitle: 'Drivers who look out for each other.',
        Icon: Users,
        width: 'default',
        capabilityColumns: 1,
        capabilities: [
          {
            id: 'expert-qa',
            label: 'Expert Q&A',
            detail: 'ask and answer owner questions',
            Icon: MessageCircle,
          },
          {
            id: 'reels-feed',
            label: 'Reels & feed',
            detail: 'tips and partner content',
            Icon: CirclePlay,
          },
          {
            id: 'angel-program',
            label: 'Angel Program',
            detail: 'rewards for helping',
            Icon: Users,
          },
        ],
      },
    ],
  },
  {
    id: 'row-3',
    layout: 'two',
    tiles: [
      {
        id: 'ai-consultancy',
        title: 'AI & consultancy',
        subtitle: 'Advice when you need it.',
        Icon: Sparkles,
        width: 'default',
        capabilityColumns: 1,
        capabilities: [
          {
            id: 'video-consultancy',
            label: 'Video consultancy',
            detail: 'book a call with a vehicle expert',
            Icon: Video,
          },
          {
            id: 'ai-advice',
            label: 'AI advice',
            detail: 'help choosing your next vehicle',
            Icon: Sparkles,
          },
        ],
      },
      {
        id: 'wallet-referral',
        title: 'Wallet & referral',
        subtitle: 'Earn when you share.',
        Icon: Gift,
        width: 'default',
        capabilityColumns: 1,
        capabilities: [
          {
            id: 'referrals',
            label: 'Referrals',
            detail: 'share your code, track every reward',
            Icon: Share2,
          },
          {
            id: 'wallet',
            label: 'Wallet',
            detail: 'points, balance and history',
            Icon: Banknote,
          },
        ],
      },
    ],
  },
];
