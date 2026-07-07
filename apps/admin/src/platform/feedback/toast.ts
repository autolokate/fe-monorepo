export type ToastVariant = 'success' | 'error' | 'info';

export type ToastPayload = {
  message: string;
  variant: ToastVariant;
  durationMs?: number;
};

type ToastListener = (toast: ToastPayload) => void;

let listener: ToastListener | null = null;

export function registerToastListener(next: ToastListener): () => void {
  listener = next;
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}

function emitToast(variant: ToastVariant, message: string, durationMs?: number): void {
  const trimmed = message.trim();
  if (!trimmed || typeof window === 'undefined') {
    return;
  }
  listener?.({ message: trimmed, variant, durationMs });
}

export function showErrorToast(message: string): void {
  emitToast('error', message);
}

export function showSuccessToast(message: string): void {
  emitToast('success', message, 3600);
}

export function showInfoToast(message: string): void {
  emitToast('info', message);
}
