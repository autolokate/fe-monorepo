import { Car, IndianRupee, ShieldCheck, Smartphone } from 'lucide-react';
import { SAFETY_PACKS_SECTION_ID } from '../SafetyPacksSection/constants';
import type { GettingStartedCopy, GettingStartedStep } from './types';

export const GETTING_STARTED_COPY: GettingStartedCopy = {
  eyebrow: 'Protection in minutes',
  headline: 'Configure once. Drive with ',
  headlineAccent: 'confidence',
  headlineSuffix: ' every time.',
  subheadline: 'No hardware to install. No wiring. Just your phone and a few details.',
  cta: { label: 'View plans', href: `/#${SAFETY_PACKS_SECTION_ID}` },
};

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    id: 'choose-plan',
    title: 'Choose your plan',
    body: 'Protect, Guardian, or Guardian Plus—from ₹999 a year. Checkout takes minutes.',
    Icon: IndianRupee,
  },
  {
    id: 'activate',
    title: 'Activate in the app',
    body: 'Add your vehicle and emergency contacts. Crash detection activates immediately.',
    Icon: Smartphone,
  },
  {
    id: 'drive',
    title: 'Drive as you always do',
    body: 'Nothing to press, nothing to remember. Protection runs quietly on every trip.',
    Icon: Car,
  },
  {
    id: 'protected',
    title: 'Stay protected',
    body: 'If the worst happens, our 24/7 Control Center coordinates response and alerts your family.',
    Icon: ShieldCheck,
    highlight: true,
  },
];
