import { Car, Globe, ShieldCheck, type LucideIcon } from "lucide-react";

export const YT_VIDEO_ID = "8BL-2qFbWJY";
export const YT_VIDEO_URL = `https://youtu.be/${YT_VIDEO_ID}`;
export const YT_THUMBNAIL = `https://img.youtube.com/vi/${YT_VIDEO_ID}/maxresdefault.jpg`;
export const YT_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

export const WATCH_GUIDE_COPY = {
  eyebrow: "Watch guide",
  headline: "Watch how Autolokate QR works",
  description:
    "Learn how to activate your QR sticker, place it on your vehicle, and let others reach you safely for parking or emergency support.",
  youtubeLabel: "Watch QR Guide",
  playLabel: "Play Autolokate QR walkthrough",
  iframeTitle: "Autolokate QR — How to use",
} as const;

export interface WatchGuideTrustChip {
  label: string;
  Icon: LucideIcon;
}

export const WATCH_GUIDE_TRUST_CHIPS: WatchGuideTrustChip[] = [
  { label: "No app needed", Icon: Globe },
  { label: "Private contact", Icon: ShieldCheck },
  { label: "Bike + car QR", Icon: Car },
];
