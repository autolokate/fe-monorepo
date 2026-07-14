"use client";

import { endpoints } from "@/lib/api/endpoints";
import { PurchaseApi } from "@/services/purchase/client";

export type LegalDocumentKind = "PRIVACY_POLICY" | "TERMS";

export interface LegalDocument {
  kind: string;
  version: string;
  title: string;
  /** Sanitised HTML fragment from our backend. */
  body: string;
  effectiveDate: string;
}

interface Enveloped<T> {
  data?: T;
}

/**
 * GET /v1/legal/documents/:kind — client-side read of a legal document, used
 * to render Privacy Policy / Terms inside a modal without a page navigation.
 */
export async function getLegalDocument(kind: LegalDocumentKind): Promise<LegalDocument> {
  const res = await PurchaseApi.get<Enveloped<Partial<LegalDocument>>>(
    endpoints.legal.document(kind),
  );
  const d = res.data?.data ?? {};
  return {
    kind: String(d.kind ?? kind),
    version: String(d.version ?? ""),
    title: String(d.title ?? ""),
    body: String(d.body ?? ""),
    effectiveDate: String(d.effectiveDate ?? ""),
  };
}
