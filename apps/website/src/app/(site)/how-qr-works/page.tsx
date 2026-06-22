import {
  HeroBanner,
  HowQrWorksSection,
  ProductsGrid,
  RealWorldSituationsSection,
  WatchGuideSection,
  howQrWorksMetadata,
} from "./";

export const metadata = howQrWorksMetadata;

export default function HowQrWorksPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <WatchGuideSection />
      <HowQrWorksSection />
      <ProductsGrid />
      <RealWorldSituationsSection />
    </main>
  );
}
