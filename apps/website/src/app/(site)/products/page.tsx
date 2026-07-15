import {
  AppShowcaseSection,
  EcosystemSection,
  HeroBanner,
  WhyAutolokateSection,
  productsMetadata,
} from './';

export const metadata = productsMetadata;

export default function ProductsPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <AppShowcaseSection />
      <WhyAutolokateSection />
      <EcosystemSection />
    </main>
  );
}
