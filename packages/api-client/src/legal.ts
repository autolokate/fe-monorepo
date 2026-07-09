import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type LegalDocuments = {
  noticeVersion: string | null;
  documents: Array<{
    kind: string;
    version: string;
    title: string;
    url: string;
  }>;
};

/** GET /v1/legal/documents — public notice version for consent grants. */
export async function getLegalDocuments(client: ApiClient): Promise<LegalDocuments> {
  const response = await client.get<unknown>(endpoints.legal.documents, { skipAuth: true });
  return unwrapEnvelope(response) as LegalDocuments;
}
