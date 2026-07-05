import {
  CrashDetectionSection,
  CtaSection,
  FaqSection,
  HeroBanner,
  QrBackupSection,
  SetupStepsSection,
  howQrWorksMetadata,
} from "./";

export const metadata = howQrWorksMetadata;

export default function HowQrWorksPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <SetupStepsSection />
      <CrashDetectionSection />
      <QrBackupSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
