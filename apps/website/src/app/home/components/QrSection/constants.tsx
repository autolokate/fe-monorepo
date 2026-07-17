import { MapPin, PhoneCall } from 'lucide-react';
import type { QrFeature, QrSectionCopy } from './types';

export const QR_STICKER_IMAGE = '/images/new-design/home/qr-sticker.png';

export const QR_SECTION_COPY: QrSectionCopy = {
  eyebrow: 'The backup layer · Smart QR',
  headline: 'When your phone can’t, your',
  headlineAccent: 'vehicle still speaks.',
  body: 'The sticker is free with every plan, one per vehicle, car or bike, delivered by courier. It works when your phone can’t answer, or when a stranger is first on the scene. Any camera can scan it, no app, no login, and emergency scanning never expires.',
  chip: {
    title: 'Control Center responds',
    subtitle: 'Help is on the way',
  },
  primaryCta: { label: 'See how the Smart QR works', href: '/how-it-works' },
};

export const QR_FEATURES: QrFeature[] = [
  {
    id: 'emergency-help',
    title: 'Emergency help',
    body: 'A stranger scans and taps once to call. Our 24/7 Control Center responds, gets help moving and alerts your family with your location.',
    Icon: PhoneCall,
    tone: 'emergency',
  },
  {
    id: 'park-me',
    title: 'Park Me',
    body: 'Blocked in? A verified request triggers an AI call to you. Your number is never shown.',
    Icon: MapPin,
    tone: 'brand',
  },
];
