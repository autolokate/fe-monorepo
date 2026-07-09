import type { PrepaidScreenId, PrepaidScreenInventoryEntry } from '../types.js';

export const prepaidScreenInventory: Record<PrepaidScreenId, PrepaidScreenInventoryEntry> = {
  PrepaidEntry: {
    id: 'PrepaidEntry',
    stepId: 'prepaid.entry',
    featureFolder: 'features/qr-prepaid/screens/pr01-prepaid-entry',
    figmaRef: 'Pre-paid · Entry',
    description: 'Explain pre-paid fleet activation before code entry',
  },
  ActivationCode: {
    id: 'ActivationCode',
    stepId: 'prepaid.activation-code',
    featureFolder: 'features/qr-prepaid/screens/pr02-activation-code',
    figmaRef: 'Pre-paid · Activation code input',
    description: 'Enter organisation activation code',
  },
  CodeValidation: {
    id: 'CodeValidation',
    stepId: 'prepaid.code-validation',
    featureFolder: 'features/qr-prepaid/screens/pr03-code-validation',
    figmaRef: 'Pre-paid · Code validation',
    description: 'Validate code before merging into shared onboarding',
  },
};
