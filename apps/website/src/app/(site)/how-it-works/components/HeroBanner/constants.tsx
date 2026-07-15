import { Ambulance, Headset, MapPin, QrCode, Users, type LucideIcon } from 'lucide-react';

const YT_VIDEO_ID = '8BL-2qFbWJY';
const YT_THUMBNAIL = `https://img.youtube.com/vi/${YT_VIDEO_ID}/maxresdefault.jpg`;
const YT_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

/** Reuse the home redesign hero plate as the carousel backdrop. */
export const HERO_BG = '/images/new-design/newDesignHeroBg.png';
export const HERO_BG_MOBILE = '/images/new-design/newDesignHeroBgMobile.png';

export const HERO_PRIMARY_CTA = {
  label: 'Get Protected',
  href: '/#safety-packs',
} as const;

export interface HeroStep {
  Icon: LucideIcon;
  label: string;
}

export interface HeroVideo {
  poster: string;
  posterAlt: string;
  embedUrl: string;
  duration: string;
  /** Fraction (0–1) used to pre-fill the decorative scrubber. */
  progress: number;
  caption: string;
  steps: HeroStep[];
}

export interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  headlineAccent: string;
  description: string;
  video: HeroVideo;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'crash-detection',
    badge: 'Automatic Crash Detection',
    headline: 'Automatic crash detection works',
    headlineAccent: 'before you can react.',
    description:
      'Autolokate uses background GPS, advanced sensors, and AI logic to detect serious incidents. It starts an emergency countdown, alerts our Control Center, and helps notify your family or support — fast.',
    video: {
      poster: YT_THUMBNAIL,
      posterAlt: 'Autolokate detecting a crash and responding in real time',
      embedUrl: YT_EMBED_URL,
      duration: '1:28',
      progress: 0.36,
      caption: 'How Autolokate detects and responds in real time.',
      steps: [
        { Icon: Headset, label: 'Control Center' },
        { Icon: Users, label: 'Family' },
        { Icon: Ambulance, label: 'Ambulance' },
        { Icon: MapPin, label: 'Live Location' },
      ],
    },
  },
  {
    id: 'qr-backup',
    badge: 'Smart Vehicle QR',
    headline: 'Smart QR backup works',
    headlineAccent: "when your phone can't.",
    description:
      "One Autolokate sticker becomes your vehicle's digital identity. If your phone is unreachable, anyone can scan the QR and connect to help fast — emergency help, park-me privacy-first, service history, and insurance reminders, all in one smart link.",
    video: {
      poster: YT_THUMBNAIL,
      posterAlt: 'Scanning an Autolokate QR sticker to connect to help',
      embedUrl: YT_EMBED_URL,
      duration: '1:21',
      progress: 0.42,
      caption: 'How the Smart QR backup connects help in seconds.',
      steps: [
        { Icon: QrCode, label: 'Scan QR' },
        { Icon: Headset, label: 'Control Center' },
        { Icon: Users, label: 'Family' },
        { Icon: Ambulance, label: 'Ambulance' },
      ],
    },
  },
];
