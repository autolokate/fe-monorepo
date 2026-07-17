import type { FeatureNavigation } from '@/navigation/types';

export const emergencySafetyNavigation: FeatureNavigation = {
  id: 'emergency-safety',
  label: 'Emergency & Safety',
  href: '/emergency-safety',
  order: 4,
  showInHeader: true,
  showInFooter: true,
};

/** @deprecated Use emergencySafetyNavigation */
export const safetyNavigation = emergencySafetyNavigation;
