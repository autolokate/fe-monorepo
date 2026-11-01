export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: ReadonlyArray<FaqItem> = [
  {
    q: 'Can I book more than one session?',
    a: 'Yes. Each slot is a separate booking. Manage them all under Your bookings.',
  },
  {
    q: 'Is my slot confirmed straight away?',
    a: 'Your request holds the slot and shows as Requested. It shows Confirmed only once our team has confirmed it.',
  },
  {
    q: 'How do I cancel?',
    a: 'Use Cancel on a booking under Your bookings while it is Requested or Confirmed.',
  },
  {
    q: 'Is this financial or legal advice?',
    a: "No — it's practical car-buying guidance. For loans, insurance, or contracts, consult licensed professionals.",
  },
] as const;
