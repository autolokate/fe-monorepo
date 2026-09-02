import {
  ClosingCtaSection,
  HeroBanner,
  InsuranceBenefitsSection,
  OnGroundResponseSection,
  emergencySafetyMetadata,
} from './';

export const metadata = emergencySafetyMetadata;

export default function EmergencySafetyPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <OnGroundResponseSection />
      <InsuranceBenefitsSection />
      <ClosingCtaSection />
    </main>
  );
}
