import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  ClipboardList,
  Cookie,
  Database,
  FileCheck2,
  Globe2,
  Lock,
  Mail,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';

export interface PolicyParagraph {
  /** Optional sub-heading rendered above the body. */
  heading?: string;
  /** Single paragraph of body text. */
  body?: string;
  /** Optional bullet list rendered after the body. */
  bullets?: string[];
  /** Optional label/value rows for contact-style sections. */
  rows?: { label: string; value: string }[];
}

export interface PolicySection {
  /** Numeric prefix shown in the eyebrow and ToC ("1", "14.2" etc). */
  number: string;
  /** Stable slug used for the in-page anchor. */
  id: string;
  /** Section title (without the numeric prefix). */
  title: string;
  /** Lucide icon shown in the eyebrow tile. */
  icon: LucideIcon;
  /** One-line description rendered under the title. */
  intro?: string;
  /** Ordered list of sub-blocks. Most sections have a single block. */
  blocks: PolicyParagraph[];
}

export const PRIVACY_LAST_UPDATED = 'May 25, 2026';
export const PRIVACY_EFFECTIVE_DATE = 'May 25, 2026';

/**
 * Source of truth for the body of the Privacy Policy page. Each entry maps
 * 1:1 to a numbered section in the rendered document and feeds the sticky
 * table of contents.
 */
export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    number: '1',
    id: 'introduction',
    title: 'Introduction',
    icon: BookOpen,
    intro:
      'Autolokate Software Private Limited (\u201cAutolokate\u201d, \u201cwe\u201d, \u201cour\u201d, or \u201cus\u201d) respects your privacy and is committed to protecting your personal information.',
    blocks: [
      {
        body: 'This Privacy Policy explains how we collect, use, share, and safeguard information when you visit autolokate.com, use the Autolokate mobile app, scan an Autolokate QR sticker, or otherwise interact with our services (collectively, the \u201cService\u201d). By using the Service you agree to the practices described here.',
      },
      {
        body: 'We follow a privacy-first approach: we collect only what is needed to operate the Service, store it securely, and never sell your personal information to third parties.',
      },
    ],
  },
  {
    number: '2',
    id: 'information-we-collect',
    title: 'Information We Collect',
    icon: Database,
    intro:
      'We collect information that you provide directly, information generated as you use the Service, and information from trusted third parties.',
    blocks: [
      {
        heading: '2.1 Information you provide',
        bullets: [
          'Account details such as your name, mobile number, email, and city.',
          'Vehicle details you save \u2014 brand, model, variant, registration plate, and preferences.',
          'Messages you send through our contact forms, support tickets, or expert sessions.',
          'Payment details processed by our PCI-compliant payment partners (we never store full card numbers).',
        ],
      },
      {
        heading: '2.2 Information collected automatically',
        bullets: [
          'Device information \u2014 device type, operating system, browser, language, and IP address.',
          'Usage data \u2014 pages viewed, features used, session duration, and referring URLs.',
          'Approximate location derived from your IP for city-level pricing and content.',
          'Cookies and similar technologies (see Section 8 for details).',
        ],
      },
      {
        heading: '2.3 Information from third parties',
        body: 'We may receive limited information from authentication providers, analytics partners, OEM catalogue feeds, and payment gateways. We use this information only for the purposes described in Section 3.',
      },
    ],
  },
  {
    number: '3',
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    icon: Sparkles,
    intro: 'Your information powers a personalised, secure, and reliable Service.',
    blocks: [
      {
        bullets: [
          'Provide, maintain, and improve the Service \u2014 catalogue search, comparisons, expert sessions, and QR alerts.',
          'Personalise recommendations based on your preferences and saved vehicles.',
          'Process bookings, payments, and refunds for the expert advisory and QR-sticker storefront.',
          'Communicate with you about your account, transactions, OTP-based logins, and service updates.',
          'Detect, prevent, and respond to fraud, abuse, and security incidents.',
          'Comply with applicable legal obligations and enforce our Terms & Conditions.',
        ],
      },
    ],
  },
  {
    number: '4',
    id: 'information-sharing',
    title: 'Information Sharing & Disclosure',
    icon: Users,
    intro:
      'We never sell or rent your personal information. We share it only in the limited circumstances described below.',
    blocks: [
      {
        bullets: [
          'With service providers (cloud hosting, analytics, payments, SMS/email delivery) bound by confidentiality and data-protection agreements.',
          'With our expert advisors, strictly limited to the information needed to deliver the session you booked.',
          'When you scan an Autolokate QR sticker, with the vehicle owner via an in-app message \u2014 your phone number is never exposed to the other party.',
          'To comply with applicable law, regulation, legal process, or governmental requests.',
          'To protect the rights, property, or safety of Autolokate, our users, or the public.',
          'In connection with a merger, acquisition, or sale of assets, with notice to affected users.',
        ],
      },
    ],
  },
  {
    number: '5',
    id: 'data-security',
    title: 'Data Security',
    icon: ShieldCheck,
    intro:
      'We use industry-standard administrative, technical, and physical safeguards to protect your information.',
    blocks: [
      {
        bullets: [
          'Encryption in transit using TLS 1.2+ for all client-server traffic.',
          'Encryption at rest for databases and backups.',
          'Role-based access controls, audit logs, and least-privilege principles for internal systems.',
          'Periodic security reviews, dependency scanning, and incident-response drills.',
        ],
      },
      {
        body: 'No method of transmission or storage is 100% secure. If we ever become aware of a data breach affecting your personal information, we will notify you and the appropriate authorities as required by applicable law.',
      },
    ],
  },
  {
    number: '6',
    id: 'data-retention',
    title: 'Data Retention',
    icon: ScrollText,
    intro:
      'We keep your information only for as long as it is needed to provide the Service or comply with the law.',
    blocks: [
      {
        bullets: [
          'Account data \u2014 retained while your account is active and for up to 12 months after deletion to honour legal and accounting requirements.',
          'Transactional records \u2014 retained for up to 8 years to comply with Indian tax and financial regulations.',
          'Support correspondence \u2014 retained for up to 24 months to maintain context for future requests.',
          'Anonymised analytics \u2014 may be retained indefinitely as it can no longer identify you.',
        ],
      },
    ],
  },
  {
    number: '7',
    id: 'your-rights',
    title: 'Your Rights & Choices',
    icon: UserCheck,
    intro:
      'You remain in control of your data. Subject to applicable law, you can exercise the following rights at any time.',
    blocks: [
      {
        bullets: [
          'Access \u2014 request a copy of the personal information we hold about you.',
          'Correction \u2014 update inaccurate or incomplete information through your profile or by contacting us.',
          'Deletion \u2014 ask us to delete your personal information when it is no longer required.',
          'Withdraw consent \u2014 opt out of marketing communications or revoke previously granted permissions.',
          'Portability \u2014 receive an export of your data in a structured, commonly used format.',
          'Lodge a complaint with the relevant data-protection authority if you believe your rights have been violated.',
        ],
      },
      {
        body: 'To exercise any of these rights, email privacy@autolokate.com from the address linked to your account. We respond within the timeframes listed in Section 14.3.',
      },
    ],
  },
  {
    number: '8',
    id: 'cookies',
    title: 'Cookies & Tracking Technologies',
    icon: Cookie,
    intro:
      'We use cookies and similar technologies to keep you signed in, remember preferences, and understand how the Service is used.',
    blocks: [
      {
        bullets: [
          'Essential cookies \u2014 required for authentication, security, and core functionality.',
          'Preference cookies \u2014 remember settings such as your selected vehicle category or city.',
          'Analytics cookies \u2014 help us understand aggregate usage so we can improve features.',
        ],
      },
      {
        body: 'You can control non-essential cookies through your browser settings. Disabling certain cookies may affect parts of the Service \u2014 for example, you may be signed out more frequently.',
      },
    ],
  },
  {
    number: '9',
    id: 'childrens-privacy',
    title: "Children's Privacy",
    icon: Lock,
    intro:
      'The Service is intended for users aged 18 and above. We do not knowingly collect personal information from children.',
    blocks: [
      {
        body: 'If you believe a child has provided us with personal information, please contact us at privacy@autolokate.com and we will take steps to delete that information promptly.',
      },
    ],
  },
  {
    number: '10',
    id: 'international-transfers',
    title: 'International Data Transfers',
    icon: Globe2,
    intro:
      'Autolokate primarily stores user data on servers located in India. Some of our service providers may process data outside India.',
    blocks: [
      {
        body: 'When we transfer personal information across borders, we rely on appropriate safeguards \u2014 such as standard contractual clauses or transfer-impact assessments \u2014 to ensure your data continues to receive an adequate level of protection.',
      },
    ],
  },
  {
    number: '11',
    id: 'policy-changes',
    title: 'Changes to This Privacy Policy',
    icon: RefreshCw,
    intro:
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.',
    blocks: [
      {
        body: 'When we make material changes, we will notify you via the Service or by email at least 7 days before the new policy takes effect. The \u201cLast updated\u201d date at the top of this page always reflects the most recent revision.',
      },
    ],
  },
  {
    number: '12',
    id: 'third-party-services',
    title: 'Third-Party Services',
    icon: ClipboardList,
    intro:
      'Autolokate integrates with carefully vetted third-party services to deliver core features.',
    blocks: [
      {
        bullets: [
          'Authentication \u2014 SMS providers for OTP delivery.',
          'Payments \u2014 PCI-compliant processors such as Razorpay or Stripe.',
          'Hosting & analytics \u2014 reputable cloud providers and privacy-respecting analytics tools.',
          'Content & catalogue \u2014 OEM data feeds, mapping providers, and video embeds.',
        ],
      },
      {
        body: 'These services have their own privacy policies. We encourage you to review them. Autolokate is not responsible for the privacy practices of third-party sites or services that are linked from the Service.',
      },
    ],
  },
  {
    number: '13',
    id: 'indian-law-compliance',
    title: 'Compliance with Indian Laws',
    icon: FileCheck2,
    intro:
      'We process personal information in line with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023.',
    blocks: [
      {
        bullets: [
          'Emergency disclosures may be made to law-enforcement and government agencies in accordance with applicable Indian law.',
          'Sensitive personal data is collected only with explicit consent and used solely for the stated purpose.',
          'You may withdraw your consent at any time by contacting our Privacy Officer (see Section 14).',
          'Emergency updates may be made for security or legal compliance reasons.',
        ],
      },
    ],
  },
  {
    number: '14',
    id: 'contact-information',
    title: 'Contact Information',
    icon: Mail,
    intro: 'We are happy to answer any questions you have about this policy.',
    blocks: [
      {
        heading: '14.1 Privacy Inquiries',
        body: 'For questions about this Privacy Policy or our privacy practices:',
        rows: [
          { label: 'Privacy Officer', value: 'contact@autolokate.com' },
          { label: 'General Support', value: 'contact@autolokate.com' },
          { label: 'Data Protection Officer', value: 'contact@autolokate.com' },
        ],
      },
      {
        heading: '14.2 Mailing Address',
        body: 'Autolokate Software Private Limited\nE 90 Chanakya Place Delhi, India',
      },
      {
        heading: '14.3 Response Times',
        bullets: [
          'We respond to privacy inquiries within 7 business days',
          'Complex requests may require up to 30 days for completion',
          'Urgent privacy concerns will be addressed immediately',
          'We provide status updates for longer-processing requests',
        ],
      },
    ],
  },
  {
    number: '15',
    id: 'definitions',
    title: 'Definitions',
    icon: ScrollText,
    intro:
      'The following terms are used throughout this Privacy Policy with the meanings set out below.',
    blocks: [
      {
        rows: [
          {
            label: 'Personal Information',
            value:
              'Any information that identifies, relates to, or could reasonably be linked with you.',
          },
          {
            label: 'Processing',
            value:
              'Any operation performed on personal information, including collection, use, storage, and disclosure.',
          },
          {
            label: 'Service Providers',
            value: 'Third-party companies that provide services on our behalf under contract.',
          },
          {
            label: 'User-Generated Content',
            value: 'Any content created and shared by users within our Service.',
          },
        ],
      },
    ],
  },
];

/** Auto-generated table-of-contents entries (top-level sections only). */
export const PRIVACY_TOC = PRIVACY_SECTIONS.map((s) => ({
  number: s.number,
  id: s.id,
  title: s.title,
}));
