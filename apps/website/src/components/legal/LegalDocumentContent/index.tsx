import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchLegalDocument, type LegalDocumentKind } from '@/lib/legal/legal-fetch';

interface LegalDocumentContentProps {
  kind: LegalDocumentKind;
}

function formatEffectiveDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Server component that renders a legal document (Privacy Policy / Terms)
 * fetched from the backend. The body is a trusted HTML fragment from our own
 * API, styled here with arbitrary variants since the app has no prose plugin.
 */
export async function LegalDocumentContent({ kind }: LegalDocumentContentProps) {
  const doc = await fetchLegalDocument(kind);

  return (
    <section className="relative bg-background py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-secondary/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {doc ? (
          <article className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-app-soft backdrop-blur-sm sm:p-10">
            <div
              className="[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h3]:font-display [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-foreground first:[&_h3]:mt-0 sm:[&_h3]:text-xl [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-muted-foreground sm:[&_li]:text-[15px] [&_p]:mt-2.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground sm:[&_p]:text-[15px] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
              // Trusted first-party HTML from our legal-documents API.
              dangerouslySetInnerHTML={{ __html: doc.body }}
            />
          </article>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card/80 p-8 text-center shadow-app-soft backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              We couldn&apos;t load this document right now. Please refresh the page or try again
              shortly.
            </p>
          </div>
        )}

        {doc?.effectiveDate ? (
          <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/[0.05] px-6 py-5 text-center shadow-app-soft">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Effective as of{' '}
              <span className="font-semibold text-foreground">
                {formatEffectiveDate(doc.effectiveDate)}
              </span>
              {doc.version ? ` · version ${doc.version}` : ''}.
            </p>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-app-soft backdrop-blur-sm sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Questions about this?
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
                Our team is happy to walk you through any part of this document.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/contact-us">
                <Mail className="h-4 w-4" aria-hidden />
                Contact our team
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
