import type { FaqCopy, FaqItem } from './types';

export const FAQ_COPY: FaqCopy = {
  eyebrow: 'Clear answers',
  headline: 'What people ask',
  headlineAccent: 'before they trust us.',
};

export const FAQS: FaqItem[] = [
  {
    id: 'what',
    question: 'What exactly is Autolokate?',
    answer:
      'A connected safety system for Indian vehicles: crash detection on your phone, family alerts, Control Center coordination, and a Smart QR backup on the car—so help can start even when you cannot act.',
  },
  {
    id: 'replace',
    question: 'Does Autolokate replace emergency services?',
    answer:
      'No. Call 112 in an emergency. Autolokate works alongside official services by alerting your family and coordinating partner response with your live context.',
  },
  {
    id: 'how-crash',
    question: 'What if I crash and cannot reach my phone?',
    answer:
      'If crash detection confirms a serious impact, Autolokate can notify your emergency contacts and start partner response with your location—without you unlocking the phone. A bystander can also scan the Smart QR to start help.',
  },
  {
    id: 'false-alarms',
    question: 'What about false alarms?',
    answer:
      'Serious-impact detection includes a short cancel window when you are able to respond. The system is designed to reduce noise while still moving fast when you cannot cancel.',
  },
  {
    id: 'data',
    question: 'Is my data sold or exposed?',
    answer:
      'No. We do not sell your data. Information is encrypted and shared only with your permission, your plan rules, and the emergency context—and you can change sharing in the app anytime.',
  },
  {
    id: 'coverage',
    question: 'Where does partner help actually work?',
    answer:
      'Ambulance and roadside partners depend on active coverage near you and your plan. Autolokate still alerts family and keeps Control Center coordination live even when the nearest partner is farther away.',
  },
];
