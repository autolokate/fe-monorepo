import { Ambulance, Radio, Users, Wrench } from 'lucide-react';
import type { ResponseBranch, ResponseCopy, ResponseSource } from './types';

/** Fork bracket connector exported from the redesign Figma (72×398). */
export const FORK_BRACKET = '/images/new-design/emergency-safety/fork-bracket.svg';

export const RESPONSE_COPY: ResponseCopy = {
  eyebrow: 'On-ground response',
  headline: 'Ambulance for you.',
  headlineAccent: 'Roadside help for the vehicle.',
  subheading: 'When a crash is confirmed, help goes out for you, your vehicle and your family.',
  footnote: 'Services vary by plan, availability and partner coverage',
};

export const RESPONSE_SOURCE: ResponseSource = {
  title: 'Everything, sent together',
  body: 'One confirmed crash, one dispatch. The Control Center sends everything at once.',
  Icon: Radio,
};

export const RESPONSE_BRANCHES: ResponseBranch[] = [
  {
    id: 'ambulance',
    title: 'Ambulance reaches you',
    body: 'Ambulance dispatch across India, from a network of 30,000+ validated ambulances.',
    Icon: Ambulance,
  },
  {
    id: 'family',
    title: 'Your family is alerted',
    body: 'On call, WhatsApp and SMS, with your live location.',
    Icon: Users,
  },
  {
    id: 'roadside',
    title: 'Roadside help reaches the vehicle',
    body: 'Towing and minor repairs · fuel delivery · flat tyre · battery jump-start · lockout help. Included on Shield and Shield+ plans.',
    Icon: Wrench,
  },
];
