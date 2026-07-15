export const FAQ_COPY = {
  heading: 'Pricing FAQs',
} as const;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: { left: FaqItem[]; right: FaqItem[] } = {
  left: [
    {
      id: 'billing',
      question: 'How is Autolokate billed?',
      answer:
        'Plans are billed annually, per vehicle. You pay once for the year and stay covered — no monthly surprises or hidden charges.',
    },
    {
      id: 'switch-plans',
      question: 'Can I upgrade or downgrade later?',
      answer:
        'Yes. You can switch plans anytime from your profile. Upgrades apply instantly and we adjust the balance on your next renewal.',
    },
    {
      id: 'multiple-vehicles',
      question: 'Do I need a separate plan for each vehicle?',
      answer:
        'Each vehicle has its own Smart QR and plan, but you manage them all from a single account. Multi-vehicle owners get bundled savings at checkout.',
    },
  ],
  right: [
    {
      id: 'refunds',
      question: 'Is there a refund if I cancel?',
      answer:
        "You can cancel anytime. If you cancel within 7 days of purchase and haven't used the emergency services, you're eligible for a full refund.",
    },
    {
      id: 'ambulance-cover',
      question: "What does the Complete plan's ambulance cover include?",
      answer:
        'The Complete plan includes ambulance dispatch across India plus roadside assistance — towing, fuel delivery, flat-tyre help, battery jump start and lockout support.',
    },
  ],
};
