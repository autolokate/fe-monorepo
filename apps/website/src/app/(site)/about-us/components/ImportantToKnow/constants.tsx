import type { ImportantCopy, ImportantFact } from './types';

export const IMPORTANT_COPY: ImportantCopy = {
  eyebrow: 'Important to know',
  headline: 'The fine print,',
  headlineAccent: 'up front.',
};

export const IMPORTANT_FACTS: ImportantFact[] = [
  {
    id: 'not-replacement',
    title: 'Autolokate doesn’t replace official emergency services.',
    body: 'In an emergency, call 112 first. Autolokate then alerts your contacts and gets partner help moving.',
  },
  {
    id: 'availability',
    title: 'Partner services depend on availability.',
    body: 'Ambulance dispatch, roadside help and insurance depend on your plan and active partner coverage in your area.',
  },
  {
    id: 'accuracy',
    title: 'Your information must be accurate.',
    body: 'Keep emergency contacts, vehicle and ownership details up to date so the system works when it counts.',
  },
  {
    id: 'consent',
    title: 'Consent and privacy stay central.',
    body: 'Information is shown only per your permissions, your plan and the emergency context. You control what’s shared.',
  },
];
