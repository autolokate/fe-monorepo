import {
  BillingFaqSection,
  ClosingCtaSection,
  ComparePlansSection,
  HeroBanner,
  PricingPlansSection,
  SafeStarterSection,
  pricingMetadata,
} from './';

export const metadata = pricingMetadata;

export default function PricingPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <PricingPlansSection />
      <ComparePlansSection />
      <SafeStarterSection />
      <BillingFaqSection />
      <ClosingCtaSection />
    </main>
  );
}
