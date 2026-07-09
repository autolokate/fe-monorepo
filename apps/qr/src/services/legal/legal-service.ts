import { getLegalDocuments } from '@autolokate/api-client';

import { getQrBootstrapClient } from '@/platform/api/qr-api-client';
import { getLegalNoticeVersion, saveLegalNoticeVersion } from '@/storage/index';

import { authLogger } from '../auth/auth-logger';

export type LoadLegalDocumentsResult =
  | { ok: true; noticeVersion: string | null; documents: Awaited<ReturnType<typeof getLegalDocuments>>['documents'] }
  | { ok: false; error: unknown };

let inflightLegalDocuments: Promise<LoadLegalDocumentsResult> | null = null;

/** GET /v1/legal/documents — public; only when user opens Privacy or Terms. */
export async function loadLegalDocuments(): Promise<LoadLegalDocumentsResult> {
  if (inflightLegalDocuments) {
    return inflightLegalDocuments;
  }

  const client = getQrBootstrapClient();
  inflightLegalDocuments = (async (): Promise<LoadLegalDocumentsResult> => {
    try {
      const legal = await getLegalDocuments(client);
      const noticeVersion = legal.noticeVersion?.trim() || null;
      if (noticeVersion) {
        saveLegalNoticeVersion(noticeVersion);
      }
      authLogger.info('legal_documents_loaded', {
        noticeVersion,
        documentCount: legal.documents.length,
      });
      return { ok: true, noticeVersion, documents: legal.documents };
    } catch (error) {
      authLogger.warn('legal_documents_failed', { error });
      return { ok: false, error };
    } finally {
      inflightLegalDocuments = null;
    }
  })();

  return inflightLegalDocuments;
}

export function peekCachedLegalNoticeVersion(): string | null {
  return getLegalNoticeVersion();
}
