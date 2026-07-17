import { HelpSection, HeroBanner, RefundContent, refundCancellationMetadata } from './';

export const metadata = refundCancellationMetadata;

export default function RefundAndCancellationPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <RefundContent />
      <HelpSection />
    </main>
  );
}
