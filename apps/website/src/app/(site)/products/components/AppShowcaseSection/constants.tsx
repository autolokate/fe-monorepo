import {
  Activity,
  Banknote,
  ClipboardList,
  Gauge,
  History,
  LineChart,
  Car,
  Repeat,
  ScanLine,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import type { AppTile, SectionHeaderCopy } from './types';

const WHATSAPP_URL = 'https://wa.me/919062524516';
const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.mycompany.indiandriveguide';

export const FLAGSHIP_PHONE_IMAGE = '/images/new-design/products/flagship-phone.png';

export const APP_ICONS = {
  autolokate: '/images/new-design/products/app-icon-autolokate.svg',
  partner: '/images/new-design/products/app-icon-partner.svg',
  qrPartner: '/images/new-design/products/app-icon-qr-partner.svg',
} as const;

export const SECTION_HEADER: SectionHeaderCopy = {
  eyebrow: 'The apps',
  heading: 'Built for the way',
  headingAccent: 'you work.',
  subheading:
    'Whether you drive, run a workshop or manage parking and pumps, one of these is yours.',
};

export const FLAGSHIP_APP: AppTile = {
  id: 'autolokate',
  name: 'Autolokate',
  audience: 'For drivers and vehicle owners.',
  iconSrc: APP_ICONS.autolokate,
  capabilities: [
    {
      id: 'crash-detection',
      label: 'Crash detection',
      detail: 'automatic, with family alerts',
      Icon: Activity,
    },
    {
      id: 'everyday-tools',
      label: 'Everyday tools',
      detail: 'FASTag, challans and renewals',
      Icon: Zap,
    },
    {
      id: 'driver-score',
      label: 'Driver score',
      detail: 'trip scores, leaderboards and tips',
      Icon: Gauge,
    },
    {
      id: 'multi-vehicle',
      label: 'Multi-vehicle',
      detail: 'every car and bike, one account',
      Icon: Car,
    },
    {
      id: 'smart-qr',
      label: 'Smart QR',
      detail: 'Park Me and bystander help',
      Icon: ScanLine,
    },
  ],
  cta: { label: 'Get the app', href: ANDROID_STORE_URL },
};

export const PARTNER_APPS: AppTile[] = [
  {
    id: 'autolokate-partner',
    name: 'Autolokate Partner',
    audience: 'For garages, service centres and workshops.',
    iconSrc: APP_ICONS.partner,
    capabilities: [
      {
        id: 'jobs',
        label: 'Jobs',
        detail: 'customers, bookings and job cards',
        Icon: ClipboardList,
      },
      {
        id: 'records',
        label: 'Records',
        detail: 'digital service history and messaging',
        Icon: History,
      },
      {
        id: 'inventory',
        label: 'Inventory',
        detail: 'parts, modifications and stock',
        Icon: SlidersHorizontal,
      },
      {
        id: 'payments',
        label: 'Payments',
        detail: 'invoices and settlement tracking',
        Icon: Banknote,
      },
      {
        id: 'reports',
        label: 'Reports',
        detail: 'business analytics that update live',
        Icon: LineChart,
      },
    ],
    cta: { label: 'Become a partner', href: WHATSAPP_URL },
  },
  {
    id: 'autolokate-qr-partner',
    name: 'Autolokate QR Partner',
    audience: 'For parking agencies and petrol pumps.',
    iconSrc: APP_ICONS.qrPartner,
    capabilities: [
      {
        id: 'setup',
        label: 'Setup',
        detail: 'add locations and QR codes',
        Icon: SlidersHorizontal,
      },
      {
        id: 'scan-verify',
        label: 'Scan & verify',
        detail: 'gate checks and payments',
        Icon: ScanLine,
      },
      {
        id: 'parking-flows',
        label: 'Parking flows',
        detail: 'entry, exit and billing',
        Icon: Repeat,
      },
      {
        id: 'payments',
        label: 'Payments',
        detail: 'collections and settlement',
        Icon: Banknote,
      },
      {
        id: 'reports',
        label: 'Reports',
        detail: 'real-time reconciliation',
        Icon: LineChart,
      },
    ],
    cta: { label: 'Become a partner', href: WHATSAPP_URL },
  },
];
