import { Suspense } from 'react';
import { ClosingCtaSection } from './components/ClosingCtaSection';
import { MediaHub } from './components/MediaHub';
import { mediaMetadata } from './config/metadata';

export const metadata = mediaMetadata;

function MediaHubFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        background: 'var(--mkt-warm-white)',
      }}
      aria-hidden="true"
    />
  );
}

export default function MediaPage() {
  return (
    <main className="relative">
      <Suspense fallback={<MediaHubFallback />}>
        <MediaHub />
      </Suspense>
      <ClosingCtaSection />
    </main>
  );
}
