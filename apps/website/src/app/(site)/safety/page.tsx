import {
  CoveragePlansSection,
  CtaSection,
  HeroBanner,
  InsuranceCoverSection,
  RealSaveStoriesSection,
  ResponseFlowSection,
  safetyMetadata,
} from "./";

export const metadata = safetyMetadata;

export default function SafetyPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <ResponseFlowSection />
      <CoveragePlansSection />
      <InsuranceCoverSection />
      <RealSaveStoriesSection />
      <CtaSection />
    </main>
  );
}
