import {
  ClosingCtaSection,
  FaqGrid,
  Founder,
  HeroBanner,
  ImportantToKnow,
  Philosophy,
  aboutMetadata,
} from './';

export const metadata = aboutMetadata;

export default function AboutPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <Philosophy />
      <ImportantToKnow />
      <Founder />
      <FaqGrid />
      <ClosingCtaSection />
    </main>
  );
}
