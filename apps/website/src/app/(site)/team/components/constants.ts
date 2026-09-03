import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

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
  initials: string;
  /** Founders appear in the leadership row at the top of the grid. */
  leadership?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  summary: string;
  about: readonly string[];
  focus: readonly string[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'deepak',
    name: 'Deepak Chaudhary',
    role: 'Founder & CEO',
    initials: 'DC',
    leadership: true,
    imageSrc: MARKETING_STORY_IMAGES.founderPortrait,
    imageAlt: 'Deepak Chaudhary, Founder & CEO of Autolokate',
    summary: 'Sets the mission: protection that starts when you cannot call for help.',
    about: [
      'Deepak founded Autolokate to close the missing minutes after a crash on Indian roads — when the driver cannot call, family does not know where they are, and help is still uncoordinated.',
      'He leads the company, the response-network vision, and the 24/7 Control Center direction. His work with Indian Drive Guide shaped a simple rule: speak plainly about real roads, then build products that hold up there.',
    ],
    focus: ['Mission', 'Control Center', 'Indian roads'],
  },
  {
    id: 'kapil',
    name: 'Kapil Dave',
    role: 'Co-Founder & Chief Product & Technology Officer (CPTO)',
    initials: 'KD',
    leadership: true,
    summary: 'Owns product and technology so detection, QR, and dispatch work as one system.',
    about: [
      'Kapil is Co-Founder and CPTO. He leads product and technology — the systems that detect a crash, keep identity with the vehicle, and hand the incident to the Control Center without extra taps.',
      'He is accountable for architecture, engineering quality, and the product decisions that make Autolokate reliable in the background until the moment it is needed.',
    ],
    focus: ['Product', 'Technology', 'Platform'],
  },
  {
    id: 'mohit-dave',
    name: 'Mohit Dave',
    role: 'Web Lead',
    initials: 'MD',
    summary: 'Builds the Autolokate website and purchase journeys people actually complete.',
    about: [
      'Mohit leads the web surface — marketing, account, and buy flows — so Autolokate is clear before someone ever opens the app.',
      'He focuses on performance, accessibility, and a path from first visit to protected vehicle without confusion.',
    ],
    focus: ['Website', 'Journeys', 'Experience'],
  },
  {
    id: 'aman',
    name: 'Aman Chauhan',
    role: 'App Lead',
    initials: 'AC',
    summary: 'Leads the mobile app that has to work in the background on every drive.',
    about: [
      'Aman leads the Autolokate app — crash detection, alerts, and the everyday tools that sit quietly until they are needed.',
      'He works to keep the experience simple for drivers and dependable when the phone is the first sensor on the scene.',
    ],
    focus: ['Mobile', 'Detection', 'Driver experience'],
  },
  {
    id: 'prashant',
    name: 'Prashant Barge',
    role: 'BE Lead',
    initials: 'PB',
    summary: 'Runs the backend that coordinates people, vehicles, and emergency partners.',
    about: [
      'Prashant leads backend engineering — APIs, reliability, and the services that connect phones, QR scans, and the Control Center.',
      'He focuses on systems that stay available when traffic spikes and when a real incident cannot wait.',
    ],
    focus: ['APIs', 'Reliability', 'Infrastructure'],
  },
  {
    id: 'mohit-shrimali',
    name: 'Mohit Shrimali',
    role: 'Marketing & Partners Lead',
    initials: 'MS',
    summary: 'Grows Autolokate with partners, channels, and clear public story.',
    about: [
      'Mohit leads marketing and partner work — how Autolokate shows up with hospitals, roadside networks, and the people who need to trust it.',
      'He keeps the public story honest: what Autolokate does, what it does not replace, and who we work with on the ground.',
    ],
    focus: ['Partners', 'Story', 'Go-to-market'],
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
