import {
  ClosingCtaSection,
  CrashTimelineSection,
  HeroBanner,
  MechanicsFaqSection,
  SmartQrSection,
  howQrWorksMetadata,
} from './';

export const metadata = howQrWorksMetadata;

export default function HowQrWorksPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <CrashTimelineSection />
      <SmartQrSection />
      <MechanicsFaqSection />
      <ClosingCtaSection />
    </main>
  );
}
