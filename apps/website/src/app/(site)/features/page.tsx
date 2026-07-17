import { ClosingCtaSection, HeroBanner, ToolkitSection, featuresMetadata } from './';

export const metadata = featuresMetadata;

export default function FeaturesPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <ToolkitSection />
      <ClosingCtaSection />
    </main>
  );
}
