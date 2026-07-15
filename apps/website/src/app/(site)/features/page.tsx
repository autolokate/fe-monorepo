import {
  CommunitySection,
  CtaSection,
  DailyUtilitySection,
  DriverScoreSection,
  HeroBanner,
  MarketplaceSection,
  MultiVehicleSection,
  SafetyEmergencySection,
  featuresMetadata,
} from './';

export const metadata = featuresMetadata;

export default function FeaturesPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <SafetyEmergencySection />
      <DailyUtilitySection />
      <MarketplaceSection />
      <DriverScoreSection />
      <CommunitySection />
      <MultiVehicleSection />
      <CtaSection />
    </main>
  );
}
