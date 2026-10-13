import {
  BillingFaqSection,
  ClosingCtaSection,
  ComparePlansSection,
  HeroBanner,
  PricingPlansSection,
  SafeStarterSection,
  pricingMetadata,
} from './';
import { BILLING_FAQS } from './components/BillingFaqSection/constants';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqPageJsonLd } from '@/lib/seo';

export const metadata = pricingMetadata;

export default function PricingPage() {
  return (
    <main className="relative">
      <JsonLd data={faqPageJsonLd(BILLING_FAQS)} />
      <HeroBanner />
      <PricingPlansSection />
      <ComparePlansSection />
      <SafeStarterSection />
      <BillingFaqSection />
      <ClosingCtaSection />
    </main>
  );
}
