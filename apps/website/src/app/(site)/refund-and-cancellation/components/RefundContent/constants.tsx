import type { RefundSection } from './types';

/**
 * Source of truth for the body of the Refund & Cancellation page. Each entry
 * maps 1:1 to a numbered section in the rendered document and feeds the sticky
 * table of contents.
 */
export const REFUND_SECTIONS: RefundSection[] = [
  {
    number: '1',
    id: 'scope',
    title: 'Scope',
    intro:
      'This policy explains cancellations and refunds for everything you can buy from Autolokate. It works alongside our Terms & conditions and our Shipping & delivery policy.',
    blocks: [
      {
        bullets: [
          'Annual protection plans (subscriptions).',
          'Smart QR stickers and other physical products.',
          'Expert advisory sessions.',
        ],
      },
    ],
  },
  {
    number: '2',
    id: 'protection-plans',
    title: 'Protection plans',
    intro: 'Protection plans are annual and begin the moment you activate a plan on a vehicle.',
    blocks: [
      {
        bullets: [
          'Before activation: cancel for a full refund within 7 days of purchase, as long as the plan has not been activated on any vehicle.',
          'After activation: plans are non-refundable, because your cover starts immediately. We may make exceptions for a billing error or a duplicate charge.',
          'Duplicate or failed transactions are always refunded in full.',
        ],
      },
    ],
  },
  {
    number: '3',
    id: 'smart-qr-stickers',
    title: 'Smart QR stickers',
    intro:
      'Physical products can be returned when they are unused and in their original condition.',
    blocks: [
      {
        bullets: [
          'Unused, unopened stickers can be returned within 7 days of delivery. Return shipping may be deducted from the refund.',
          'Damaged or defective on arrival: tell us within 48 hours with a photo, and we will send a free replacement or a full refund.',
          'Once a QR sticker is activated and linked to your account, it can no longer be returned.',
        ],
      },
    ],
  },
  {
    number: '4',
    id: 'expert-advisory-sessions',
    title: 'Expert advisory sessions',
    intro: 'You can cancel or reschedule a booked session from the app.',
    blocks: [
      {
        bullets: [
          'Cancel or reschedule up to 24 hours before your slot for a full refund or a free reschedule.',
          'Cancellations within 24 hours of the slot, or no-shows, are non-refundable.',
        ],
      },
    ],
  },
  {
    number: '5',
    id: 'how-refunds-are-processed',
    title: 'How refunds are processed',
    intro: 'Approved refunds go back to your original payment method through our payment partner.',
    blocks: [
      {
        bullets: [
          'We initiate approved refunds within 3 business days of approval.',
          'Refunds usually reach your account within 5 to 7 business days, depending on your bank.',
          'We keep you updated by SMS and email at each step.',
        ],
      },
    ],
  },
  {
    number: '6',
    id: 'non-refundable-items',
    title: 'Non-refundable items',
    intro: 'Some purchases cannot be refunded once they are used.',
    blocks: [
      {
        bullets: [
          'Activated protection plans and activated QR stickers.',
          'Completed expert sessions.',
          'Products misused or damaged after delivery.',
        ],
      },
    ],
  },
  {
    number: '7',
    id: 'how-to-cancel-or-request-a-refund',
    title: 'How to cancel or request a refund',
    intro: 'The fastest way to reach us is from the app.',
    blocks: [
      {
        bullets: [
          'Open My orders in the app, or email support@autolokate.com with your order number.',
          'For protection plans, you can also manage cancellation from your profile.',
          'Tell us the reason so we can make it right.',
        ],
      },
    ],
  },
  {
    number: '8',
    id: 'contact-information',
    title: 'Contact information',
    intro: 'Questions about a refund or cancellation?',
    blocks: [
      {
        rows: [{ label: 'Email', value: 'support@autolokate.com' }],
      },
      {
        heading: 'Mailing address',
        body: 'Autolokate Software Private Limited\nE 90 Chanakya Place Delhi, India',
      },
    ],
  },
];

/** Auto-generated table-of-contents entries (top-level sections only). */
export const REFUND_TOC = REFUND_SECTIONS.map((section) => ({
  number: section.number,
  id: section.id,
  title: section.title,
}));
