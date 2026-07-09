import { pwaScanPaths } from '../../features/post-activation-pwa/constants/pwa-scan-paths';
import {
  selectActivationFlow,
  type SelectActivationFlowDeps,
} from '../../journey/navigation/select-activation-flow';

import { isActivationFlowId } from './flow-entry-registry';
import type { FlowDispatchSource, PlatformFlowId } from './types';

export type FlowDispatchRequest = {
  flowId: PlatformFlowId;
  source: FlowDispatchSource;
};

export type FlowDispatchDeps = SelectActivationFlowDeps;

/**
 * Unified platform flow dispatcher.
 * Routes decoded QR payloads and activation flow selection.
 */
export function dispatchPlatformFlow(request: FlowDispatchRequest, deps: FlowDispatchDeps): void {
  if (!isActivationFlowId(request.flowId)) {
    void deps.navigate(pwaScanPaths.loading);
    return;
  }

  selectActivationFlow(request.flowId, deps);
}
