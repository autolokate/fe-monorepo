import {
  Activity,
  Ambulance,
  CloudRain,
  Gauge,
  Layers,
  ScanLine,
  Smartphone,
  Timer,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ArticleCategory = 'Safety' | 'Guide' | 'Product';

export interface ArticleSectionBlock {
  type: 'section';
  heading: string;
  body: string;
}

export interface ArticleQuoteBlock {
  type: 'quote';
  text: string;
}

export type ArticleBlock = ArticleSectionBlock | ArticleQuoteBlock;

export interface BlogArticle {
  /** URL slug — the `[slug]` param for `/blog/[slug]`. */
  slug: string;
  Icon: LucideIcon;
  category: ArticleCategory;
  /** Card + detail headline. */
  title: string;
  /** One-line card summary. */
  excerpt: string;
  /** Byline name shown under the article. */
  author: string;
  authorTagline: string;
  readTime: string;
  updated: string;
  /** Lead paragraph rendered above the body sections. */
  lead: string;
  blocks: ArticleBlock[];
}

const TEAM_AUTHOR = 'The Autolokate team';
const TEAM_TAGLINE = 'Safety, in plain terms';
const UPDATED = 'Updated July 2026';

/**
 * Single source of truth for blog content. The list page (`/blog`), the detail
 * page (`/blog/[slug]`) and the "Related reads" grid all read from here.
 * The first six match the redesign Figma "07a · Blog list · D".
 */
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'first-hour',
    Icon: Activity,
    category: 'Safety',
    title: 'The first hour after a crash, minute by minute',
    excerpt: 'Why response speed changes outcomes on Indian roads.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '6 min read',
    updated: UPDATED,
    lead: 'When a crash happens on an Indian highway, the minutes that follow decide everything. Here is what actually happens, and why speed matters more than anything else.',
    blocks: [
      {
        type: 'section',
        heading: 'The first sixty seconds',
        body: 'The moment your phone detects a serious impact, a countdown starts. If you are able, you can cancel it. If you cannot, the Control Center is alerted automatically with your live location, and an ambulance is on its way before anyone has to make a call.',
      },
      {
        type: 'section',
        heading: 'Why the golden hour is real',
        body: 'Trauma care works best when it starts within the first hour. On Indian roads, where the nearest ambulance can be far, the clock starts the instant help is dispatched, not when someone finally reaches a phone.',
      },
      {
        type: 'quote',
        text: 'Response speed changes outcomes more than any single factor on Indian roads.',
      },
      {
        type: 'section',
        heading: 'What happens automatically',
        body: 'Detection, dispatch and your family’s alert all happen at once. You do not coordinate anything. That is the whole point: help moves while you cannot.',
      },
    ],
  },
  {
    slug: 'choosing-plan',
    Icon: Layers,
    category: 'Guide',
    title: 'Choosing the right plan for your vehicle',
    excerpt: 'A plain-language walk through the plans.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '5 min read',
    updated: UPDATED,
    lead: 'Every plan protects you, but the right one depends on how and what you drive. Here is a plain-language way to decide without reading the fine print twice.',
    blocks: [
      {
        type: 'section',
        heading: 'Start with how you drive',
        body: 'A daily city commuter and a weekend highway car have different risks. Think about your typical trip length, the roads you use most, and who else drives the vehicle before you compare tiers.',
      },
      {
        type: 'section',
        heading: 'What each tier adds',
        body: 'Higher tiers add faster escalation, wider roadside cover and more emergency contacts. The core crash detection and Control Center response are in every plan, so no one is left without help.',
      },
      {
        type: 'quote',
        text: 'The best plan is the one you will actually keep active, every day you drive.',
      },
      {
        type: 'section',
        heading: 'You can change later',
        body: 'Plans are not permanent. Start with what fits today and upgrade in minutes if your driving changes. Nothing about setup has to be re-done.',
      },
    ],
  },
  {
    slug: 'smart-qr-privacy',
    Icon: ScanLine,
    category: 'Product',
    title: 'Smart QR, and what a stranger can and can’t see',
    excerpt: 'How privacy-first scanning actually works.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '4 min read',
    updated: UPDATED,
    lead: 'The Smart QR sticker on your windscreen is a backup that works even when your phone can’t. But it is built so a stranger never sees your personal details.',
    blocks: [
      {
        type: 'section',
        heading: 'What a scan does',
        body: 'When someone scans your Smart QR, it notifies the Control Center and your emergency contacts. It does not reveal your phone number, address or name to the person scanning.',
      },
      {
        type: 'section',
        heading: 'Privacy by default',
        body: 'Contact happens through a masked relay. A passer-by can let you know your car is blocking a gate or needs attention without ever learning who you are.',
      },
      {
        type: 'quote',
        text: 'Help should reach you without handing your identity to a stranger.',
      },
      {
        type: 'section',
        heading: 'Why it still matters with the app',
        body: 'Phones run out of battery and get thrown clear in a crash. The QR is a physical fallback that keeps working when the digital path can’t.',
      },
    ],
  },
  {
    slug: 'golden-hour',
    Icon: Timer,
    category: 'Safety',
    title: 'What the golden hour really means',
    excerpt: 'The window that decides outcomes after a crash.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '5 min read',
    updated: UPDATED,
    lead: 'You have probably heard the phrase “golden hour.” Here is what it actually refers to, and why every minute inside it counts more than the last.',
    blocks: [
      {
        type: 'section',
        heading: 'It is about time, not luck',
        body: 'The golden hour is the window right after a serious injury when treatment is most likely to save a life. The sooner care begins, the better the odds, and the curve is steep.',
      },
      {
        type: 'section',
        heading: 'The Indian road reality',
        body: 'Distances are long and traffic is unpredictable. That is exactly why dispatch has to begin the instant a crash is detected, not after a bystander finds a phone and a number.',
      },
      {
        type: 'quote',
        text: 'Minutes saved at the start of the hour are the ones that matter most.',
      },
      {
        type: 'section',
        heading: 'How Autolokate protects the window',
        body: 'Automatic detection and instant dispatch are designed to protect those first minutes, so the golden hour starts working for you and not against you.',
      },
    ],
  },
  {
    slug: 'emergency-contacts',
    Icon: Users,
    category: 'Guide',
    title: 'Setting up emergency contacts the right way',
    excerpt: 'Who to add, and why it matters.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '4 min read',
    updated: UPDATED,
    lead: 'Your emergency contacts are the people who hear first when something goes wrong. A few minutes of setup now makes those alerts count later.',
    blocks: [
      {
        type: 'section',
        heading: 'Choose people who answer',
        body: 'Pick contacts who are reachable and likely to pick up quickly. A close family member and one friend who is usually free is a stronger combination than three people who rarely answer.',
      },
      {
        type: 'section',
        heading: 'Tell them beforehand',
        body: 'Let your contacts know they are on your list and what an alert means. A heads-up removes confusion in the moment that matters and speeds up their response.',
      },
      {
        type: 'quote',
        text: 'An alert only helps if the person on the other end knows what to do.',
      },
      {
        type: 'section',
        heading: 'Keep it current',
        body: 'Numbers change and relationships change. Review your contacts every few months so the list always reflects who can actually help today.',
      },
    ],
  },
  {
    slug: 'monsoon-driving',
    Icon: CloudRain,
    category: 'Guide',
    title: 'Monsoon driving, the safe way',
    excerpt: 'Cutting risk when the roads turn.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '5 min read',
    updated: UPDATED,
    lead: 'Rain changes everything about the road, grip, visibility and stopping distance. A few habits keep the monsoon from turning a normal drive into a risk.',
    blocks: [
      {
        type: 'section',
        heading: 'Slow down early',
        body: 'Wet roads roughly double your stopping distance. Ease off well before you would in the dry and leave a wider gap to the vehicle ahead.',
      },
      {
        type: 'section',
        heading: 'See and be seen',
        body: 'Turn on headlights in heavy rain, keep the windscreen clear, and avoid high beams that reflect back off the water. Being visible is half the battle.',
      },
      {
        type: 'quote',
        text: 'In the monsoon, patience is the cheapest safety feature your car has.',
      },
      {
        type: 'section',
        heading: 'Respect standing water',
        body: 'Never guess the depth of a flooded stretch. If you cannot see the road surface, turn around, water hides potholes and stalls engines faster than you expect.',
      },
    ],
  },
  {
    slug: 'driver-score',
    Icon: Gauge,
    category: 'Product',
    title: 'Reading your driver score',
    excerpt: 'What the numbers say about your everyday driving.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '4 min read',
    updated: UPDATED,
    lead: 'Your driver score is a simple mirror of how you drive over time. Here is how to read it without letting a single bad trip get under your skin.',
    blocks: [
      {
        type: 'section',
        heading: 'What it measures',
        body: 'The score reflects patterns, smooth braking, steady speeds and gentle cornering, rather than one-off events. It rewards consistency over perfection.',
      },
      {
        type: 'section',
        heading: 'Trends beat single trips',
        body: 'One hard brake to avoid a pothole will not sink your score. Look at the direction over weeks, not the number after a single drive.',
      },
      {
        type: 'quote',
        text: 'A good score is a habit, not a highlight reel.',
      },
      {
        type: 'section',
        heading: 'Small changes, real gains',
        body: 'Anticipating stops and easing off the accelerator earlier improves both your score and your fuel bill. The safest driving is usually the calmest.',
      },
    ],
  },
  {
    slug: 'ambulance-cover',
    Icon: Ambulance,
    category: 'Safety',
    title: 'Your ambulance cover, explained',
    excerpt: 'What’s included when help is on the way.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '5 min read',
    updated: UPDATED,
    lead: 'When an ambulance is dispatched for you, a lot happens behind the scenes. Here is what your cover includes and how the coordination works.',
    blocks: [
      {
        type: 'section',
        heading: 'Dispatch, not just a number',
        body: 'Cover means the Control Center actively arranges help with your live location, rather than leaving you to find and call a service while injured.',
      },
      {
        type: 'section',
        heading: 'Coordination all the way through',
        body: 'The team stays on the line, guides responders to you and keeps your family updated. You are not managing logistics during an emergency.',
      },
      {
        type: 'quote',
        text: 'Cover is not a phone number, it is someone making sure help arrives.',
      },
      {
        type: 'section',
        heading: 'What it does not replace',
        body: 'Autolokate coordinates emergency help. It works alongside, and never replaces, 112 and official emergency services.',
      },
    ],
  },
  {
    slug: 'park-me',
    Icon: Smartphone,
    category: 'Product',
    title: 'Park Me: reach a blocked car without sharing your number',
    excerpt: 'Contactless, private, and instant.',
    author: TEAM_AUTHOR,
    authorTagline: TEAM_TAGLINE,
    readTime: '3 min read',
    updated: UPDATED,
    lead: 'A blocked driveway or a badly parked car no longer needs an angry note or a shared phone number. Park Me connects you privately and instantly.',
    blocks: [
      {
        type: 'section',
        heading: 'How it works',
        body: 'Anyone can request that you move your car through a scan or a tap. You get a notification instantly, without your number ever being exposed.',
      },
      {
        type: 'section',
        heading: 'Private on both sides',
        body: 'Neither person sees the other’s contact details. The relay handles the message so a quick heads-up never becomes a privacy problem.',
      },
      {
        type: 'quote',
        text: 'A polite nudge should never cost you your phone number.',
      },
      {
        type: 'section',
        heading: 'Small feature, fewer arguments',
        body: 'Most parking friction is just a missing, easy way to reach the driver. Park Me removes it, so a two-minute move does not turn into a standoff.',
      },
    ],
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

/** Other articles to surface under "Related reads" (same order, current excluded). */
export function getRelatedArticles(slug: string, count = 3): BlogArticle[] {
  return BLOG_ARTICLES.filter((article) => article.slug !== slug).slice(0, count);
}
