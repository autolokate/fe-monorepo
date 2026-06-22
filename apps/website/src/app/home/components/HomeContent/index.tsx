import { HeroBanner } from "../HeroBanner";
import { QrSection } from "../QrSection";
import { SafetyPacksSection } from "../SafetyPacksSection";
import { WhyAutolokateSection } from "../WhyAutolokateSection";
import { HowItWorksSection } from "../HowItWorksSection";
import { EmergencyProtectionSection } from "../EmergencyProtectionSection";
import { ExploreAutolokateSection } from "../ExploreAutolokateSection";
import { FeaturedVideosSection } from "../FeaturedVideosSection";
import { HomeAmbient } from "../HomeAmbient";
import { EmergencyBackupSection } from "../EmergencyBackupSection";

/**
 * Top-level home page composition. Sections are arranged so each one is
 * self-contained — `AiMatchedResults` renders nothing until the user has
 * completed the preference finder, so first-time visitors see the marketing
 * sections cleanly without an empty slot in between.
 */
export function HomeContent() {
  return (
    <main className="relative">
      <HomeAmbient />
      <HeroBanner />
      <QrSection />
      <EmergencyBackupSection />
      <SafetyPacksSection />
      <WhyAutolokateSection />
      <HowItWorksSection />
      <EmergencyProtectionSection />
      <ExploreAutolokateSection />
      <FeaturedVideosSection />
      {/* <AiMatchedResults /> */}
    </main>
  );
}
