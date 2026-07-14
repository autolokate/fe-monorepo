import { endpoints } from "@/lib/api/endpoints";

/**
 * Temporary override — legal documents currently live on a separate backend,
 * so these reads bypass the shared staging base URL. Remove once
 * `/v1/legal/documents` is served from `NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL`.
 */
const LEGAL_API_BASE_URL = "https://malisa-noninclusive-davin.ngrok-free.dev";

/** Cache legal docs for 5 minutes — they change rarely. */
const LEGAL_REVALIDATE_SECONDS = 300;

export type LegalDocumentKind = "PRIVACY_POLICY" | "TERMS";

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
export async function fetchLegalDocument(
  kind: LegalDocumentKind,
): Promise<LegalDocument | null> {
  try {
    const res = await fetch(`${LEGAL_API_BASE_URL}${endpoints.legal.document(kind)}`, {
      headers: {
        accept: "application/json",
        // ngrok's free tier serves an HTML interstitial to browsers/servers
        // without this header, which would break JSON parsing.
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: LEGAL_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const json = (await res.json().catch(() => null)) as
      | { data?: Partial<LegalDocument> }
      | null;
    const data = json?.data;
    if (!data || typeof data.body !== "string") return null;

    return {
      kind: String(data.kind ?? kind),
      version: String(data.version ?? ""),
      title: String(data.title ?? ""),
      body: data.body,
      effectiveDate: String(data.effectiveDate ?? ""),
    };
  } catch {
    return null;
  }
}
