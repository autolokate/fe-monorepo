import type { FeatureNavigation } from '@/navigation/types';

export const howQrWorksNavigation: FeatureNavigation = {
  id: 'how-it-works',
  label: 'How It Works',
  href: '/how-it-works',
  order: 2,
  showInHeader: true,
  showInFooter: true,
};

/** @deprecated Use howQrWorksNavigation */
export const shopNavigation = howQrWorksNavigation;
