import {
  ExperienceFlow,
  FlagshipMoment,
  PartnerApps,
  ProductsClosing,
  ProductsHero,
} from './components/ProductsContent';
import { productsMetadata } from './config/metadata';

export const metadata = productsMetadata;

export default function ProductsPage() {
  return (
    <main className="relative">
      <ProductsHero />
      <ExperienceFlow />
      <FlagshipMoment />
      <PartnerApps />
      <ProductsClosing />
    </main>
  );
}
