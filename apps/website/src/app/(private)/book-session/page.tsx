import { BookSessionContent } from './components/BookSessionContent';
import { FAQ_ITEMS } from './components/Faq/constants';
import { bookSessionMetadata, bookSessionViewport } from './config/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqPageJsonLd } from '@/lib/seo';

export const metadata = bookSessionMetadata;
export const viewport = bookSessionViewport;

export default function BookSessionPage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-background">
      <JsonLd
        data={faqPageJsonLd(FAQ_ITEMS.map((item) => ({ question: item.q, answer: item.a })))}
      />
      <BookSessionContent />
    </main>
  );
}
