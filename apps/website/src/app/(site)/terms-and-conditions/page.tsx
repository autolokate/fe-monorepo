import { HelpSection, HeroBanner, TermsContent, termsConditionsMetadata } from './';

export const metadata = termsConditionsMetadata;

export default function TermsAndConditionsPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <TermsContent />
      <HelpSection />
    </main>
  );
}
