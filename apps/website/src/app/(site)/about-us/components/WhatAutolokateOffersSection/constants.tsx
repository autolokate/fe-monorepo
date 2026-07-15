import {
  Ambulance,
  Bell,
  Building2,
  CarFront,
  Cpu,
  Headset,
  MapPin,
  QrCode,
  LifeBuoy,
  Share2,
  Shield,
  Umbrella,
  Wrench,
} from 'lucide-react';
import type { OfferFeature, OffersSectionCopy, PartnerBannerCopy, PartnerCategory } from './types';

export const WHAT_AUTOLOKATE_OFFERS_SECTION_ID = 'what-autolokate-offers';

export const PARTNER_BANNER_BACKGROUND = '/images/about/about_bg_offerings.png';

export const OFFERS_SECTION_COPY: OffersSectionCopy = {
  eyebrow: 'What Autolokate offers',
  headline: 'Everything you need. All in one system.',
};

export const OFFER_FEATURES: OfferFeature[] = [
  {
    id: 'smart-qr',
    title: 'Smart QR Identity',
    body: 'One scan to access vehicle info, owner details & emergency data.',
    Icon: QrCode,
  },
  {
    id: 'crash-detection',
    title: 'Crash Detection',
    body: 'AI monitors driving patterns and sends instant alerts in a crash.',
    Icon: Cpu,
  },
  {
    id: 'family-alerts',
    title: 'Family Alerts',
    body: 'Warns your loved ones via SMS, WhatsApp and voice calls.',
    Icon: Bell,
  },
  {
    id: 'location-tracking',
    title: 'Location Tracking',
    body: 'Shares real-time GPS so help can reach you faster.',
    Icon: MapPin,
  },
  {
    id: 'service-history',
    title: 'Service History',
    body: 'Keep service records, insurance & expiry dates in one place.',
    Icon: Wrench,
  },
  {
    id: 'parking-recovery',
    title: 'Parking & Recovery',
    body: 'Notify owners for parking issues or recovery requests.',
    Icon: CarFront,
  },
  {
    id: 'trip-sharing',
    title: 'Trip Sharing',
    body: 'Split trip details, expenses and updates with your group.',
    Icon: Share2,
  },
  {
    id: 'human-support',
    title: 'Human Support',
    body: 'Real people coordinate alerts, help routing and follow-ups.',
    Icon: Headset,
  },
];

export const PARTNER_BANNER_COPY: PartnerBannerCopy = {
  eyebrow: 'One ecosystem. Many partners.',
  headline: 'A Strong Network Working for You',
  body: 'Autolokate brings together verified partners and human intelligence to deliver real help when it matters most.',
};

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  { id: 'ambulance', label: 'Ambulance Partners', Icon: Ambulance },
  { id: 'hospitals', label: 'Hospitals', Icon: Building2 },
  { id: 'police', label: 'Police Stations', Icon: Shield },
  { id: 'rsa', label: 'RSA Providers', Icon: LifeBuoy },
  { id: 'insurance', label: 'Insurance Partners', Icon: Umbrella },
  { id: 'garages', label: 'Garages & Mechanics', Icon: Wrench },
];
