import { ProfileSkeleton } from './components/ProfileSkeleton';

/** Shown during navigation / route compile so `/profile` never looks blank. */
export default function ProfileLoading() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-background">
      <div className="relative z-0">
        <ProfileSkeleton />
      </div>
    </main>
  );
}
