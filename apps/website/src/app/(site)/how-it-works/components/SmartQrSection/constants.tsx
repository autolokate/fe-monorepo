import { Phone, Radio, ScanLine } from 'lucide-react';
import type { QrJourneyStep, SmartQrCopy } from './types';

import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

export const QR_STICKER_IMAGE = MARKETING_STORY_IMAGES.qrSticker;

export const SMART_QR_COPY: SmartQrCopy = {
  eyebrow: 'The backup layer',
  headline: 'Smart QR backup, on',
  headlineAccent: 'every vehicle.',
  subheading:
    'When your phone is unreachable, your vehicle still speaks for you. One scan, and help starts.',
  callout: 'Emergency scanning is never blocked. No app. No login. No barrier.',
};

export const QR_SCAN_STEP: QrJourneyStep = {
  id: 'scan',
  title: 'Scan',
  body: 'Anyone scans the sticker with any phone camera. Nothing to download.',
  Icon: ScanLine,
};

export const QR_BRANCH_STEPS: QrJourneyStep[] = [
  {
    id: 'emergency',
    title: 'Emergency',
    body: 'A stranger taps once to call. Our 24/7 Control Center responds, alerts your contacts and coordinates help.',
    Icon: Radio,
  },
  {
    id: 'park-me',
    title: 'Park Me',
    body: 'Blocked in? We verify the request, then place an AI call to you. Your number is never shared.',
    Icon: Phone,
  },
];
