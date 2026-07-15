'use client';

import {
  getLegalDocument,
  type LegalDocument,
  type LegalDocumentKind,
} from '@/services/legal/legal-client-api';
import { useApiQuery } from '@/hooks/useApiQuery';

/**
 * Client-side read of a legal document (Privacy Policy / Terms). Only fetches
 * while `enabled` (e.g. when its modal is open).
 */
export function useLegalDocument(kind: LegalDocumentKind, enabled = true) {
  return useApiQuery<LegalDocument | null>(() => getLegalDocument(kind), [kind], {
    enabled,
    initialData: null,
  });
}
