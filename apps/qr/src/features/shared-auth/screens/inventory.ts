import type { ScreenInventoryEntry } from '@/types/flow.js';

export const sharedAuthScreenInventory = [
  {
    id: 'Splash',
    stepId: 'shared.splash',
    featureFolder: 'features/shared-auth/screens/s0-splash',
    figmaRef: '27:98',
    description: 'App splash with logo and loading indicator',
  },
  {
    id: 'MobileCapture',
    stepId: 'shared.mobile',
    featureFolder: 'features/shared-auth/screens/a1-mobile',
    figmaRef: '102:268 · 557:1606',
    description: 'Mobile capture with inline consent',
  },
  {
    id: 'OtpVerify',
    stepId: 'shared.otp',
    featureFolder: 'features/shared-auth/screens/a2-otp',
    figmaRef: '103:324 · 557:1647',
    description: 'OTP verification with resend and SMS fallback',
  },
] as const satisfies readonly ScreenInventoryEntry[];
