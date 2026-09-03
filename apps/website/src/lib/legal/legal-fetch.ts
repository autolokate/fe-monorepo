import { env } from '@/config/env.config';
import { endpoints } from '@/lib/api/endpoints';

const LEGAL_API_BASE_URL = env.NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL.replace(/\/$/, '');

/** Cache legal docs for 5 minutes — they change rarely. */
const LEGAL_REVALIDATE_SECONDS = 300;

export type LegalDocumentKind = 'PRIVACY_POLICY' | 'TERMS';

export interface LegalDocument {
  kind: string;
  version: string;
  title: string;
  /** Sanitised HTML fragment from our backend. */
  body: string;
  effectiveDate: string;
}

/**
 * GET /v1/legal/documents/{kind} — fetched server-side so the content is
 * SEO-visible and cached. Returns `null` on any failure so the page can
 * render a graceful fallback.
 */
export async function fetchLegalDocument(kind: LegalDocumentKind): Promise<LegalDocument | null> {
  try {
    const res = await fetch(`${LEGAL_API_BASE_URL}${endpoints.legal.document(kind)}`, {
      headers: {
        accept: 'application/json',
      },
      next: { revalidate: LEGAL_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const json = (await res.json().catch(() => null)) as { data?: Partial<LegalDocument> } | null;
    const data = json?.data;
    if (!data || typeof data.body !== 'string') return null;

    return {
      kind: data.kind ?? kind,
      version: data.version ?? '',
      title: data.title ?? '',
      body: data.body,
      effectiveDate: data.effectiveDate ?? '',
    };
  } catch {
    return null;
  }
}
