/** Homepage narrative copy — one continuous journey. */

export const PROBLEM_COPY = {
  eyebrow: 'The reality',
  lines: [
    'A crash can happen in seconds.',
    'You may not be able to call for help.',
    'People nearby may not know what happened.',
    'Your family may not know where you are.',
    'Emergency services may not be coordinated.',
  ],
  pivot: 'Autolokate is the response layer that takes over when you cannot.',
} as const;

export const DETECTION_COPY = {
  eyebrow: 'Crash detection',
  headline: 'Detected automatically.',
  headlineLine2: 'No tap required.',
  body: 'Your phone senses a severe impact and starts the response sequence. You get a short window to cancel a false alarm—then help moves without you reaching for your phone.',
  detail: 'Phone-based · Works on everyday Android devices · No extra hardware',
} as const;

export const RESPONSE_NETWORK_COPY = {
  eyebrow: 'One incident',
  headline: 'Every response,',
  headlineAccent: 'activated together.',
  body: 'A single confirmed crash triggers a coordinated network—family, ambulance, police, roadside help, and our 24/7 Control Center.',
} as const;

/** Response network nodes — wired to homepage animation */
export const RESPONSE_NODES = [
  {
    id: 'family',
    label: 'Family notified',
    sub: 'Call, WhatsApp, SMS',
    image: '/images/home/hero/hero-marker-family-v2.png',
  },
  {
    id: 'ambulance',
    label: 'Ambulance dispatched',
    sub: 'To your live location',
    image: '/images/home/hero/hero-marker-ambulance-v5.png',
  },
  {
    id: 'police',
    label: 'Police alerted',
    sub: 'Coordinated when needed',
    image: '/images/home/hero/hero-marker-police-v5.png',
  },
  {
    id: 'rsa',
    label: 'Roadside help',
    sub: 'Tow, fuel, flat tyre',
    image: '/images/home/hero/hero-marker-rsa-v5.png',
  },
  {
    id: 'control',
    label: 'Control Center live',
    sub: '24/7 coordination',
    image: '/images/home/hero/hero-marker-control-v5.png',
  },
] as const;

export const CONTROL_CENTER_COPY = {
  eyebrow: 'Control Center',
  headline: 'One place coordinates',
  headlineAccent: 'everything.',
  body: 'When a crash is confirmed, our operations team calls you, tracks your live location, and dispatches the right help—without you navigating multiple hotlines.',
} as const;

export const SMART_QR_COPY = {
  eyebrow: 'Smart QR',
  headline: 'When your phone',
  headlineAccent: "can't respond, your vehicle still can.",
  body: 'One sticker on every vehicle. Anyone scans it—no app, no login—and help starts through our Control Center or a verified Park Me call.',
  secureTitle: 'Secure & Verified',
  secureBody: 'Scans connect you to our Control Center or Park Me.',
} as const;

export const PROTECTION_COPY = {
  eyebrow: 'Protection',
  headline: 'Choose how much protection',
  headlineAccent: 'you want on every journey.',
  body: 'Annual plans per vehicle. Each includes crash detection, emergency coordination, and a Smart QR sticker.',
  headerPill: 'One QR. Complete protection.',
  compareHref: '/pricing',
  compareLabel: 'Compare all plans',
  footnotes: ['Purchase in app', 'Cancel anytime', 'Sticker shipped free'] as const,
  includes: [
    { label: 'Crash detection' },
    { label: 'Emergency coordination' },
    { label: 'Smart QR sticker' },
  ] as const,
} as const;

/** Compact highlights for the homepage plan grid (keyed by purchase slug). */
export const PROTECTION_PLAN_HIGHLIGHTS: Record<string, readonly string[]> = {
  secure: [
    'Crash detection & 30-second cancel window',
    'Ambulance dispatch & family alerts',
    '₹1L accident cover',
  ],
  shield: ['Everything in Protect', 'Roadside help: tow, fuel, flat tyre', '₹3L accident cover'],
  'shield-plus': ['Everything in Guardian', '100 km+ roadside assistance', '₹5L accident cover'],
};

export const TRUST_COPY = {
  eyebrow: 'Trust',
  founderQuote:
    'We built Autolokate so protection feels effortless—always on, always close, never complicated.',
  founderName: 'Deepak Chaudhary',
  founderRole: 'Founder',
  founderImageAlt: 'Deepak Chaudhary, Founder of Autolokate',
  storiesEyebrow: 'From the road',
  storiesHeadline: 'Real protection,',
  storiesHeadlineAccent: 'real stories.',
} as const;

export interface TrustTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export const TRUST_TESTIMONIALS: TrustTestimonial[] = [
  {
    id: 'aarav',
    quote:
      'After my accident, Autolokate detected it right away. My family was alerted and help was on the way within minutes.',
    name: 'Aarav Mehta',
    role: 'Driver · Gurugram',
    initials: 'AM',
  },
  {
    id: 'neha',
    quote:
      'My husband’s phone alerted me on WhatsApp before he could call. I knew exactly where he was—and that help was coming.',
    name: 'Neha Verma',
    role: 'Emergency contact · Pune',
    initials: 'NV',
  },
  {
    id: 'karan',
    quote:
      'Someone knocked my bike over in parking. They scanned the sticker, I got the masked call, and my number was never shown.',
    name: 'Karan Shah',
    role: 'Bike owner · Delhi',
    initials: 'KS',
  },
  {
    id: 'priya',
    quote:
      'A flat tyre on the highway at night. Roadside help was dispatched before I finished explaining where I was stuck.',
    name: 'Priya Nair',
    role: 'Driver · Bengaluru',
    initials: 'PN',
  },
  {
    id: 'vikram',
    quote:
      'Cashless hospital admission happened smoothly. The Control Center had already shared my details with the network hospital.',
    name: 'Vikram Desai',
    role: 'Driver · Mumbai',
    initials: 'VD',
  },
];

export const CLOSING_COPY = {
  eyebrow: 'Get protected',
  headline: 'Protection should already be moving',
  headlineAccent: 'when you need it.',
  subheading: 'Set up in minutes. Covered for a full year, from ₹999.',
  features: [
    'Crash detection',
    'Live tracking',
    '24/7 Control Center',
    'Smart QR support',
  ] as const,
  imageAlt: 'Autolokate app showing vehicle setup, annual protection plan, and active coverage',
  cta: { label: 'Get protected', href: '/buy' },
} as const;
