import type { LandingEntitlement } from '@/features/b2b-shared/types-landing';

import { activationStorageRepository } from '@/platform/storage/repositories/activation-storage-repository';

export type ActivationEphemeral = {
  activationCode: string | null;
  qrCode: string | null;
  subscriptionId: string | null;
  redeemIdempotencyKey: string | null;
  preview: LandingEntitlement | null;
  lastErrorCode: string | null;
  revision: number;
};

let state: ActivationEphemeral = {
  activationCode: null,
  qrCode: null,
  subscriptionId: null,
  redeemIdempotencyKey: null,
  preview: null,
  lastErrorCode: null,
  revision: 0,
};

let inflightPreview: Promise<unknown> | null = null;
let inflightRedeem: Promise<unknown> | null = null;

export function getActivationRevision(): number {
  return state.revision;
}

export function peekActivationCode(): string | null {
  return state.activationCode;
}

export function peekActivationQrCode(): string | null {
  return state.qrCode;
}

export function peekActivationPreview(): LandingEntitlement | null {
  return state.preview;
}

export function peekSubscriptionId(): string | null {
  return state.subscriptionId;
}

export function peekActivationLastError(): string | null {
  return state.lastErrorCode;
}

export function rememberActivationContext(patch: {
  activationCode: string;
  qrCode?: string | null;
}): void {
  state = {
    ...state,
    activationCode: patch.activationCode.trim(),
    qrCode: patch.qrCode?.trim() ?? state.qrCode,
    lastErrorCode: null,
    revision: state.revision + 1,
  };
}

export function updateActivationState(patch: Partial<ActivationEphemeral>): void {
  state = {
    ...state,
    ...patch,
    revision: state.revision + 1,
  };
}

export function clearActivationRedeemAttempt(): void {
  state = {
    ...state,
    subscriptionId: null,
    redeemIdempotencyKey: null,
    lastErrorCode: null,
    revision: state.revision + 1,
  };
}

export function clearActivationCache(): void {
  activationStorageRepository.clear();
  state = {
    activationCode: null,
    qrCode: null,
    subscriptionId: null,
    redeemIdempotencyKey: null,
    preview: null,
    lastErrorCode: null,
    revision: state.revision + 1,
  };
  inflightPreview = null;
  inflightRedeem = null;
}

export function getInflightPreview(): Promise<unknown> | null {
  return inflightPreview;
}

export function setInflightPreview(promise: Promise<unknown> | null): void {
  inflightPreview = promise;
}

export function getInflightRedeem(): Promise<unknown> | null {
  return inflightRedeem;
}

export function setInflightRedeem(promise: Promise<unknown> | null): void {
  inflightRedeem = promise;
}

export function readActivationState(): ActivationEphemeral {
  return state;
}
