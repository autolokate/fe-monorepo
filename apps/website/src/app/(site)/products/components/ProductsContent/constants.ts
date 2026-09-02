import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import { FLAGSHIP_APP, PARTNER_APPS } from '../AppShowcaseSection/constants';

export const PRODUCTS_HERO = {
  eyebrow: 'Product ecosystem',
  headline: 'One platform.',
  headlineLine2: 'Built for every role on the road.',
  body: 'Drivers get protection and everyday tools. Garages run jobs. Parking and fuel partners verify QR—one connected network.',
  image: MARKETING_STORY_IMAGES.ecosystemWheel,
  imageAlt:
    'Autolokate product ecosystem — drivers, garages, parking, fuel, and roadside connected in one network',
} as const;

export const FLOW_STEPS = [
  { id: 'vehicle', label: 'Vehicle on the road', detail: 'Everyday drive, always monitored' },
  { id: 'detect', label: 'Crash detected', detail: 'Phone senses severe impact automatically' },
  {
    id: 'control',
    label: 'Control Center alerted',
    detail: '24/7 team calls you and tracks location',
  },
  { id: 'family', label: 'Family notified', detail: 'Call, WhatsApp, SMS with live location' },
  {
    id: 'ambulance',
    label: 'Ambulance dispatched',
    detail: 'Network of 30,000+ validated ambulances',
  },
  { id: 'police', label: 'Police coordinated', detail: 'When the incident requires it' },
  {
    id: 'rsa',
    label: 'Roadside reaches vehicle',
    detail: 'Tow, fuel, flat tyre on eligible plans',
  },
  { id: 'care', label: 'Hospital & assistance', detail: 'Cashless care and cover per plan' },
] as const;

export const FLAGSHIP = {
  name: FLAGSHIP_APP.name,
  audience: FLAGSHIP_APP.audience,
  capabilities: FLAGSHIP_APP.capabilities.map((c) => `${c.label} — ${c.detail}`),
  cta: FLAGSHIP_APP.cta,
  icon: '/images/new-design/products/app-icon-autolokate.svg',
} as const;

export const PARTNERS = PARTNER_APPS.map((app) => ({
  id: app.id,
  name: app.name,
  audience: app.audience,
  highlights: app.capabilities.slice(0, 4).map((c) => c.label),
  cta: app.cta,
  icon: app.iconSrc,
}));

export const PRODUCTS_CLOSING = {
  headline: 'Find the product',
  headlineAccent: 'built for you.',
  subheading: 'Drivers start with Autolokate. Partners join the network that makes it work.',
  cta: { label: 'Get protected', href: '/buy' },
} as const;
