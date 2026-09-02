import { MapPin, PhoneCall } from 'lucide-react';
import type { QrFeature, QrSectionCopy } from './types';

export const QR_STICKER_IMAGE = '/images/new-design/home/qr-sticker.png';

export const QR_SECTION_COPY: QrSectionCopy = {
  eyebrow: 'Backup protection · Smart QR',
  headline: 'When your phone can’t respond, your',
  headlineAccent: 'vehicle still can.',
  body: 'Included free with every plan—one sticker per vehicle, car or bike, courier-delivered. It works when your phone can’t answer, or when a bystander is first on scene. Any camera scans it: no app, no login, and emergency access never expires.',
  chip: {
    title: 'Control Center responds',
    subtitle: 'Help is coordinated',
  },
  primaryCta: { label: 'How Smart QR works', href: '/how-it-works' },
};

export const QR_FEATURES: QrFeature[] = [
  {
    id: 'emergency-help',
    title: 'Emergency help',
    body: 'A bystander scans and taps once to call. Our 24/7 Control Center responds, coordinates help, and alerts your family with your location.',
    Icon: PhoneCall,
    tone: 'emergency',
  },
  {
    id: 'park-me',
    title: 'Park Me',
    body: 'Blocked in? A verified request triggers an AI call to you. Your number stays private.',
    Icon: MapPin,
    tone: 'brand',
  },
];
