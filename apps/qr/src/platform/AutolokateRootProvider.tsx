import { PwaScanProvider } from '../features/post-activation-pwa/context/PwaScanContext';
import { JourneyProvider, type JourneyProviderProps } from '../journey/JourneyContext';
import { ToastHost } from './feedback/index';

export type AutolokateRootProviderProps = JourneyProviderProps;

/**
 * Phase 1 root provider — nests existing providers without changing their APIs or session behavior.
 * JourneyProvider (outer) + PwaScanProvider (inner) remain the source of truth for state.
 */
export function AutolokateRootProvider({ children, initialPhase }: AutolokateRootProviderProps) {
  return (
    <JourneyProvider initialPhase={initialPhase}>
      <PwaScanProvider>
        {children}
        <ToastHost />
      </PwaScanProvider>
    </JourneyProvider>
  );
}
