import { GrievanceContent, grievanceRedressalMetadata, HelpSection, HeroBanner } from './';

export const metadata = grievanceRedressalMetadata;

export default function GrievanceRedressalPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <GrievanceContent />
      <HelpSection />
    </main>
  );
}
