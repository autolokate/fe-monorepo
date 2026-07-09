import { EmergencyOtpScreen, type EmergencyOtpScreenProps } from '../shared/EmergencyOtpScreen.js';

export type E07ContactOtpScreenProps = Omit<EmergencyOtpScreenProps, 'step'>;

/** E2 · Contact OTP — Figma 789:2027 */
export function E07ContactOtpScreen(props: E07ContactOtpScreenProps) {
  return <EmergencyOtpScreen {...props} step={7} />;
}
