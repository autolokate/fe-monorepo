import { HeroBanner, MediaBody, mediaMetadata } from "./";

export const metadata = mediaMetadata;

export default function MediaPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <MediaBody />
    </main>
  );
}
