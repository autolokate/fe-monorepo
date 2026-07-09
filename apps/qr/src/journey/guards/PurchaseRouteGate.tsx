import { useEffect, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { isAttachedQrLifecycleStatus } from '@/platform/qr/qr-status';
import { qrStorageRepository } from '@/platform/storage/repositories/qr-storage-repository';
import { ensureAttachedPurchaseContext } from '@/services/qr/seed-attached-purchase-from-resolve';

import {
  evaluatePurchaseRouteAccess,
  type PurchaseRouteId,
} from '../state/purchase-journey-state-machine';
import { useJourney } from '../JourneyContext';

type PurchaseRouteGateProps = {
  routeId: PurchaseRouteId;
  children: ReactNode;
};

/** Central purchase segment guard — routes render UI only when access is allowed. */
export function PurchaseRouteGate({ routeId, children }: PurchaseRouteGateProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, updateSession } = useJourney();

  const resolved = qrStorageRepository.readResolved();
  const isAttachedResume = Boolean(
    resolved && isAttachedQrLifecycleStatus(resolved.qrStatus),
  );

  useEffect(() => {
    if (!isAttachedResume || !resolved || session.vehicle?.confirmed) {
      return;
    }
    updateSession(ensureAttachedPurchaseContext(resolved));
  }, [isAttachedResume, resolved, session.vehicle?.confirmed, updateSession]);

  const access = evaluatePurchaseRouteAccess(routeId, session, searchParams);

  useEffect(() => {
    if (!access.allowed && access.redirectTo) {
      void navigate(access.redirectTo, { replace: true });
    }
  }, [access.allowed, access.redirectTo, navigate]);

  if (!access.allowed) {
    return null;
  }

  return children;
}
