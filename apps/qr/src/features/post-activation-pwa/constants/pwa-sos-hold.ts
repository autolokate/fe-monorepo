/** Must hold this long before entering the holding route — blocks accidental taps. */
export const PWA_SOS_HOLD_ENGAGE_MS = 200;

export type PwaSosHoldNavigationState = {
  holdStartAt: number;
};
