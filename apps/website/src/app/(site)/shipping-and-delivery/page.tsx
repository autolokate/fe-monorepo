import { HelpSection, HeroBanner, ShippingContent, shippingDeliveryMetadata } from './';

export const metadata = shippingDeliveryMetadata;

export default function ShippingAndDeliveryPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <ShippingContent />
      <HelpSection />
    </main>
  );
}
