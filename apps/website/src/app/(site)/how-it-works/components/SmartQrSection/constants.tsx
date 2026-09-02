import { Phone, Radio, ScanLine } from 'lucide-react';
import type { QrJourneyStep, SmartQrCopy } from './types';

import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

export const SMART_QR_PHONE_IMAGE = MARKETING_STORY_IMAGES.smartQrBackupPhone;

export const SMART_QR_COPY: SmartQrCopy = {
  eyebrow: 'The backup layer',
  headline: 'Smart QR backup, on',
  headlineAccent: 'every vehicle.',
  subheading:
    'When your phone is unreachable, your vehicle still speaks for you. One scan, and help starts.',
  callout: 'Emergency scanning is never blocked. No app. No login. No barrier.',
};

export const SMART_QR_STEPS: QrJourneyStep[] = [
  {
    id: 'scan',
    title: 'Scan',
    body: 'Anyone scans the sticker with any phone camera. Nothing to download.',
    Icon: ScanLine,
    badge: 'No download',
    tone: 'brand',
  },
  {
    id: 'emergency',
    title: 'Emergency',
    body: 'A stranger taps once to call. Our 24/7 Control Center responds, alerts your contacts and coordinates help.',
    Icon: Radio,
    badge: '24/7 live',
    tone: 'emergency',
  },
  {
    id: 'park-me',
    title: 'Park Me',
    body: 'Blocked in? We verify the request, then place an AI call to you. Your number is never shared.',
    Icon: Phone,
    badge: 'Number private',
    tone: 'calm',
  },
];
