import {
  AppShowcaseSection,
  ClosingCtaSection,
  EcosystemSection,
  HeroBanner,
  productsMetadata,
} from './';

export const metadata = productsMetadata;

export default function ProductsPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <AppShowcaseSection />
      <EcosystemSection />
      <ClosingCtaSection />
    </main>
  );
}
