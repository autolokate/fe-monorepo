import { INDIAN_DRIVE_GUIDE_CHANNEL_URL } from "@/lib/idg";
import type { FeaturedVideo, FeaturedVideosSectionCopy } from "./types";

export const IDG_CHANNEL_NAME = "Indian Drive Guide";

export const FEATURED_VIDEOS_COPY: FeaturedVideosSectionCopy = {
  eyebrow: "INDIAN DRIVE GUIDE",
  headline: "Real advice for smarter car decisions.",
  description:
    "Watch practical guides on buying, maintenance, safety, and everyday driving in India.",
  channelName: IDG_CHANNEL_NAME,
  primaryCta: {
    label: "Watch on YouTube",
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  },
  secondaryCta: { label: "Explore Guides", href: "/media" },
};

export const FEATURED_VIDEOS: FeaturedVideo[] = [
  {
    id: "secondhand-buying-guide",
    videoId: "mTaxvB_qIZ4",
    thumbnailLabel: "25,000 KM",
    title: "Second-hand car buying guide",
    summary: "Everything you must check before buying a used car.",
    category: "Buying tips",
    duration: "08:45",
    href: "https://youtu.be/mTaxvB_qIZ4",
  },
  {
    id: "cvt-gearbox-tips",
    videoId: "fgjaUSzjxsU",
    thumbnailLabel: "Tips for CVT Gear Box",
    title: "9 tricks to protect your CVT gearbox",
    summary: "Protect your CVT from wear with these everyday driving habits.",
    category: "Maintenance",
    duration: "06:32",
    href: "https://youtu.be/fgjaUSzjxsU",
  },
  {
    id: "dct-dsg-tips",
    videoId: "7oAmmLyfPoo",
    thumbnailLabel: "DCT / DSG Gearbox",
    title: "5 tips to protect your DCT / DSG gearbox",
    summary: "Five practical tips to extend the life of your dual-clutch transmission.",
    category: "Maintenance",
    duration: "09:15",
    href: "https://youtu.be/7oAmmLyfPoo",
  },
];
