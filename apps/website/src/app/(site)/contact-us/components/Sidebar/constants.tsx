import type { ComponentType, SVGProps } from 'react';
import { Mail, MapPin, type LucideIcon } from 'lucide-react';
import { socialLinks, type SocialLink } from '@/layouts/Footer/constants';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

export { WhatsAppIcon };

type IconLike = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export interface ContactCard {
  key: string;
  Icon: IconLike;
  label: string;
  primary: string;
  href?: string;
  /** Brand / channel color for the icon. */
  brandColor: string;
}

export const contactCards: ContactCard[] = [
  {
    key: 'email',
    Icon: Mail,
    label: 'Email Us',
    primary: 'contact@autolokate.com',
    href: 'mailto:contact@autolokate.com',
    brandColor: '#3B82F6',
  },
  {
    key: 'whatsapp',
    Icon: WhatsAppIcon,
    label: 'WhatsApp Support',
    primary: '+91 906 252 4516',
    href: 'https://wa.me/919062524516',
    brandColor: '#25D366',
  },
  {
    key: 'office',
    Icon: MapPin,
    label: 'Office Location',
    primary: 'E 90 / 91 Chanakya Place, Delhi - 110059',
    brandColor: '#F59E0B',
  },
];

export interface SocialItem {
  id: SocialLink['id'];
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  brandColor: string;
}

/** Same destinations as site footer — single source of truth. */
export const socials: SocialItem[] = socialLinks.map(({ id, label, href, Icon, brandColor }) => ({
  id,
  label,
  href,
  Icon,
  brandColor,
}));
