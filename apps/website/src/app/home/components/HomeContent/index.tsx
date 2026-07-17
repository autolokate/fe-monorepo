import { HeroBanner } from '../HeroBanner';
import { WhyItMattersSection } from '../WhyItMattersSection';
import { GettingStartedSection } from '../GettingStartedSection';
import { QrSection } from '../QrSection';
import { WhyAutolokateSection } from '../WhyAutolokateSection';
import { SafetyPacksSection } from '../SafetyPacksSection';
import { TestimonialsSection } from '../TestimonialsSection';
import { FromOwnerSection } from '../FromOwnerSection';
import { ClosingCtaSection } from '../ClosingCtaSection';

/**
 * Top-level home page composition. Each section is self-contained and rendered
 * in order, matching the redesign reference (Figma "01 · Home · D").
 */
export function HomeContent() {
  return (
    <main className="relative">
      <HeroBanner />
      <WhyItMattersSection />
      <GettingStartedSection />
      <QrSection />
      <WhyAutolokateSection />
      <SafetyPacksSection />
      <TestimonialsSection />
      <FromOwnerSection />
      <ClosingCtaSection />
    </main>
  );
}
