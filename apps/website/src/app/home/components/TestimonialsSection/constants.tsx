import { CarFront, ShieldCheck, UsersRound } from 'lucide-react';
import type { Testimonial, TestimonialStat, TestimonialsCopy } from './types';

/** In-page anchor — nav/deep links can scroll here. */
export const TESTIMONIALS_SECTION_ID = 'testimonials';

/** Faint car-silhouette line-art plate sitting behind the section. */
export const TESTIMONIALS_BACKGROUND = '/images/home/testimonialBgImage.png';

export const TESTIMONIALS_COPY: TestimonialsCopy = {
  eyebrow: 'Testimonials',
  headlinePrefix: 'What our ',
  headlineEmphasis: 'owners',
  headlineSuffix: ' say.',
  subheading: 'Real drivers, real peace of mind on every journey.',
  trustline: 'Trusted by thousands of drivers across India',
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'aarav-mehta',
    name: 'Aarav Mehta',
    role: 'Car Owner',
    initials: 'AM',
    rating: 5,
    quote:
      'After a minor accident, Autolokate detected it instantly. My family was alerted and help was on the way within minutes. Truly lifesaving!',
    location: 'Gurugram',
  },
  {
    id: 'rohan-gupta',
    name: 'Rohan Gupta',
    role: 'Fleet Owner',
    initials: 'RG',
    rating: 5,
    quote:
      'Managing service and maintenance across my vehicles is so easy now. Everything is in one place and I get real-time alerts.',
    location: 'Mumbai',
  },
  {
    id: 'neha-verma',
    name: 'Neha Verma',
    role: 'Car Owner',
    initials: 'NV',
    rating: 5,
    quote:
      "The emergency alert feature gives me real peace of mind. In a critical moment, it's the one thing that matters most.",
    location: 'Pune',
  },
  {
    id: 'karan-shah',
    name: 'Karan Shah',
    role: 'Car Owner',
    initials: 'KS',
    rating: 5,
    quote:
      'Setup was clearly simple. The QR sticker and app work exactly as promised — I recommend it to every driver I know.',
    location: 'Delhi',
  },
  {
    id: 'isha-nair',
    name: 'Isha Nair',
    role: 'Car Owner',
    initials: 'IN',
    rating: 5,
    quote:
      'Parking help and roadside assistance saved me on a late-night highway breakdown. Support responded in minutes.',
    location: 'Bengaluru',
  },
];

export const TESTIMONIAL_STATS: TestimonialStat[] = [
  { id: 'rating', value: '4.8', label: 'Average Rating', Icon: ShieldCheck },
  { id: 'customers', value: '42,000+', label: 'Happy Customers', Icon: UsersRound },
  { id: 'protected', value: '1.8L+', label: 'Cars Protected', Icon: CarFront },
];
