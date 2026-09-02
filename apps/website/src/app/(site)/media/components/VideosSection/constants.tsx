import {
  Activity,
  Ambulance,
  CloudRain,
  Gauge,
  ScanLine,
  Smartphone,
  Timer,
  Users,
} from 'lucide-react';
import { INDIAN_DRIVE_GUIDE_CHANNEL_URL } from '@/lib/idg';
import type { FeaturedVideo, VideoItem, VideosCopy } from './types';

export const VIDEOS_COPY: VideosCopy = {
  eyebrow: 'Watch',
  headline: 'Explainers and',
  headlineAccent: 'stories.',
  subheading: 'How the app, the Smart QR and your cover actually work',
  moreLabel: 'More to watch',
  youtubeLabel: 'Watch all on YouTube',
  youtubeHref: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
};

/** Large hero player — leads the Watch section. Links out to the IDG channel. */
export const FEATURED_VIDEO: FeaturedVideo = {
  Icon: Activity,
  eyebrow: 'Featured',
  title: 'How automatic crash detection works',
  duration: '6 min watch',
  href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
};

/** Compact list beside the featured player. */
export const VIDEO_LIST: VideoItem[] = [
  {
    id: 'smart-qr-scan',
    Icon: ScanLine,
    title: 'Smart QR: what a scan really shows',
    duration: '3 min watch',
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
  {
    id: 'monsoon-driving',
    Icon: CloudRain,
    title: 'Monsoon driving, the safe way',
    duration: '5 min watch',
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
  {
    id: 'ambulance-cover',
    Icon: Ambulance,
    title: 'Your ambulance cover, explained',
    duration: '4 min watch',
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
  {
    id: 'driver-score',
    Icon: Gauge,
    title: 'Reading your driver score',
    duration: '4 min watch',
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
];

/** Wide card grid below the featured row. */
export const MORE_VIDEOS: VideoItem[] = [
  {
    id: 'park-me',
    Icon: Smartphone,
    title: 'Park Me: reach a blocked car without sharing your number',
    duration: '2 min watch',
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
  {
    id: 'emergency-contacts',
    Icon: Users,
    title: 'Setting up emergency contacts in 2 minutes',
    duration: '3 min watch',
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
  {
    id: 'golden-hour',
    Icon: Timer,
    title: 'What the golden hour really means',
    duration: '5 min watch',
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
];
