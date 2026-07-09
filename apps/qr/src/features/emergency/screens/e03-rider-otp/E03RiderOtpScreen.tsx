import { EmergencyOtpScreen, type EmergencyOtpScreenProps } from '../shared/EmergencyOtpScreen.js';

export type E03RiderOtpScreenProps = Omit<EmergencyOtpScreenProps, 'step'>;

/** R2 · Rider OTP — Figma 789:2109 */
export function E03RiderOtpScreen(props: E03RiderOtpScreenProps) {
  return <EmergencyOtpScreen {...props} step={3} />;
}
