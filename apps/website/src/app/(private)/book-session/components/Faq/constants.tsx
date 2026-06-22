export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: ReadonlyArray<FaqItem> = [
  {
    q: "Can I book more than one session?",
    a: "Yes. Each slot is a separate booking and payment. Manage them all under Your bookings.",
  },
  {
    q: "Payment didn't finish — what now?",
    a: "Open Your bookings and tap Complete payment on the pending row. Same slot is held until checkout completes or you cancel.",
  },
  {
    q: "How do I cancel?",
    a: "Use Cancel on a booking card when eligible. Refunds follow the policy shown at checkout.",
  },
  {
    q: "Is this financial or legal advice?",
    a: "No — it's practical car-buying guidance. For loans, insurance, or contracts, consult licensed professionals.",
  },
] as const;
