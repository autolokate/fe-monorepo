import type { BeliefTile, PhilosophyCopy } from './types';

export const PHILOSOPHY_COPY: PhilosophyCopy = {
  eyebrow: 'What we believe',
  headline: 'Four beliefs,',
  headlineAccent: 'one product.',
  subheading: 'All four are live in the app today.',
};

export const BELIEF_TILES: BeliefTile[] = [
  {
    id: 'automatic',
    title: 'The app has your back automatically.',
    body: 'Crash detection runs in the background, so help can start even when you can’t reach your phone.',
  },
  {
    id: 'backup',
    title: 'When the phone can’t, the car still can.',
    body: 'If your phone is unreachable or a bystander arrives first, the Smart QR works with any camera. No app, no login.',
  },
  {
    id: 'privacy',
    title: 'Your number is nobody’s business.',
    body: 'Park Me verifies the request, then an AI call reaches you. Your number stays private.',
  },
  {
    id: 'record',
    title: 'The car keeps its own record.',
    body: 'Service history, QR identity and ownership records stay with the vehicle, not just the current owner.',
  },
];
