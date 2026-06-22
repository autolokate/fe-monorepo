import {
  FaqGrid,
  HeroBanner,
  HowItWorksSection,
  Philosophy,
  WhatAutolokateOffersSection,
  aboutMetadata,
} from "./";

export const metadata = aboutMetadata;

export default function AboutPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <HowItWorksSection />
      <WhatAutolokateOffersSection />
      <Philosophy />
      <FaqGrid />
    </main>
  );
}
