import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  FileCheck2,
  FileText,
  Gavel,
  Lock,
  Mail,
  RefreshCw,
  Scale,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

export interface TermsParagraph {
  /** Optional sub-heading rendered above the body. */
  heading?: string;
  /** Single paragraph of body text. */
  body?: string;
  /** Optional bullet list rendered after the body. */
  bullets?: string[];
  /** Optional label/value rows for contact-style sections. */
  rows?: { label: string; value: string }[];
}

export interface TermsSection {
  /** Numeric prefix shown in the eyebrow and ToC ("1", "8.1" etc). */
  number: string;
  /** Stable slug used for the in-page anchor. */
  id: string;
  /** Section title (without the numeric prefix). */
  title: string;
  /** Lucide icon shown in the eyebrow tile. */
  icon: LucideIcon;
  /** One-line description rendered under the title. */
  intro?: string;
  /** Ordered list of sub-blocks. */
  blocks: TermsParagraph[];
}

export const TERMS_LAST_UPDATED = "May 25, 2026";
export const TERMS_EFFECTIVE_DATE = "May 25, 2026";

/**
 * Source of truth for the body of the Terms of Service page. Each entry
 * maps 1:1 to a numbered section in the rendered document and feeds the
 * sticky table of contents.
 */
export const TERMS_SECTIONS: TermsSection[] = [
  {
    number: "1",
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: BookOpen,
    intro:
      "These Terms of Service (\u201cTerms\u201d) form a binding agreement between you and Autolokate Software Private Limited (\u201cAutolokate\u201d, \u201cwe\u201d, \u201cour\u201d, \u201cus\u201d).",
    blocks: [
      {
        body:
          "By accessing or using autolokate.com, the Autolokate mobile app, or any related service (collectively, the \u201cService\u201d), you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use the Service.",
      },
      {
        body:
          "If you use the Service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.",
      },
    ],
  },
  {
    number: "2",
    id: "eligibility",
    title: "Eligibility",
    icon: UserCheck,
    intro:
      "You must be at least 18 years old and legally capable of entering into a contract under Indian law to use the Service.",
    blocks: [
      {
        bullets: [
          "You confirm that the information you provide during registration is accurate and complete.",
          "You agree to keep your account information up to date.",
          "You are responsible for any activity that occurs under your account.",
          "Use of the Service is void where prohibited by local law.",
        ],
      },
    ],
  },
  {
    number: "3",
    id: "accounts",
    title: "Account Registration & Security",
    icon: Lock,
    intro:
      "Some features require you to sign in with your mobile number using a one-time password (OTP).",
    blocks: [
      {
        bullets: [
          "Keep your phone, OTP, and any session tokens confidential \u2014 do not share them with anyone.",
          "Notify us immediately at contact@autolokate.com if you suspect unauthorised access.",
          "We may suspend or terminate accounts that show signs of fraud, abuse, or violation of these Terms.",
          "You may delete your account at any time from the profile page; some data may be retained as described in our Privacy Policy.",
        ],
      },
    ],
  },
  {
    number: "4",
    id: "use-of-service",
    title: "Use of the Service",
    icon: ShieldCheck,
    intro:
      "We grant you a personal, non-exclusive, non-transferable, revocable licence to access and use the Service for lawful, personal purposes.",
    blocks: [
      {
        heading: "4.1 You agree to",
        bullets: [
          "Use the Service in compliance with all applicable laws and these Terms.",
          "Provide accurate vehicle and contact information so we can deliver relevant features.",
          "Respect other users when sending messages via QR scans or expert sessions.",
        ],
      },
      {
        heading: "4.2 You agree NOT to",
        bullets: [
          "Reverse engineer, decompile, or attempt to extract source code from the Service.",
          "Scrape, harvest, or systematically download catalogue data without our written permission.",
          "Use bots, scripts, or other automated means to access or interact with the Service.",
          "Interfere with the security or integrity of the Service, including by uploading malware.",
          "Use the Service to harass, defraud, or harm any individual or entity.",
        ],
      },
    ],
  },
  {
    number: "5",
    id: "user-content",
    title: "User Content",
    icon: FileText,
    intro:
      "You retain ownership of the content you submit to the Service \u2014 such as reviews, profile data, and messages.",
    blocks: [
      {
        body:
          "By submitting content, you grant Autolokate a worldwide, non-exclusive, royalty-free licence to host, store, display, reproduce, and adapt that content solely for the purpose of operating and improving the Service.",
      },
      {
        body:
          "You are solely responsible for the content you submit. We may remove or refuse to display content that we believe violates these Terms or applicable law.",
      },
    ],
  },
  {
    number: "6",
    id: "intellectual-property",
    title: "Intellectual Property",
    icon: Scale,
    intro:
      "All rights, title, and interest in the Service \u2014 including software, design, logos, vehicle data, and editorial content \u2014 remain the property of Autolokate or its licensors.",
    blocks: [
      {
        bullets: [
          "\u201cAutolokate\u201d, the Autolokate logo, and related marks are trademarks of Autolokate Software Private Limited.",
          "Third-party brand names and vehicle marks are the property of their respective owners and used for identification only.",
          "Nothing in these Terms grants you any right to use our trademarks without prior written consent.",
        ],
      },
    ],
  },
  {
    number: "7",
    id: "prohibited",
    title: "Prohibited Activities",
    icon: ShieldAlert,
    intro:
      "To keep the Service safe and reliable for everyone, the following activities are strictly prohibited.",
    blocks: [
      {
        bullets: [
          "Posting false, misleading, or defamatory content about vehicles, brands, or other users.",
          "Selling, transferring, or sub-licensing access to your account.",
          "Using the Service to send spam or unsolicited commercial communications.",
          "Attempting to gain unauthorised access to systems, accounts, or data not belonging to you.",
          "Circumventing or attempting to circumvent any usage limits, paywalls, or rate limits.",
        ],
      },
    ],
  },
  {
    number: "8",
    id: "purchases",
    title: "Purchases & Payments",
    icon: ShoppingBag,
    intro:
      "Autolokate offers paid products and services \u2014 including QR stickers and expert advisory sessions \u2014 through trusted payment processors.",
    blocks: [
      {
        heading: "8.1 Pricing",
        body:
          "All prices are displayed in Indian Rupees (\u20b9) and include applicable taxes unless stated otherwise. We may change prices at any time; changes apply only to future purchases.",
      },
      {
        heading: "8.2 Orders",
        body:
          "Submitting an order is an offer to purchase. Your order is confirmed once we receive payment and send you an acknowledgement. We may refuse or cancel any order in cases of suspected fraud, stock issues, or pricing errors.",
      },
      {
        heading: "8.3 Payment processing",
        body:
          "Payments are processed by PCI-compliant payment partners. Autolokate does not store full card numbers or banking credentials. You authorise us and our payment partners to charge the payment method you provide for the amount displayed at checkout.",
      },
    ],
  },
  {
    number: "9",
    id: "refunds",
    title: "Refunds & Cancellations",
    icon: RefreshCw,
    intro:
      "Refund eligibility depends on the type of product or service purchased.",
    blocks: [
      {
        heading: "9.1 Physical products (QR stickers)",
        bullets: [
          "Damaged or defective items can be reported within 7 days of delivery for a free replacement or refund.",
          "Custom or personalised QR stickers are non-refundable once production has started.",
          "Refunds are issued to the original payment method within 7\u201310 business days of approval.",
        ],
      },
      {
        heading: "9.2 Expert sessions",
        bullets: [
          "Cancel a session at least 24 hours before the scheduled time for a full refund.",
          "Cancellations within 24 hours are eligible for a 50% refund or a one-time reschedule.",
          "No-shows are not eligible for a refund.",
        ],
      },
      {
        body:
          "Please review our Shipping Policy and Returns & Refunds policy for full details.",
      },
    ],
  },
  {
    number: "10",
    id: "third-party",
    title: "Third-Party Services & Links",
    icon: Users,
    intro:
      "The Service may contain links to third-party websites, apps, or content that are not owned or controlled by Autolokate.",
    blocks: [
      {
        body:
          "We are not responsible for the content, privacy policies, or practices of any third-party services. Your use of those services is governed by their own terms and you do so at your own risk.",
      },
    ],
  },
  {
    number: "11",
    id: "disclaimers",
    title: "Disclaimers",
    icon: AlertTriangle,
    intro:
      "The Service is provided on an \u201cas is\u201d and \u201cas available\u201d basis, without warranties of any kind.",
    blocks: [
      {
        bullets: [
          "Vehicle specifications, prices, and availability are provided for reference only and may change without notice.",
          "Expert sessions provide research and guidance only \u2014 not financial, legal, or insurance advice.",
          "We do not guarantee that the Service will be uninterrupted, secure, or error-free at all times.",
          "Any reliance you place on information from the Service is strictly at your own risk.",
        ],
      },
    ],
  },
  {
    number: "12",
    id: "liability",
    title: "Limitation of Liability",
    icon: ShieldAlert,
    intro:
      "To the maximum extent permitted by applicable law, Autolokate shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.",
    blocks: [
      {
        body:
          "Our aggregate liability for any claim arising from these Terms or the Service is limited to the greater of (a) the amount you paid to Autolokate in the twelve (12) months preceding the claim, or (b) INR 5,000.",
      },
    ],
  },
  {
    number: "13",
    id: "indemnification",
    title: "Indemnification",
    icon: FileCheck2,
    intro:
      "You agree to defend, indemnify, and hold harmless Autolokate, its affiliates, officers, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses arising out of:",
    blocks: [
      {
        bullets: [
          "Your access to or use of the Service.",
          "Your violation of these Terms or any applicable law.",
          "Your infringement of any intellectual-property or other rights of any third party.",
          "Any content you submit or actions you take through the Service.",
        ],
      },
    ],
  },
  {
    number: "14",
    id: "termination",
    title: "Termination",
    icon: XCircle,
    intro:
      "We may suspend or terminate your access to the Service at any time, without notice, if we believe you have violated these Terms or to protect the safety of the Service or its users.",
    blocks: [
      {
        body:
          "You may stop using the Service at any time. Provisions that by their nature should survive termination \u2014 including intellectual-property ownership, disclaimers, limitations of liability, and dispute-resolution clauses \u2014 will continue to apply.",
      },
    ],
  },
  {
    number: "15",
    id: "governing-law",
    title: "Governing Law & Dispute Resolution",
    icon: Gavel,
    intro:
      "These Terms are governed by the laws of India, without regard to its conflict-of-law principles.",
    blocks: [
      {
        body:
          "Any dispute arising out of or in connection with these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in New Delhi, India. The parties will first attempt to resolve disputes amicably through good-faith negotiation before initiating formal proceedings.",
      },
    ],
  },
  {
    number: "16",
    id: "changes",
    title: "Changes to These Terms",
    icon: ScrollText,
    intro:
      "We may update these Terms from time to time. When we make material changes, we will notify you via the Service or by email at least 7 days before the new terms take effect.",
    blocks: [
      {
        body:
          "Continued use of the Service after the effective date constitutes acceptance of the revised Terms. The \u201cLast updated\u201d date at the top of this page always reflects the most recent revision.",
      },
    ],
  },
  {
    number: "17",
    id: "contact",
    title: "Contact Information",
    icon: Mail,
    intro: "Questions about these Terms? We\u2019re happy to help.",
    blocks: [
      {
        heading: "17.1 General Inquiries",
        rows: [
          { label: "Support", value: "contact@autolokate.com" },
          { label: "Legal", value: "contact@autolokate.com" },
        ],
      },
      {
        heading: "17.2 Mailing Address",
        body: "Autolokate Software Private Limited\nE 90 Chanakya Place Delhi, India",
      },
    ],
  },
];

/** Auto-generated table-of-contents entries (top-level sections only). */
export const TERMS_TOC = TERMS_SECTIONS.map((s) => ({
  number: s.number,
  id: s.id,
  title: s.title,
}));
