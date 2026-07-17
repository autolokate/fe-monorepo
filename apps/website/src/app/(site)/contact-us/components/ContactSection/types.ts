import type { ComponentType, SVGProps } from 'react';

export interface ContactChannel {
  key: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export interface FollowLink {
  id: string;
  label: string;
  href: string;
}
