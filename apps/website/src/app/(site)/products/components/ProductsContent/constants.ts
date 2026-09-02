import { Activity, Ambulance, Car, Hospital, PhoneCall, Siren, Users, Wrench } from 'lucide-react';
import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import { FLAGSHIP_APP, PARTNER_APPS } from '../AppShowcaseSection/constants';

export const PRODUCTS_HERO = {
  eyebrow: 'Product ecosystem',
  headline: 'One platform.',
  headlineLine2: 'Built for every role on the road.',
  body: 'Drivers get protection and everyday tools. Garages run jobs. Parking and fuel partners verify QR—one connected network.',
  image: MARKETING_STORY_IMAGES.productsEcosystemHero,
  imageAlt:
    'Autolokate product ecosystem — drivers, garages, parking, fuel, and roadside connected in one network',
} as const;

export const EXPERIENCE_FLOW = {
  eyebrow: 'Crash to care',
  headline: 'From the first impact',
  headlineLine2: 'to the hospital door.',
  body: 'Detection, Control Center, family alerts, ambulance, and care—handled as one continuous response.',
} as const;

export const FLOW_STEPS = [
  {
    id: 'vehicle',
    label: 'Vehicle on the road',
    detail: 'Everyday drive, always monitored',
    Icon: Car,
  },
  {
    id: 'detect',
    label: 'Crash detected',
    detail: 'Phone senses severe impact automatically',
    Icon: Activity,
  },
  {
    id: 'control',
    label: 'Control Center alerted',
    detail: '24/7 team calls you and tracks location',
    Icon: PhoneCall,
  },
  {
    id: 'family',
    label: 'Family notified',
    detail: 'Call, WhatsApp, SMS with live location',
    Icon: Users,
  },
  {
    id: 'ambulance',
    label: 'Ambulance dispatched',
    detail: 'Network of 30,000+ validated ambulances',
    Icon: Ambulance,
  },
  {
    id: 'police',
    label: 'Police coordinated',
    detail: 'When the incident requires it',
    Icon: Siren,
  },
  {
    id: 'rsa',
    label: 'Roadside reaches vehicle',
    detail: 'Tow, fuel, flat tyre on eligible plans',
    Icon: Wrench,
  },
  {
    id: 'care',
    label: 'Hospital & assistance',
    detail: 'Cashless care and cover per plan',
    Icon: Hospital,
  },
] as const;

export const FLAGSHIP = {
  name: FLAGSHIP_APP.name,
  audience: FLAGSHIP_APP.audience,
  capabilities: FLAGSHIP_APP.capabilities,
  cta: FLAGSHIP_APP.cta,
  icon: '/images/new-design/products/app-icon-autolokate.svg',
  image: MARKETING_STORY_IMAGES.productsFlagshipApp,
  imageAlt:
    'Autolokate flagship app — protected vehicle, driver score, crash alerts, Smart QR, and everyday tools',
} as const;

export const PARTNERS_HEADER = {
  eyebrow: 'Partner apps',
  headline: 'Built for the businesses',
  headlineLine2: 'that keep drivers moving.',
  body: 'Garages run jobs. Parking and fuel partners verify QR. One network that makes the driver app more useful every day.',
} as const;

export const PARTNERS = [
  {
    id: 'autolokate-partner',
    name: PARTNER_APPS[0].name,
    audience: PARTNER_APPS[0].audience,
    capabilities: PARTNER_APPS[0].capabilities.slice(0, 4),
    cta: PARTNER_APPS[0].cta,
    icon: PARTNER_APPS[0].iconSrc,
    image: MARKETING_STORY_IMAGES.productsPartnerGarage,
    imageAlt:
      'Autolokate Partner dashboard on a garage workbench — jobs, inventory, payments, and QR verify stand',
    layout: 'visual-first' as const,
  },
  {
    id: 'autolokate-qr-partner',
    name: PARTNER_APPS[1].name,
    audience: PARTNER_APPS[1].audience,
    capabilities: PARTNER_APPS[1].capabilities.slice(0, 4),
    cta: PARTNER_APPS[1].cta,
    icon: PARTNER_APPS[1].iconSrc,
    image: MARKETING_STORY_IMAGES.productsPartnerQr,
    imageAlt:
      'Autolokate QR Partner tablet at a parking entrance — scans, bookings, payments, and verify stand',
    layout: 'copy-first' as const,
  },
] as const;

export const PRODUCTS_CLOSING = {
  headline: 'Find the product',
  headlineAccent: 'built for you.',
  subheading: 'Drivers start with Autolokate. Partners join the network that makes it work.',
  cta: { label: 'Get protected', href: '/buy' },
} as const;
