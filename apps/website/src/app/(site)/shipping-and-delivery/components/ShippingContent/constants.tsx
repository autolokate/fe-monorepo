import type { ShippingSection } from './types';

/**
 * Source of truth for the body of the Shipping & Delivery page. Each entry maps
 * 1:1 to a numbered section in the rendered document and feeds the sticky
 * table of contents.
 */
export const SHIPPING_SECTIONS: ShippingSection[] = [
  {
    number: '1',
    id: 'scope',
    title: 'Scope',
    intro: 'This policy applies to physical products shipped by Autolokate.',
    blocks: [
      {
        bullets: [
          'Smart QR stickers and other physical items are shipped to your address.',
          'Protection plans and expert sessions are delivered digitally and are not shipped.',
        ],
      },
    ],
  },
  {
    number: '2',
    id: 'where-we-deliver',
    title: 'Where we deliver',
    intro: 'We ship across India to serviceable pincodes.',
    blocks: [
      {
        body: 'At checkout we check whether your pincode is serviceable. If it is not, we tell you before you pay, so you are never charged for an address we cannot reach.',
      },
    ],
  },
  {
    number: '3',
    id: 'dispatch-timelines',
    title: 'Dispatch timelines',
    intro: 'We dispatch quickly once your prepaid order is confirmed.',
    blocks: [
      {
        bullets: [
          'Orders are usually dispatched within 2 business days of a confirmed order.',
          'You receive an SMS and email with a tracking link the moment your order ships.',
        ],
      },
    ],
  },
  {
    number: '4',
    id: 'delivery-timelines',
    title: 'Delivery timelines',
    intro: 'Delivery time depends on your location.',
    blocks: [
      {
        bullets: [
          'Standard delivery usually takes 3 to 7 business days after dispatch.',
          'Remote or hard-to-reach areas may take a little longer.',
          'Public holidays and weather can affect courier timelines.',
        ],
      },
    ],
  },
  {
    number: '5',
    id: 'shipping-charges',
    title: 'Shipping charges',
    intro: 'Any shipping charge is always shown before you pay.',
    blocks: [
      {
        body: 'Shipping charges, where they apply, appear at checkout before payment, so there are no surprises. Where an order qualifies for free shipping, it is applied automatically.',
      },
    ],
  },
  {
    number: '6',
    id: 'tracking-your-order',
    title: 'Tracking your order',
    intro: 'You can follow your order at every step.',
    blocks: [
      {
        bullets: [
          'Track your order any time from My orders in the app, or from the tracking link in your dispatch message.',
          'Every status change (dispatched, in transit, out for delivery, delivered) is timestamped.',
        ],
      },
    ],
  },
  {
    number: '7',
    id: 'failed-or-delayed-delivery',
    title: 'Failed or delayed delivery',
    intro: 'Sometimes a delivery needs another attempt.',
    blocks: [
      {
        bullets: [
          'If a delivery attempt fails, our courier partner will retry in line with their policy.',
          'If your order is delayed beyond the expected window, contact us and we will follow up with the courier on your behalf.',
        ],
      },
    ],
  },
  {
    number: '8',
    id: 'wrong-or-damaged-shipments',
    title: 'Wrong or damaged shipments',
    intro: 'If something is not right, we will fix it.',
    blocks: [
      {
        body: 'If your parcel arrives damaged, or with the wrong item, tell us within 48 hours with a photo. We will arrange a replacement or a refund as set out in our Refund & cancellation policy.',
      },
    ],
  },
  {
    number: '9',
    id: 'contact-information',
    title: 'Contact information',
    intro: 'Questions about a delivery?',
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
export const SHIPPING_TOC = SHIPPING_SECTIONS.map((section) => ({
  number: section.number,
  id: section.id,
  title: section.title,
}));
