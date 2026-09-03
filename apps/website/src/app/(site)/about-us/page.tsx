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

export const metadata = aboutMetadata;

export default function AboutPage() {
  return (
    <main className="relative">
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
