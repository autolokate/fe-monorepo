import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { LandingEntitlement, WelcomeViewState } from '@/features/b2b-shared/types-landing';
import {
  getActivationRevision,
  loadActivationPreview,
  readStoredActivationPreviewCode,
  readStoredActivationQrCode,
  type ActivationFlowKind,
} from '@/services/activation/activation-service';

export type UseActivationPreviewOptions = {
  code?: string | null | undefined;
  flow: ActivationFlowKind;
};

export type UseActivationPreviewResult = {
  viewState: WelcomeViewState;
  config: LandingEntitlement | null;
  retry: () => void;
  revision: number;
};

export function useActivationPreview({
  code,
  flow,
}: UseActivationPreviewOptions): UseActivationPreviewResult {
  const [searchParams] = useSearchParams();
  const demo = searchParams.get('demo');
  const [viewState, setViewState] = useState<WelcomeViewState>('loading');
  const [config, setConfig] = useState<LandingEntitlement | null>(null);
  const [revision, setRevision] = useState(() => getActivationRevision());
  const [loadAttempt, setLoadAttempt] = useState(0);

  const previewCode =
    flow === 'prepaid'
      ? code?.trim() || readStoredActivationPreviewCode() || ''
      : code?.trim() || readStoredActivationQrCode() || '';

  const retry = useCallback(() => {
    setViewState('loading');
    setConfig(null);
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (demo === 'loading') {
      setViewState('loading');
      setConfig(null);
      return () => {
        cancelled = true;
      };
    }

    if (!previewCode) {
      setViewState('error');
      setConfig(null);
      return () => {
        cancelled = true;
      };
    }

    setViewState('loading');
    setConfig(null);

    void loadActivationPreview(previewCode, flow).then((result) => {
      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setViewState('error');
        return;
      }

      setConfig(result.entitlement);
      setRevision(result.revision);
      setViewState('default');
    });

    return () => {
      cancelled = true;
    };
  }, [demo, flow, loadAttempt, previewCode]);

  return { viewState, config, retry, revision };
}
