import {
  IDG_HOME_VIDEOS,
  INDIAN_DRIVE_GUIDE_CHANNEL_URL,
  youtubeThumbnailUrl,
} from "@/lib/idg";

export const MEDIA_HERO = {
  eyebrow: "Autolokate Media",
  headline: "Videos, news & long reads for",
  headlineEm: "Indian",
  headlineSuffix: "drivers.",
  subhead:
    "Curated clips, desk reporting, and long reads — one place to watch and read before you decide.",
  stats: "120+ articles · 60+ videos · 1M+ views each month",
} as const;

export type MediaFilterId = "all" | "videos" | "blog";

export interface MediaVideoItem {
  videoId: string;
  title: string;
  category: string;
  duration: string;
  viewsLabel: string;
  publishedLabel: string;
}

/** Large hero player — Indian Drive Guide feature. */
export const MEDIA_FEATURED_VIDEO = {
  videoId: IDG_HOME_VIDEOS.driveGuideFeature,
  title: "Automatics, myths, and what buyers miss on Indian roads",
  duration: "12:48",
  viewsLabel: "1.1M views",
  publishedLabel: "Updated weekly",
} as const;

/** Smaller cards — same catalogue as home / how-qr-works where possible. */
export const MEDIA_VIDEOS: MediaVideoItem[] = [
  {
    videoId: IDG_HOME_VIDEOS.clipSafetyA,
    title: "Safety habits that matter in city traffic",
    category: "Tips",
    duration: "9:12",
    viewsLabel: "482K views",
    publishedLabel: "3 days ago",
  },
  {
    videoId: IDG_HOME_VIDEOS.clipSafetyB,
    title: "Maintenance checks before a long highway run",
    category: "Maintenance",
    duration: "11:05",
    viewsLabel: "356K views",
    publishedLabel: "1 week ago",
  },
  {
    videoId: "8BL-2qFbWJY",
    title: "How to connect your Autolokate QR",
    category: "Product",
    duration: "6:20",
    viewsLabel: "210K views",
    publishedLabel: "2 weeks ago",
  },
  {
    videoId: IDG_HOME_VIDEOS.driveGuideFeature,
    title: "Indian Drive Guide — real roads, real judgement",
    category: "Highlights",
    duration: "12:48",
    viewsLabel: "1.4M views",
    publishedLabel: "Featured",
  },
];

export interface MediaBlogItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  /** Hero image for card layout (`public/` path). */
  coverImage: string;
  /**
   * In-app destinations until a dedicated blog is wired; there is no `/blog` section in this repo yet.
   * Titles and categories match the static media hub lineup.
   */
  href: string;
  external?: boolean;
}

export const MEDIA_BLOG_POSTS: MediaBlogItem[] = [
  {
    id: "1",
    title: "How we think about safety data on Autolokate",
    category: "Desk",
    readTime: "5 min read",
    coverImage: "/images/home_whyus_dark.png",
    href: "/about-us",
  },
  {
    id: "2",
    title: "EV charging: what the spec sheet doesn’t tell you",
    category: "Blog",
    readTime: "8 min read",
    coverImage: "/images/explore_banner_bg_dark.png",
    href: "/how-it-works",
  },
  {
    id: "3",
    title: "Financing a car in 2026: paperwork without the anxiety",
    category: "Finance",
    readTime: "6 min read",
    coverImage: "/images/home_marketplace_bg_dark.png",
    href: "/contact-us",
  },
  {
    id: "4",
    title: "Why we built compare tools around real ownership costs",
    category: "Product",
    readTime: "4 min read",
    coverImage: "/images/home_session_dark.png",
    href: "/cars/compare",
  },
  {
    id: "5",
    title: "Tyre care before monsoon: a practical checklist",
    category: "Tips",
    readTime: "7 min read",
    coverImage: "/images/download_bg_dark.png",
    href: "/how-it-works",
  },
  {
    id: "6",
    title: "Highway driving in India: lane discipline and anticipation",
    category: "Safety",
    readTime: "9 min read",
    coverImage: "/images/home_banner_dark.png",
    href: INDIAN_DRIVE_GUIDE_CHANNEL_URL,
    external: true,
  },
];

export function videoThumbnailSrc(videoId: string) {
  return youtubeThumbnailUrl(videoId, "hqdefault");
}
