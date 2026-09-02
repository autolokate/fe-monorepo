import { HomeReveal } from '../HomeReveal';
import { HomeHero } from '../Hero';
import { ClosingCtaSection } from '../ClosingCtaSection';
import {
  ControlCenterSection,
  DetectionSection,
  ProblemSection,
  ProtectionMomentSection,
  ResponseNetworkSection,
  SmartQrMomentSection,
  TrustMomentSection,
} from '../story';

/**
 * Homepage — safety story → Smart QR → everyday utility → protection.
 */
export function HomeContent() {
  return (
    <main className="relative">
      <HomeHero />

      <HomeReveal>
        <ProblemSection />
      </HomeReveal>
      <HomeReveal delay={40}>
        <DetectionSection />
      </HomeReveal>
      <HomeReveal delay={60}>
        <ResponseNetworkSection />
      </HomeReveal>
      <HomeReveal delay={40}>
        <ControlCenterSection />
      </HomeReveal>
      <HomeReveal delay={60}>
        <SmartQrMomentSection />
      </HomeReveal>

      <HomeReveal delay={40}>
        <ProtectionMomentSection />
      </HomeReveal>
      <HomeReveal delay={60}>
        <TrustMomentSection />
      </HomeReveal>

      <ClosingCtaSection />
    </main>
  );
}
