import type { ScreenInventoryEntry } from '@/types/flow.js';

export const sharedLegalScreenInventory = [
  {
    id: 'PrivacyPolicy',
    stepId: 'shared.mobile',
    featureFolder: 'features/shared-legal/screens/l1-privacy-policy',
    figmaRef: '60:156',
    description: 'Privacy Policy document reader',
  },
  {
    id: 'TermsConditions',
    stepId: 'shared.mobile',
    featureFolder: 'features/shared-legal/screens/l2-terms-conditions',
    figmaRef: '61:163',
    description: 'Terms & Conditions document reader',
  },
] as const satisfies readonly ScreenInventoryEntry[];
