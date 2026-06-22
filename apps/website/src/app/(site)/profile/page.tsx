import { profileMetadata } from "./config/metadata";
import { ProfilePageContent } from "./components/ProfilePageContent";

export const metadata = profileMetadata;

export default function ProfilePage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-background">
      {/* Theme-aware hero backdrops from `/public/images` */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat [background-image:url('/images/profile_bg_light.png')] dark:[background-image:url('/images/profile_bg_dark.png')]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-background/65 dark:bg-background/50"
      />
      <div className="relative z-0">
        <ProfilePageContent />
      </div>
    </main>
  );
}
