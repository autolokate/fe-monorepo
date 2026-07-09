export type LegalSection = {
  heading: string;
  body: string;
};

export const privacyPolicySections: LegalSection[] = [
  {
    heading: 'What we collect',
    body: 'Your mobile number, vehicle RC details (via Vahan), emergency contacts, and your live location only during a crash. Plus basic app usage to keep the service reliable.',
  },
  {
    heading: 'Why we use it',
    body: 'To verify your identity, dispatch help in an emergency, show your plan and service history, and run the vehicle services you choose. Nothing more.',
  },
  {
    heading: 'Your DPDP rights',
    body: 'You can access, correct, or erase your data, and withdraw consent at any time from Settings. We act on every request within the DPDP-mandated timeline.',
  },
  {
    heading: 'How we protect it',
    body: 'JWT, KYC and emergency-contact data are encrypted on your device (Android Keystore / iOS Keychain). All traffic is HTTPS. We never sell your data to third parties.',
  },
  {
    heading: 'Grievance Officer',
    body: 'Questions or complaints about your data? Email privacy@autolokate.com and our Grievance Officer will respond promptly.',
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: 'Using Autolokate',
    body: 'Autolokate is a daily companion for your vehicle, safety, utility, marketplace and more. You must be 18+ and the owner or an authorised user of any vehicle you add.',
  },
  {
    heading: 'Safety features',
    body: 'Automatic crash detection and emergency dispatch are best-effort aids, not a guaranteed service. Always call the national emergency number 112 when you can.',
  },
  {
    heading: 'Plans & payments',
    body: 'Plan prices are shown before you pay. Payments are handled by our partners; renewals and refunds follow the plan terms you accept.',
  },
  {
    heading: 'Partners & marketplace',
    body: 'Bookings and services are fulfilled by independent partners. Autolokate connects you with them but is not liable for partner workmanship.',
  },
  {
    heading: 'Changes to these terms',
    body: 'We may update these terms and will notify you in-app. Continuing to use Autolokate means you accept the latest version.',
  },
];

export const legalLastUpdated = 'Last updated 17 Jun 2026';
