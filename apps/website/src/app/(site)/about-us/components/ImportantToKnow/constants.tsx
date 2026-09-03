import type { ImportantCopy, ImportantFact } from './types';

export const IMPORTANT_COPY: ImportantCopy = {
  eyebrow: 'Trust, in plain terms',
  headline: 'What we will always',
  headlineAccent: 'tell you up front.',
};

export const IMPORTANT_FACTS: ImportantFact[] = [
  {
    id: 'not-replacement',
    title: 'We do not replace 112.',
    body: 'In an emergency, call India’s official emergency number first. Autolokate coordinates partner help and family alerts alongside that system—not instead of it.',
  },
  {
    id: 'availability',
    title: 'Partner response depends on coverage.',
    body: 'Ambulance, roadside, and related services depend on your plan and active partners near you. Family alerts and Control Center coordination still move when local assets are farther away.',
  },
  {
    id: 'accuracy',
    title: 'Your details must stay accurate.',
    body: 'Emergency contacts, vehicle info, and ownership records are only useful if they are current. Keep them updated so the system has the right people and context when seconds matter.',
  },
  {
    id: 'consent',
    title: 'You control what gets shared.',
    body: 'Information is shown only with your permissions, your plan, and the emergency context. You can change sharing settings in the app anytime.',
  },
];
