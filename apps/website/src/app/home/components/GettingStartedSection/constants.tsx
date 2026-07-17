import { Car, IndianRupee, ShieldCheck, Smartphone } from 'lucide-react';
import { SAFETY_PACKS_SECTION_ID } from '../SafetyPacksSection/constants';
import type { GettingStartedCopy, GettingStartedStep } from './types';

export const GETTING_STARTED_COPY: GettingStartedCopy = {
  eyebrow: 'Get started',
  headline: 'Set it once. It ',
  headlineAccent: 'protects',
  headlineSuffix: ' every drive.',
  subheadline: 'One quick setup. No device to install, no wiring.',
  cta: { label: 'See plans', href: `/#${SAFETY_PACKS_SECTION_ID}` },
};

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    id: 'choose-plan',
    title: 'Choose your plan',
    body: 'Secure, Shield or Shield+, from ₹999 a year. Pay in minutes.',
    Icon: IndianRupee,
  },
  {
    id: 'activate',
    title: 'Activate in the app',
    body: 'Download the app, add your vehicle and contacts. Crash detection is on from that minute.',
    Icon: Smartphone,
  },
  {
    id: 'drive',
    title: 'Drive like always',
    body: 'Nothing to press, nothing to remember. It quietly looks out for you on every trip.',
    Icon: Car,
  },
  {
    id: 'protected',
    title: 'Stay protected',
    body: 'If something goes wrong, our 24/7 Control Center gets help moving and alerts your family.',
    Icon: ShieldCheck,
    highlight: true,
  },
];
