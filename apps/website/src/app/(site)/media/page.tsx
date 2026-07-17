import {
  BlogSection,
  ClosingCtaSection,
  HeroBanner,
  SubscribeSection,
  VideosSection,
  mediaMetadata,
} from './';

export const metadata = mediaMetadata;

export default function MediaPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <VideosSection />
      <SubscribeSection />
      <BlogSection />
      <ClosingCtaSection />
    </main>
  );
}
