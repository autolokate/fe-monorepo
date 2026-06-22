import { HeroBanner, TermsContent, termsMetadata } from "./";

export const metadata = termsMetadata;

export default function TermsOfServicePage() {
  return (
    <main className="relative">
      <HeroBanner />
      <TermsContent />
    </main>
  );
}
