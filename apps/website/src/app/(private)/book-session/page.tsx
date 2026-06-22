import { BookSessionContent } from "./components/BookSessionContent";
import { bookSessionMetadata, bookSessionViewport } from "./config/metadata";

export const metadata = bookSessionMetadata;
export const viewport = bookSessionViewport;

export default function BookSessionPage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-background">
      <BookSessionContent />
    </main>
  );
}
