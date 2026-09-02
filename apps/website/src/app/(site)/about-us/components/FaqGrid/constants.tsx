import type { FaqCopy, FaqItem } from './types';

export const FAQ_COPY: FaqCopy = {
  eyebrow: 'Questions, answered',
  headline: 'Autolokate, in',
  headlineAccent: 'plain terms.',
};

export const FAQS: FaqItem[] = [
  {
    id: 'what',
    question: 'What is Autolokate?',
    answer:
      'An app-first vehicle safety platform for India, built by Autolokate Software Private Limited. The app detects a serious crash without you touching the phone and gets help moving. The Smart QR on the vehicle is the backup that works even without the app.',
  },
  {
    id: 'replace',
    question: 'Does Autolokate replace emergency services?',
    answer:
      'No. In an emergency, call 112 first. Autolokate coordinates help and works alongside official services.',
  },
  {
    id: 'data',
    question: 'Is my data safe?',
    answer:
      'Yes. Your data is encrypted and we never sell it. It’s shown only with your permission, per your plan and the emergency context—and you can change what’s shared in the app anytime.',
  },
];
