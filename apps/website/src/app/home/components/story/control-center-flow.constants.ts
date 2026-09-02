export const CONTROL_CENTER_FLOW_HEADING = 'What happens when a crash is confirmed?';

export const CONTROL_CENTER_FLOW_STEPS = [
  {
    id: 'crash',
    label: 'Crash confirmed',
    detail: 'Severe impact verified on your device.',
    icon: 'crash',
  },
  {
    id: 'control',
    label: 'Control Center notified',
    detail: 'Our 24/7 operations team takes over.',
    icon: 'headset',
  },
  {
    id: 'location',
    label: 'Live location tracked',
    detail: 'We see exactly where you are.',
    icon: 'pin',
  },
  {
    id: 'dispatch',
    label: 'Help dispatched',
    detail: 'Ambulance, police, or roadside—coordinated.',
    icon: 'dispatch',
  },
  {
    id: 'enroute',
    label: 'On the way',
    detail: 'We stay with you until help arrives.',
    icon: 'check',
  },
] as const;
