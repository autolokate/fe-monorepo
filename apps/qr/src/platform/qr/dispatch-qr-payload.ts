import type { PwaScanSession } from '../../features/post-activation-pwa/context/pwa-scan-types';
import { prepaidJourneyPaths } from '../../journey/prepaid/prepaid-routing';
import { selectActivationFlow } from '../../journey/navigation/select-activation-flow';
import type { FlowDispatchDeps } from '../entry/flow-dispatcher';
import { dispatchPlatformFlow } from '../entry/flow-dispatcher';

import { saveQrCode } from '@/storage/index';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository';
import { seedPartnerActivationContext } from '@/services/activation/activation-service';
import { resolveB2bEntitlementCodeFromQrCode } from '@/services/activation/activation-mapper';
import { resolvePartnerWelcomePath } from '@/journey/state/partner-journey-state-machine';

import type { QrActivatedPayload, QrPayload } from './qr-dispatch-contract';

export type QrDispatchDeps = FlowDispatchDeps & {
  updatePwaSession: (patch: Partial<PwaScanSession>) => void;
};

export function applyActivatedQrToPwaSession(
  payload: QrActivatedPayload,
  updatePwaSession: (patch: Partial<PwaScanSession>) => void,
): void {
  updatePwaSession({
    bootstrapComplete: false,
    scannedVehicle: {
      plate: payload.plate,
      modelSummary: payload.modelSummary ?? '',
      protected: payload.protected ?? true,
      planLabel: payload.planLabel,
      fields: [],
    },
  });
}

/** Route a decoded QR payload into the correct activation or PWA flow. */
export function dispatchQrPayload(payload: QrPayload, deps: QrDispatchDeps): void {
  if (payload.type === 'activated') {
    applyActivatedQrToPwaSession(payload, deps.updatePwaSession);
    dispatchPlatformFlow({ flowId: 'postActivation', source: 'qrPayload' }, deps);
    return;
  }

  if (payload.type === 'purchase') {
    saveQrCode(payload.token);
    selectActivationFlow('purchase', deps);
    return;
  }

  const scannedQrCode = qrStorageRepository.readCode()?.trim() ?? '';

  if (payload.type === 'prepaid') {
    const qrCode = scannedQrCode || payload.voucherId;
    const entitlementCode =
      resolveB2bEntitlementCodeFromQrCode(qrCode, payload.voucherId) ?? payload.voucherId;
    seedPartnerActivationContext({
      qrCode,
      entitlementCode,
      partnerKind: 'b2b',
    });
    deps.setSelectedFlow('prepaid');
    deps.setPhase('flow-select');
    deps.updateSession?.({
      prepaid: { voucherId: entitlementCode },
    });
    void deps.navigate(prepaidJourneyPaths.welcome);
    return;
  }

  const qrCode = scannedQrCode || payload.partnerId;
  seedPartnerActivationContext({
    qrCode,
    entitlementCode: payload.partnerId,
    partnerKind: 'b2b2c',
  });
  deps.setSelectedFlow('b2b2c');
  deps.setPhase('flow-select');
  deps.updateSession?.({
    b2b2c: { partnerId: qrCode, variant: payload.variant },
  });
  void deps.navigate(
    resolvePartnerWelcomePath('b2b2c', payload.variant === 'plan-rider' ? 1 : 0),
  );
}
