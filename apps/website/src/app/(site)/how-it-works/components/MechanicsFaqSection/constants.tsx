import type { MechanicsFaqCopy, MechanicsFaqItem } from './types';

export const MECHANICS_FAQ_COPY: MechanicsFaqCopy = {
  eyebrow: 'Questions, answered',
  headline: 'How it works, in',
  headlineAccent: 'plain terms.',
  note: 'Cover amounts and roadside distance vary by plan.',
  noteLink: { label: 'Compare plans & pricing →', href: '/pricing' },
};

export const MECHANICS_FAQS: MechanicsFaqItem[] = [
  {
    id: 'device',
    question: 'Do I need to install any device in my car?',
    answer:
      'No hardware, ever. Crash detection runs on your phone. The Smart QR sticker goes on your vehicle, and that is the whole install.',
  },
  {
    id: 'battery',
    question: 'Will it drain my battery or data?',
    answer:
      'It uses your phone’s low-power motion sensors, not the camera or GPS running full time, so the battery and data impact is designed to be minimal.',
  },
  {
    id: 'crash',
    question: 'What actually happens if I crash?',
    answer:
      'Your phone detects the impact and starts a countdown you can cancel. If you don’t, our 24/7 Control Center is alerted and your family is alerted on call, WhatsApp and SMS with your live location. An ambulance and roadside help are sent, as per your plan.',
  },
  {
    id: 'false-alarm',
    question: 'What if it’s a false alarm?',
    answer: 'You get 30 seconds to cancel in one tap. Nothing is sent if you do.',
  },
  {
    id: 'phone-broken',
    question: 'What if my phone is broken, dead or has no signal after a crash?',
    answer:
      'Phone-based detection needs a working phone. That is exactly why the Smart QR lives on the vehicle: a bystander can scan it and reach our 24/7 Control Center from their own phone.',
  },
  {
    id: 'setup',
    question: 'How do I set it up?',
    answer:
      'Choose a plan, then enter your registration number and the OTP we send on WhatsApp. We check the vehicle against Vahan so the cover is tied to the right vehicle. Crash detection is live from your next drive.',
  },
  {
    id: 'scan-no-app',
    question: 'Can anyone scan the QR without an app?',
    answer:
      'Yes. Any phone camera works. No app, no login, and emergency scanning is never blocked.',
  },
  {
    id: 'privacy',
    question: 'Will strangers see my number?',
    answer:
      'Never. A scanner never calls you directly. Park Me requests are verified, then our system places an AI call to you. Emergency taps go to our 24/7 Control Center.',
  },
];
