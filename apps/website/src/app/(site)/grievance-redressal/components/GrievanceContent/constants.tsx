import type { GrievanceSection } from './types';

/**
 * Source of truth for the body of the Grievance Officer page. Each entry maps
 * 1:1 to a numbered section in the rendered document and feeds the sticky
 * table of contents.
 */
export const GRIEVANCE_SECTIONS: GrievanceSection[] = [
  {
    number: '1',
    id: 'our-commitment',
    title: 'Our commitment',
    intro: 'We take every complaint seriously and aim to resolve it quickly and fairly.',
    blocks: [
      {
        body: 'In line with the Consumer Protection (E-Commerce) Rules, 2020, the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023, we have appointed a Grievance Officer as a single point of contact for your concerns.',
      },
    ],
  },
  {
    number: '2',
    id: 'what-you-can-raise',
    title: 'What you can raise',
    intro: 'You can contact the Grievance Officer about any of the following.',
    blocks: [
      {
        bullets: [
          'Orders, payments, refunds, shipping, or delivery.',
          'Content on the Platform that you believe is unlawful or infringes your rights.',
          'Privacy and data-protection concerns under our Privacy Policy.',
          'Misuse of an Autolokate QR sticker or account.',
        ],
      },
    ],
  },
  {
    number: '3',
    id: 'grievance-officer',
    title: 'Grievance Officer',
    intro: 'Reach the Grievance Officer using the details below.',
    blocks: [
      {
        rows: [
          { label: 'Name', value: 'To be appointed (pending)' },
          { label: 'Designation', value: 'Grievance Officer' },
          { label: 'Company', value: 'Autolokate Software Private Limited' },
          { label: 'Email', value: 'support@autolokate.com' },
          { label: 'Address', value: 'E 90 Chanakya Place Delhi, India' },
        ],
      },
    ],
  },
  {
    number: '4',
    id: 'how-to-raise-a-grievance',
    title: 'How to raise a grievance',
    intro: 'Please include enough detail for us to help you quickly.',
    blocks: [
      {
        bullets: [
          'Email the Grievance Officer with your name and contact details.',
          'Include your order or account reference.',
          'Describe the issue and the outcome you are looking for.',
          'Attach any supporting documents or screenshots.',
        ],
      },
    ],
  },
  {
    number: '5',
    id: 'response-timelines',
    title: 'Response timelines',
    intro: 'We follow the timelines set out under applicable Indian rules.',
    blocks: [
      {
        bullets: [
          'We acknowledge your complaint within 48 hours of receiving it.',
          'We aim to resolve most complaints within 15 days.',
          'For data-protection requests, the timelines in our Privacy Policy (Section 14.3) apply.',
        ],
      },
    ],
  },
  {
    number: '6',
    id: 'escalation',
    title: 'Escalation',
    intro: 'If you are not satisfied with the outcome, you have further options.',
    blocks: [
      {
        body: 'If your complaint is not resolved to your satisfaction, you may escalate it to the appropriate consumer forum or authority as permitted under applicable Indian law. We will cooperate with any such process.',
      },
    ],
  },
  {
    number: '7',
    id: 'contact-information',
    title: 'Contact information',
    intro: 'You can also reach our general support team.',
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
export const GRIEVANCE_TOC = GRIEVANCE_SECTIONS.map((section) => ({
  number: section.number,
  id: section.id,
  title: section.title,
}));
