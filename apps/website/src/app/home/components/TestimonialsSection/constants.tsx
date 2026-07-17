import type { Testimonial, TestimonialsCopy } from './types';

export const TESTIMONIALS_COPY: TestimonialsCopy = {
  eyebrow: 'Owners',
  headline: 'Trusted on',
  headlineAccent: 'real roads.',
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'aarav',
    quote:
      'After my accident, Autolokate detected it instantly. My family was alerted and help was on the way within minutes.',
    name: 'Aarav Mehta',
    role: 'Owner · Gurugram',
  },
  {
    id: 'neha',
    quote:
      'My husband’s phone alerted me on WhatsApp before he could call. I knew where he was and that help was coming.',
    name: 'Neha Verma',
    role: 'Emergency contact · Pune',
  },
  {
    id: 'karan',
    quote:
      'Someone knocked my bike over in parking. They scanned the sticker, I got the masked call, and my number was never shown.',
    name: 'Karan Shah',
    role: 'Bike owner · Delhi',
  },
];
