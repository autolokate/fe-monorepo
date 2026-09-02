import type { SocialLink } from '@/layouts/Footer/constants';

export interface SubscribeCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  cta: {
    label: string;
    href: string;
  };
  socialsPrefix: string;
  socials: SocialLink['id'][];
}
