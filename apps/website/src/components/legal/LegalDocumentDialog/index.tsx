'use client';

import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLegalDocument } from '@/hooks/legal';
import type { LegalDocumentKind } from '@/services/legal/legal-client-api';

const FALLBACK_TITLE: Record<LegalDocumentKind, string> = {
  PRIVACY_POLICY: 'Privacy Policy',
  TERMS: 'Terms & Conditions',
};

interface LegalDocumentDialogProps {
  kind: LegalDocumentKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Shows a legal document (Privacy Policy / Terms) in a modal — heading + the
 * HTML body fetched from the backend, no page navigation.
 */
export function LegalDocumentDialog({ kind, open, onOpenChange }: LegalDocumentDialogProps) {
  const { data, isLoading, isError } = useLegalDocument(kind, open);
  const heading = data?.title || FALLBACK_TITLE[kind];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
        </DialogHeader>
        <div className="-mr-2 max-h-[70vh] overflow-y-auto pr-2">
          {isLoading && !data?.body ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            </div>
          ) : data?.body ? (
            <div
              className="[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h3]:font-display [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-foreground first:[&_h3]:mt-0 [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-muted-foreground [&_p]:mt-2.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
              // Trusted first-party HTML from our legal-documents API.
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {isError
                ? "We couldn't load this document right now. Please try again shortly."
                : 'Nothing to show.'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
