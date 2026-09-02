export const QR_FLOW_STEPS = [
  {
    id: 'connected',
    label: 'Connected',
    detail: "You're connected to our Control Center.",
    icon: 'headset',
  },
  {
    id: 'location',
    label: 'Location shared',
    detail: 'We get the exact location.',
    icon: 'pin',
  },
  {
    id: 'dispatch',
    label: 'Help dispatched',
    detail: 'Right help is sent your way.',
    icon: 'bell',
  },
  {
    id: 'support',
    label: "You're not alone",
    detail: "We stay with you until you're safe.",
    icon: 'check',
  },
] as const;

export const QR_FLOW_HEADING = 'What happens after scan?';
