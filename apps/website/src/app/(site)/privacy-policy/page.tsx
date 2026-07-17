import { HelpSection, HeroBanner, PolicyContent, privacyMetadata } from './';

export const metadata = privacyMetadata;

export default function PrivacyPolicyPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <PolicyContent />
      <HelpSection />
    </main>
  );
}
