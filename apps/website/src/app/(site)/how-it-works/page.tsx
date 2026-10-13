import {
  ClosingCtaSection,
  CrashTimelineSection,
  HeroBanner,
  MechanicsFaqSection,
  SmartQrSection,
  howQrWorksMetadata,
} from './';
import { MECHANICS_FAQS } from './components/MechanicsFaqSection/constants';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqPageJsonLd } from '@/lib/seo';

export const metadata = howQrWorksMetadata;

export default function HowQrWorksPage() {
  return (
    <main className="relative">
      <JsonLd data={faqPageJsonLd(MECHANICS_FAQS)} />
      <HeroBanner />
      <CrashTimelineSection />
      <SmartQrSection />
      <MechanicsFaqSection />
      <ClosingCtaSection />
    </main>
  );
}
