import { Mail } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import {
  INSTAGRAM_URL,
  LINKEDIN_URL,
  SUPPORT_EMAIL,
  WHATSAPP_URL,
} from '@/layouts/Footer/constants';
import type { ContactChannel, FollowLink } from './types';

export const FORM_COPY = {
  heading: 'Send us a message.',
  status: 'Usually replies within a day',
  fields: {
    name: { label: 'Your name', placeholder: 'e.g. Rahul Sharma' },
    email: { label: 'Email address', placeholder: 'you@email.com' },
    phone: { label: 'Phone number', prefix: '+91', placeholder: '98765 43210' },
    message: { label: 'How can we help?', placeholder: 'Tell us what you need' },
  },
  submit: 'Send message',
  privacyHref: '/privacy-policy',
} as const;

export const CHANNELS_EYEBROW = 'Or reach us directly';

const WHATSAPP_NUMBER = '+91 90625 24516';

export const CHANNELS: ContactChannel[] = [
  {
    key: 'whatsapp',
    Icon: WhatsAppIcon,
    label: 'WhatsApp us',
    value: WHATSAPP_NUMBER,
    href: WHATSAPP_URL,
    external: true,
  },
  {
    key: 'email',
    Icon: Mail,
    label: 'Email us',
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
  },
];

export const FOLLOW_LINKS: FollowLink[] = [
  { id: 'instagram', label: 'Instagram', href: INSTAGRAM_URL },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@IndianDriveGuide' },
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/' },
  { id: 'linkedin', label: 'LinkedIn', href: LINKEDIN_URL },
];
