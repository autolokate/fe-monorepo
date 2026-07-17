import { ArticlesSection, ClosingCtaSection, HeroBanner, blogMetadata } from './';

export const metadata = blogMetadata;

export default function BlogPage() {
  return (
    <main className="relative">
      <HeroBanner />
      <ArticlesSection />
      <ClosingCtaSection />
    </main>
  );
}
