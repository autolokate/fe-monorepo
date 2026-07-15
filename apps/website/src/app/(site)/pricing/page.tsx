import {
  ComparePlansSection,
  CtaSection,
  EveryoneGetsSection,
  FaqSection,
  HeroBanner,
  PricingPlansSection,
  StarterAvailabilitySection,
  pricingMetadata,
} from './';

export const metadata = pricingMetadata;

export default function PricingPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <PricingPlansSection />
      <EveryoneGetsSection />
      <ComparePlansSection />
      <StarterAvailabilitySection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
