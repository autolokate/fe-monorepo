import { Car, MapPin, Wrench } from 'lucide-react';
import type { EcosystemAudience, EcosystemCopy } from './types';

export const ECOSYSTEM_COPY: EcosystemCopy = {
  eyebrow: 'One network',
  heading: 'Stronger',
  headingAccent: 'together.',
  subheading: 'More drivers bring partners more business. More partners make the app more useful.',
  footnote:
    'Own a vehicle? The app is free to download, and every app plan ships with a Smart QR sticker.',
  link: { label: 'Get protected', href: '/#safety-packs' },
};

export const ECOSYSTEM_AUDIENCES: EcosystemAudience[] = [
  {
    id: 'service-partners',
    title: 'Service partners',
    description: 'Autolokate drivers find you, book you and pay you in one place.',
    Icon: Wrench,
  },
  {
    id: 'drivers',
    title: 'Drivers',
    description: 'Crash help on the road, plus garages and parking that recognise your QR.',
    Icon: Car,
  },
  {
    id: 'parking-fuel-partners',
    title: 'Parking & fuel partners',
    description: 'Scan a sticker at the gate, settle digitally, no cash disputes.',
    Icon: MapPin,
  },
];
