export const TEAM_HERO = {
  eyebrow: 'Our team',
  headline: 'Built around one mission:',
  headlineAccent: 'Safer journeys.',
  description:
    'The people behind Autolokate — product, engineering, and go-to-market — working to make automatic crash detection and emergency coordination reliable on Indian roads.',
} as const;

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Founders appear in the leadership row at the top of the grid. */
  leadership?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'deepak',
    name: 'Deepak Chaudhary',
    role: 'Founder',
    leadership: true,
  },
  {
    id: 'kapil',
    name: 'Kapil Dave',
    role: 'Co-Founder',
    leadership: true,
  },
  {
    id: 'mohit-dave',
    name: 'Mohit Dave',
    role: 'Web Lead',
  },
  {
    id: 'aman',
    name: 'Aman Chauhan',
    role: 'App Lead',
  },
  {
    id: 'prashant',
    name: 'Prashant Barge',
    role: 'BE Lead',
  },
  {
    id: 'mohit-shrimali',
    name: 'Mohit Shrimali',
    role: 'Marketing & Partners Lead',
  },
];

export const TEAM_PHILOSOPHY = {
  eyebrow: 'How we work',
  headline: 'Safety first. Always on.',
  body: 'We design for the moment nobody plans for — when a crash happens and every second counts. That means rigorous testing, honest communication, and technology that works quietly until it is needed most.',
  pillars: [
    {
      title: 'Real-world reliability',
      body: 'Built for Indian roads, networks, and response realities — not demo conditions.',
    },
    {
      title: 'Human-centered design',
      body: 'Clear alerts for families. Simple setup for drivers. No unnecessary complexity.',
    },
    {
      title: 'Accountability',
      body: 'We coordinate response — we do not replace 112 or official emergency services.',
    },
  ],
} as const;

export const TEAM_CTA = {
  headline: 'Want to work with us?',
  body: 'Whether you are exploring Autolokate for your family or partnering at scale — we would like to hear from you.',
  primary: { label: 'Contact us', href: '/contact-us' },
  secondary: { label: 'About Autolokate', href: '/about-us' },
} as const;
