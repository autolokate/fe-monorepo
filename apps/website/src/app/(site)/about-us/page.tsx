import {
  ClosingCtaSection,
  FaqGrid,
  Founder,
  HeroBanner,
  ImportantToKnow,
  Philosophy,
  aboutMetadata,
} from './';
import { ImpactSection } from './components/ImpactSection';
import { MissionSection } from './components/MissionSection';
import { NetworkStrip } from './components/NetworkStrip';
import { FAQS } from './components/FaqGrid/constants';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqPageJsonLd } from '@/lib/seo';

export const metadata = aboutMetadata;

export default function AboutPage() {
  return (
    <main className="relative">
      <JsonLd data={faqPageJsonLd(FAQS)} />
      <HeroBanner />
      <NetworkStrip />
      <ImpactSection />
      <MissionSection />
      <Philosophy />
      <ImportantToKnow />
      <Founder />
      <FaqGrid />
      <ClosingCtaSection />
    </main>
  );
}
