import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  FileCheck2,
  FileText,
  Gavel,
  Lock,
  Mail,
  QrCode,
  RefreshCw,
  Scale,
  ShieldAlert,
  Users,
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

export const TC_LAST_UPDATED = "May 25, 2026";
export const TC_EFFECTIVE_DATE = "May 25, 2026";

/**
 * Source of truth for the body of the General Terms & Conditions page.
 * Mirrors the 13-section layout shown on autolokate.com/general-terms-
 * and-conditions, adapted to our Indian operating entity.
 */
export const TC_SECTIONS: TermsSection[] = [
  {
    number: "1",
    id: "introduction",
    title: "Introduction",
    icon: BookOpen,
    intro:
      "These General Terms and Conditions (\u201cTerms\u201d) govern your use of the Autolokate web application, mobile apps, QR sticker storefront, and any related services (collectively, the \u201cPlatform\u201d).",
    blocks: [
      {
        body:
          "The Platform is operated by Autolokate Software Private Limited (\u201cAutolokate\u201d, \u201cwe\u201d, \u201cour\u201d, or \u201cus\u201d). By using the Platform, you agree to be bound by these Terms.",
      },
      {
        body:
          "These General Terms & Conditions work alongside our Privacy Policy. If there is any conflict, the more specific document governs the relevant subject matter.",
      },
    ],
  },
  {
    number: "2",
    id: "eligibility",
    title: "Eligibility",
    icon: Users,
    intro:
      "You must be at least 18 years old and able to enter into a legally binding contract under Indian law to use the Platform.",
    blocks: [
      {
        bullets: [
          "By registering, you represent that the information you provide is accurate, complete, and currently valid.",
          "If you use the Platform on behalf of an organisation, you confirm you are authorised to bind that organisation to these Terms.",
          "Use of the Platform is void where prohibited by local law.",
        ],
      },
    ],
  },
  {
    number: "3",
    id: "account-registration",
    title: "Account Registration",
    icon: Lock,
    intro:
      "Some features require you to register for an account using your mobile number and a one-time password (OTP).",
    blocks: [
      {
        bullets: [
          "You are responsible for maintaining the confidentiality of your account credentials and OTPs.",
          "You agree to notify Autolokate immediately at contact@autolokate.com of any unauthorised access or security breach.",
          "We may suspend or terminate accounts that show signs of fraud, abuse, or material breach of these Terms.",
          "You may delete your account at any time from the profile page; some data may be retained as described in our Privacy Policy.",
        ],
      },
    ],
  },
  {
    number: "4",
    id: "user-content",
    title: "User Content",
    icon: FileText,
    intro:
      "You retain ownership of any content you submit to the Platform (\u201cUser Content\u201d) \u2014 such as reviews, preferences, messages, and uploaded media.",
    blocks: [
      {
        body:
          "By submitting User Content, you grant Autolokate a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, modify, adapt, publish, and distribute the User Content solely for the purpose of operating, promoting, and improving the Platform.",
      },
      {
        body:
          "You are solely responsible for the User Content you submit. Autolokate may remove or refuse to display content that we believe violates these Terms, infringes third-party rights, or breaches applicable law.",
      },
    ],
  },
  {
    number: "5",
    id: "prohibited",
    title: "Prohibited Conduct",
    icon: ShieldAlert,
    intro: "You agree not to:",
    blocks: [
      {
        bullets: [
          "Use the Platform for any illegal purpose or in violation of any local, state, national, or international law.",
          "Violate or infringe the privacy, intellectual-property, or other rights of others.",
          "Interfere with or disrupt the Platform, servers, or networks connected to the Platform.",
          "Attempt to gain unauthorised access to parts of the Platform not intended for public access.",
          "Use the Platform to transmit malware, viruses, or any other harmful code.",
          "Engage in any harassing, threatening, or predatory behaviour towards other users.",
          "Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity.",
          "Collect or harvest personal information about other users without their express consent.",
          "Use the Platform in any manner that could disable, overburden, damage, or impair the site.",
        ],
      },
    ],
  },
  {
    number: "6",
    id: "intellectual-property",
    title: "Intellectual Property Rights",
    icon: Scale,
    intro:
      "The Platform and all of its content, features, and functionality \u2014 including text, images, design, software, vehicle data, and editorial content \u2014 are owned by Autolokate or its licensors and protected by Indian and international copyright, trademark, and other intellectual-property laws.",
    blocks: [
      {
        bullets: [
          "\u201cAutolokate\u201d, the Autolokate logo, and related marks are trademarks of Autolokate Software Private Limited.",
          "Third-party brand names and vehicle marks shown on the Platform are the property of their respective owners.",
          "You are granted a limited, non-transferable, revocable licence to access and use the Platform for personal, non-commercial purposes only.",
        ],
      },
    ],
  },
  {
    number: "7",
    id: "qr-code-usage",
    title: "QR Code Usage",
    icon: QrCode,
    intro:
      "QR code stickers sold through the Platform are intended for personal use by the registered vehicle owner.",
    blocks: [
      {
        bullets: [
          "Each QR sticker is linked to a single user account and should not be transferred, sold, or shared with unauthorised parties.",
          "Scanning an Autolokate QR opens a private, in-app message channel \u2014 the vehicle owner\u2019s phone number is never exposed to the scanner.",
          "We reserve the right to deactivate any QR sticker associated with misuse, fraud, or violation of these Terms.",
        ],
      },
    ],
  },
  {
    number: "8",
    id: "third-party",
    title: "Third-Party Links and Services",
    icon: Users,
    intro:
      "The Platform may contain links to third-party websites, apps, or services that are not owned or controlled by Autolokate.",
    blocks: [
      {
        body:
          "Autolokate has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party services. You acknowledge and agree that Autolokate shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of, or reliance on, any such content, goods, or services available on or through any third-party site or service.",
      },
    ],
  },
  {
    number: "9",
    id: "liability",
    title: "Limitation of Liability",
    icon: AlertTriangle,
    intro:
      "To the maximum extent permitted by applicable law, in no event shall Autolokate, its affiliates, directors, employees, agents, licensors, or service providers be liable for damages of any kind under any legal theory.",
    blocks: [
      {
        body:
          "This includes any direct, indirect, special, incidental, consequential, or punitive damages arising out of or in connection with your use, or inability to use, the Platform \u2014 including without limitation any loss of profits, revenue, data, or goodwill.",
      },
      {
        body:
          "Our aggregate liability for any claim arising from these Terms or the Platform is limited to the greater of (a) the amount you paid to Autolokate in the twelve (12) months preceding the claim, or (b) INR 5,000.",
      },
    ],
  },
  {
    number: "10",
    id: "indemnification",
    title: "Indemnification",
    icon: FileCheck2,
    intro:
      "You agree to indemnify, defend, and hold harmless Autolokate, its affiliates, directors, officers, employees, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys\u2019 fees) arising out of:",
    blocks: [
      {
        bullets: [
          "Your access to or use of the Platform.",
          "Your violation of these Terms or any applicable law.",
          "Your infringement of any intellectual-property or other rights of any third party.",
          "Any User Content you submit through the Platform.",
        ],
      },
    ],
  },
  {
    number: "11",
    id: "modifications",
    title: "Modifications",
    icon: RefreshCw,
    intro:
      "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 7 days\u2019 notice prior to any new terms taking effect.",
    blocks: [
      {
        body:
          "What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Platform after those revisions become effective, you agree to be bound by the revised Terms.",
      },
    ],
  },
  {
    number: "12",
    id: "governing-law",
    title: "Governing Law",
    icon: Gavel,
    intro:
      "These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict-of-law provisions.",
    blocks: [
      {
        body:
          "Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in New Delhi, India \u2014 and you hereby consent to the personal jurisdiction and venue of such courts.",
      },
    ],
  },
  {
    number: "13",
    id: "contact",
    title: "Contact Information",
    icon: Mail,
    intro: "If you have any questions about these Terms, please contact us at:",
    blocks: [
      {
        rows: [
          { label: "Email", value: "contact@autolokate.com" },
          { label: "Support", value: "contact@autolokate.com" },
        ],
      },
      {
        heading: "Mailing Address",
        body: "Autolokate Software Private Limited\nE 90 Chanakya Place Delhi, India",
      },
    ],
  },
];

/** Auto-generated table-of-contents entries (top-level sections only). */
export const TC_TOC = TC_SECTIONS.map((s) => ({
  number: s.number,
  id: s.id,
  title: s.title,
}));
