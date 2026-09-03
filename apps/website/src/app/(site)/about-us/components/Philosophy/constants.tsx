import type { BeliefTile, PhilosophyCopy } from './types';

export const PHILOSOPHY_COPY: PhilosophyCopy = {
  eyebrow: 'What we build for',
  headline: 'Four truths.',
  headlineAccent: 'One safety system.',
  subheading:
    'Every product decision at Autolokate starts here—and ships in the app, not as a slide.',
};

export const BELIEF_TILES: BeliefTile[] = [
  {
    id: 'automatic',
    title: 'Help must work when you cannot.',
    body: 'Crash detection runs in the background. If you are unconscious or unreachable, the response can still start—without a tap, without a call.',
  },
  {
    id: 'backup',
    title: 'The vehicle needs a backup path.',
    body: 'When the phone fails or a bystander arrives first, the Smart QR works with any camera. No app. No login. Just a path to help.',
  },
  {
    id: 'privacy',
    title: 'Safety should never expose your number.',
    body: 'Park Me verifies intent, then connects through a protected call path. Your personal number stays private—even when a stranger needs you moved.',
  },
  {
    id: 'record',
    title: 'Protection should travel with the car.',
    body: 'QR identity, ownership context, and service history stay with the vehicle. So the next driver is not starting from zero.',
  },
];
