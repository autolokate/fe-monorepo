import { buildScanPaths } from '@/journey/routing/journey-url-routing';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
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
    const qrCode = resolvePurchaseQrCode();
    if (qrCode) {
      void deps.navigate(buildScanPaths(qrCode).loading);
      return;
    }
    return;
  }

  selectActivationFlow(request.flowId, deps);
}
