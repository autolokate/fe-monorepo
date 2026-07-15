import { FormSection, HeroBanner, SupportSection, contactMetadata } from './';

export const metadata = contactMetadata;

export default function ContactUsPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <FormSection />
      <SupportSection />
    </main>
  );
}
