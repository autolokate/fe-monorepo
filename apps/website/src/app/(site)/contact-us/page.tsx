import { ClosingCtaSection, ContactSection, HeroBanner, contactMetadata } from './';

export const metadata = contactMetadata;

export default function ContactUsPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <ContactSection />
      <ClosingCtaSection />
    </main>
  );
}
