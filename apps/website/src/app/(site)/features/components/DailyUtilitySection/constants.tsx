import {
  CalendarClock,
  CircleParking,
  ListChecks,
  ReceiptText,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { PhoneShot } from '../PhoneCarousel';

export const DAILY_UTILITY_COPY = {
  index: '02',
  heading: 'Daily Utility',
  description: 'Smart everyday tools that save time, money and effort.',
} as const;

export interface UtilityCard {
  id: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
}

export const UTILITY_CARDS: UtilityCard[] = [
  {
    id: 'parking',
    title: 'Parking Assistant',
    subtitle: 'Never forget where you parked',
    Icon: CircleParking,
  },
  {
    id: 'fines',
    title: 'Fines & Challans',
    subtitle: 'View and settle your dues.',
    Icon: ReceiptText,
  },
  {
    id: 'challan-check',
    title: 'Challan Check',
    subtitle: 'Check & pay challans in a few taps.',
    Icon: ListChecks,
  },
  {
    id: 'fastag',
    title: 'FASTag',
    subtitle: 'Recharge & track instantly.',
    Icon: Share2,
  },
  {
    id: 'renewals',
    title: 'Renewal Reminders',
    subtitle: 'RC, Insurance, PUC & more.',
    Icon: CalendarClock,
  },
];

export const UTILITY_PHONE_SHOTS: PhoneShot[] = [
  {
    id: 'parking',
    src: '/images/new-design/feedbackFirstSectionImage3.png',
    alt: 'Autolokate Parking screen showing the saved parking location on a map with directions and share options',
  },
  {
    id: 'challan-check',
    src: '/images/new-design/feedbackFirstSectionImage4.png',
    alt: 'Autolokate Challan Check screen showing no pending challans and recent payments',
  },
  {
    id: 'fastag',
    src: '/images/new-design/feedbackFirstSectionImage5.png',
    alt: 'Autolokate FASTag Recharge screen showing current balance, recharge amounts, and autopay status',
  },
];
