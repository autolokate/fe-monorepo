import { pwaScanPaths } from '../../features/post-activation-pwa/constants/pwa-scan-paths.js';
import {
  selectActivationFlow,
  type SelectActivationFlowDeps,
} from '../../journey/navigation/select-activation-flow.js';

import { isActivationFlowId } from './flow-entry-registry.js';
import type { FlowDispatchSource, PlatformFlowId } from './types.js';

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
