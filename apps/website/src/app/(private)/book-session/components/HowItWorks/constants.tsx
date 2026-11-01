export interface FlowStep {
  step: string;
  title: string;
  text: string;
}

export const FLOW_STEPS: ReadonlyArray<FlowStep> = [
  {
    step: '1',
    title: 'Sign in',
    text: 'OTP login links your bookings to your account.',
  },
  {
    step: '2',
    title: 'Pick a slot',
    text: 'Choose a date & time from the slots we have published.',
  },
  {
    step: '3',
    title: 'Request it',
    text: 'Your booking is created straight away and shows as Requested.',
  },
  {
    step: '4',
    title: 'Get confirmed',
    text: 'The status changes to Confirmed once our team confirms the slot — check it here anytime.',
  },
] as const;
