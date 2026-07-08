import { HeroBanner } from "../HeroBanner";
import { WhyItMattersSection } from "../WhyItMattersSection";
import { GettingStartedSection } from "../GettingStartedSection";
import { QrSection } from "../QrSection";
import { SafetyPacksSection } from "../SafetyPacksSection";
import { WhyAutolokateSection } from "../WhyAutolokateSection";
import { TestimonialsSection } from "../TestimonialsSection";
import { FromOwnerSection } from "../FromOwnerSection";
import { BuiltForIndiaSection } from "../BuiltForIndiaSection";
import { HomeAmbient } from "../HomeAmbient";

/**
 * Top-level home page composition. Each section is self-contained and rendered
 * in order for a clean first-time visitor experience.
 */
export function HomeContent() {
  return (
    <main className="relative">
      <HomeAmbient />
      <HeroBanner />
      <WhyItMattersSection />
      <GettingStartedSection />
      <QrSection />
      <WhyAutolokateSection />
      <SafetyPacksSection />
      <TestimonialsSection />
      <FromOwnerSection />
      <BuiltForIndiaSection />
    </main>
  );
}
