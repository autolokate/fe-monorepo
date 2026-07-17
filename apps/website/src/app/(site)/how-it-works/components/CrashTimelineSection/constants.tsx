import { Activity, Radio, Share2, ShieldCheck, Timer } from 'lucide-react';
import type { CrashTimelineCopy, TimelineStep } from './types';

export const CRASH_TIMELINE_COPY: CrashTimelineCopy = {
  eyebrow: 'The primary layer',
  headline: 'What happens in the moments',
  headlineAccent: 'after impact.',
  subheadingLines: [
    'The full sequence, from detection to dispatch.',
    'Nothing depends on you being able to respond.',
  ],
  callout:
    'Built to act when every second counts. And built to stand down the moment you say you’re fine.',
};

export const CRASH_TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'detect',
    title: 'Detect',
    body: 'Your phone reads a severe impact the moment it happens.',
    Icon: Activity,
    tone: 'brand',
  },
  {
    id: 'cancel',
    title: 'Cancel if you’re fine',
    body: 'You get 30 seconds to cancel a false alarm in one tap. Nothing is sent if you do.',
    Icon: Timer,
    tone: 'warn',
  },
  {
    id: 'control-center',
    title: 'Control Center',
    body: 'If you don’t respond, our 24/7 Control Center is alerted automatically. It calls you and watches your live location.',
    Icon: Radio,
    tone: 'brand',
  },
  {
    id: 'everything-sent',
    title: 'Everything sent together',
    body: 'An ambulance heads to your location while your family is alerted on call, WhatsApp and SMS, with your live location.',
    Icon: Share2,
    tone: 'brand',
  },
  {
    id: 'cover-activated',
    title: 'Cover activated',
    body: 'The ambulance bill is covered and hospital care is cashless at network hospitals. Roadside help and cover amounts vary by plan.',
    Icon: ShieldCheck,
    tone: 'brand',
  },
];
