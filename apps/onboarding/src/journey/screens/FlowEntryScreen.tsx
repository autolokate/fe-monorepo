import { useEffect, useRef } from 'react';
import { AlButton, AlHeading, AlScreenBg, AlText } from '@autolokate/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { FlowOptionCard } from '../../components/compositions/flow-entry/index.js';
import { useThemeMode } from '../../hooks/useThemeMode.js';
import { PwaInstallPrompt } from '../../pwa/index.js';
import { usePwaScan } from '../../features/post-activation-pwa/context/PwaScanContext.js';
import { useQrJourneyEntry } from '../../hooks/qr/useQrJourneyEntry.js';
import { useQrResolve } from '../../hooks/qr/useQrResolve.js';
import {
  ACTIVATION_FLOW_ENTRIES,
  dispatchPlatformFlow,
  dispatchQrPayload,
  hasLegacyQrEntryParams,
  isQrEntryUrl,
  POST_ACTIVATION_FLOW_ENTRY,
} from '../../platform/index.js';
import { extractQrCodeParam } from '../../platform/qr/parse-qr-url.js';
import { useJourney } from '../JourneyContext.js';
import { reportUserError } from '@/platform/feedback/index.js';
import { qrLogger } from '@/services/qr/qr-logger.js';
import { saveQrCode } from '@/storage/index.js';

import './flow-entry-screen.css';

/** Production flow entry — Figma-aligned journey selector. */
export function FlowEntryScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSelectedFlow, setPhase, updateSession, resetForNewQrEntry } = useJourney();
  const { updateSession: updatePwaSession } = usePwaScan();
  const { themeMode, applyTheme } = useThemeMode();
  const { resolveEntry } = useQrResolve();
  const { enterFromSearchParams } = useQrJourneyEntry();
  const qrHandledRef = useRef(false);

  useEffect(() => {
    setPhase('flow-select');
  }, [setPhase]);

  const dispatchDeps = {
    setSelectedFlow,
    setPhase,
    navigate,
    updateSession,
    updatePwaSession,
    resetForNewQrEntry,
  };

  useEffect(() => {
    if (qrHandledRef.current || !isQrEntryUrl(searchParams)) {
      return;
    }

    if (!hasLegacyQrEntryParams(searchParams)) {
      qrHandledRef.current = true;
      void enterFromSearchParams(searchParams, dispatchDeps, { entryPoint: 'flow-entry' }).then(
        (result) => {
          if (!result.ok) {
            reportUserError(qrLogger, 'flow_entry_resolve_failed', result.error);
          }
        },
      );
      return;
    }

    void (async () => {
      const urlCode = extractQrCodeParam(searchParams);
      if (urlCode) {
        resetForNewQrEntry();
        saveQrCode(urlCode);
      }
      const result = await resolveEntry(searchParams);
      if (!result.ok) {
        reportUserError(qrLogger, 'flow_entry_resolve_failed', result.error);
        return;
      }

      qrHandledRef.current = true;
      dispatchQrPayload(result.payload, dispatchDeps);
    })();
  }, [enterFromSearchParams, navigate, resetForNewQrEntry, resolveEntry, searchParams, setPhase, setSelectedFlow, updatePwaSession, updateSession]);

  return (
    <AlScreenBg variant="protected" className="ob-flow-entry">
      <div className="ob-flow-entry__theme-toggle" role="group" aria-label="Theme">
        <AlButton
          size="sm"
          variant={themeMode === 'dark' ? 'primary' : 'ghost'}
          className="ob-flow-entry__theme-btn"
          onClick={() => {
            applyTheme('dark');
          }}
        >
          Dark
        </AlButton>
        <AlButton
          size="sm"
          variant={themeMode === 'light' ? 'primary' : 'ghost'}
          className="ob-flow-entry__theme-btn"
          onClick={() => {
            applyTheme('light');
          }}
        >
          Light
        </AlButton>
      </div>
      <div className="ob-flow-entry__body">
        <div className="ob-flow-entry__heading">
          <AlHeading variant="h2">Activate your protection</AlHeading>
          <AlText tone="muted" className="ob-flow-entry__description">
            Choose your activation type
          </AlText>
        </div>

        <PwaInstallPrompt />

        <ul className="ob-flow-entry__options">
          {ACTIVATION_FLOW_ENTRIES.map((entry) => (
            <li key={entry.id}>
              <FlowOptionCard
                label={entry.label}
                onSelect={() => {
                  dispatchPlatformFlow({ flowId: entry.id, source: 'homeCard' }, dispatchDeps);
                }}
              />
            </li>
          ))}
          <li>
            <FlowOptionCard
              label={POST_ACTIVATION_FLOW_ENTRY.label}
              description={POST_ACTIVATION_FLOW_ENTRY.description}
              onSelect={() => {
                dispatchPlatformFlow(
                  { flowId: POST_ACTIVATION_FLOW_ENTRY.id, source: 'homeCard' },
                  dispatchDeps,
                );
              }}
            />
          </li>
        </ul>
      </div>
    </AlScreenBg>
  );
}
