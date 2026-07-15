import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  /** Monogram shown in the avatar circle (e.g. "AM"). */
  initials: string;
  /** Star rating out of 5. */
  rating: number;
  quote: string;
  location: string;
}

export interface TestimonialStat {
  id: string;
  value: string;
  label: string;
  Icon: ComponentType<LucideProps>;
}

export interface TestimonialsCopy {
  eyebrow: string;
  headlinePrefix: string;
  headlineEmphasis: string;
  headlineSuffix: string;
  subheading: string;
  trustline: string;
}
